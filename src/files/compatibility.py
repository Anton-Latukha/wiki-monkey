#!/usr/bin/python3

import os
import re

SRC_PATH = ".."
ALIB_SRC_PATH = "../../../js-aux-lib/src"
MAIN_SCRIPT = os.path.join(SRC_PATH, "WikiMonkey.js")
CFG_PATH = os.path.join(SRC_PATH, "configurations")
CHROMIUM_PATH = os.path.join(CFG_PATH, "chromium")
OPERA_PATH = os.path.join(CFG_PATH, "opera")
STALONE_PATH = os.path.join(CFG_PATH, "standalone")
EXTENSIONS = ((CHROMIUM_PATH, "chromium"),
              (OPERA_PATH, "opera"),
              (STALONE_PATH, "standalone"))
GM_API_EMULATION = os.path.join(ALIB_SRC_PATH, "GMAPIEmulation.js")
STANDALONE = {
    "start": "\nif ({}) {{\n",
    "match": "location.href.match({})",
    "join": " ||\n    ",
    "conditions": {
        "http://*.wikipedia.org/*": "/^http:\/\/[a-z]+\.wikipedia\.org/i",
        "https://wiki.archlinux.org/*": "/^https:\/\/wiki\.archlinux\.org/i",
    },
    "end": "\n}\n",
}


def get_script(s):
    code = s.read()
    match = re.match('^\s*?/\*.+?\*/.*?\n(.+?)\n*$', code, re.DOTALL)
    if match:
        code = match.group(1)
    return code + "\n"


def get_licence():
    with open(MAIN_SCRIPT, 'r') as s:
        match = re.match('\s*?(/\*.+?\*/)', s.read(), re.DOTALL)
        return match.group(1) + "\n"


def get_GM_API_emulation():
    with open(GM_API_EMULATION, 'r') as s:
        return get_script(s)


def process_line(m, g, functions, match_urls, header, line):
    id = re.match('^// @id ([^ \n]+)', line)
    version = re.match('^// @version ([^ \n]+)', line)
    update_url = re.match('^// @updateURL (.+/configurations)(/.+)'
                          '(\.(meta|user)\.js)$', line)
    download_url = re.match('^// @downloadURL (.+/configurations)(/.+)'
                            '(\.(meta|user)\.js)$', line)
    matches = re.match('^// @match (.+)$', line)
    alib_requires = re.match('^// @require https://raw\.github\.com/kynikos/'
                             'js-aux-lib/[^/]+/src/(.+\.js)', line)
    requires = re.match('^// @require https://raw\.github\.com/kynikos/'
                        'wiki-monkey/[^/]+/src/(.+\.js)', line)

    if alib_requires:
        source = os.path.join(ALIB_SRC_PATH, alib_requires.group(1))
        with open(source, 'r') as s:
            functions += get_script(s)
    elif requires:
        source = os.path.join(SRC_PATH, requires.group(1))
        with open(source, 'r') as s:
            functions += get_script(s)
    elif m[1] == "standalone":
        if matches:
            match_urls.append(STANDALONE["conditions"][matches.group(1)])
        elif line[:18] == "// ==/UserScript==":
            header = False
            # If functions is empty it means it's a meta file
            if functions == "":
                pass
            else:
                # Not +=
                line = (get_licence() + STANDALONE["start"].format(
                                                        STANDALONE["join"].join(
                            [STANDALONE["match"].format(m) for m in match_urls])
                                         ) + get_GM_API_emulation() + functions)
            g.write(line)
        elif not header:
            g.write(line)
    else:
        if id:
            g.write("// @id " + id.group(1) + "-" + m[1] + "\n")
        elif version:
            g.write("// @version " + version.group(1) + "-" + m[1] + "\n")
        elif update_url:
            g.write("// @updateURL " + update_url.group(1) + "/" + m[1] +
                  update_url.group(2) + "-" + m[1] + update_url.group(3) + "\n")
        elif download_url:
            g.write("// @downloadURL " + download_url.group(1) + "/" + m[1] +
                                            download_url.group(2) + "-" + m[1] +
                                                   download_url.group(3) + "\n")
        elif matches:
            if m[1] == "chromium":
                g.write(line)
            elif m[1] == "opera":
                g.write("// @include " + matches.group(1) + "\n")
        elif line[:18] == "// ==/UserScript==":
            header = False
            # If functions is empty it means it's a meta file
            if functions == "":
                pass
            else:
                line += "\n" + get_licence() + get_GM_API_emulation() + \
                                                                       functions
            g.write(line)
        else:
            g.write(line)

    return functions, header


def main():
    files = os.listdir(CFG_PATH)
    for name in files:
        file = os.path.join(CFG_PATH, name)
        ext = name[-8:]
        for m in EXTENSIONS:
            if ext == ".user.js" or (ext == ".meta.js" and m[1] != "standalone"
                                                                              ):
                with open(file, 'r') as f:
                    cfile = os.path.join(m[0], name[:-8] + "-" + m[1] +
                                    name[-3 if (m[1] == "standalone") else -8:])
                    with open(cfile, 'w'):
                        pass
                    with open(cfile, 'a') as g:
                        functions = ""
                        match_urls = []
                        header = True
                        for line in f:
                            functions, header = process_line(m, g, functions,
                                                       match_urls, header, line)
                        else:
                            if m[1] == "standalone":
                                g.write(STANDALONE["end"])

if __name__ == '__main__':
    main()
