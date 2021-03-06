#!/usr/bin/env node

/* eslint-disable no-sync */
const path = require('path')
const fs = require('fs')
const process = require('process')
const commander = require('commander')
const {spawnSync} = require('child_process')
const {jspack} = require('@kynikos/browserify-helpers')

const SRCDIR = './src/'
const SRCLOCAL = ['local.js']
const SRCPRODUCTION = ['ArchWiki.js', 'Wikipedia.js']
const DISTDIR = './dist/'
const AUXDIR = './auxiliary/'

commander
  .command('build')
  .description('recompile user scripts')
  // Note that --version is reserved by commander.js; I could override it but
  // it gets assigned the default value if I don't specify it
  .option('-v, --release-version <STRING>', 'assign a version string to the build; \
if not given, only the testing script is recompiled')
  .action(({releaseVersion}) => {
    build(releaseVersion)
  })

commander
  .command('gencert')
  .description('generate the certificate to serve the user scripts from localhost')
  .action(() => genCert())

commander
  .command('serve')
  .description('serve the user scripts on localhost')
  .action(() => serve())

commander.parse(process.argv)


function run(command, ...rest) {
  const adjustedLength = Math.max(rest.length, 1)


  const args = rest.slice(0, adjustedLength - 1)


  const options = rest[adjustedLength - 1]
  spawnSync(command, args, {
    stdio: [process.stdin, process.stdout, process.stderr],
    ...options,
  })
}


function buildScript({
  fname,
  distdir,
  minified = true,
  production = true,
}) {
  const srcfile = path.join(SRCDIR, fname)
  const {name, ext} = path.parse(fname)
  const distfile = path.join(distdir, `WikiMonkey-${name}.js`)

  const envify = production ? {NODE_ENV: 'production'} : false

  console.log(`Compiling ${distfile} ...`)
  jspack(srcfile, distfile, {
    // Note how it's necessary to use scssify, not sassify, since the latter
    // seems to have problems with escaped characters such as those used as
    // icons in Element UI
    scssify: true,
    envify,
    debug: true,
    licensify: true,
  })

  if (minified) {
    const distfileMin = path.join(distdir, `WikiMonkey-${name}.min.js`)
    console.log(`Compiling ${distfileMin} ...`)
    jspack(srcfile, distfileMin, {
      scssify: true,
      envify,
      licensify: true,
      // This application relies on the plugin constructor names, so use
      // UglifyJS' keep_fnames option (a bug from not using this option
      // would be that the default plugin in the bot's select widget is
      // not correctly selected because its name isn't recognized in the
      // minified version)
      uglify: {keep_fnames: true},
    })
  }
}


function build(version) {
  if (version) {
    spawnSync('npm', ['--allow-same-version',
      '--no-git-tag-version',
      'version', version])
  }

  for (const fname of SRCLOCAL) {
    buildScript({
      fname,
      distdir: AUXDIR,
      minified: false,
      production: false,
    })
  }

  if (version) {
    for (const fname of SRCPRODUCTION) {
      buildScript({
        fname,
        distdir: DISTDIR,
      })
    }
  }
}


function genCert() {
  run('openssl', 'genrsa', '-out', 'dev-key.pem', '2048', {cwd: AUXDIR})
  run(
    'openssl', 'req', '-new', '-key', 'dev-key.pem', '-out', 'dev.csr',
    {cwd: AUXDIR}
  )
  run(
    'openssl', 'x509', '-req', '-in', 'dev.csr', '-signkey',
    'dev-key.pem', '-out', 'dev-cert.pem', {cwd: AUXDIR}
  )
  fs.unlinkSync(path.join(AUXDIR, 'dev.csr'))
}


function serve() {
  run(
    './node_modules/.bin/http-server',
    '--cors',
    '--ssl',
    '--cert', path.join(AUXDIR, 'dev-cert.pem'),
    '--key', path.join(AUXDIR, 'dev-key.pem'),
    {},
  )
}
