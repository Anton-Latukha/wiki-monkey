// ==UserScript==
// @id wiki-monkey-bot
// @name Wiki Monkey
// @namespace https://github.com/kynikos/wiki-monkey
// @author Dario Giovannetti <dev@dariogiovannetti.net>
// @version 1.11.2-bot
// @description MediaWiki-compatible bot and editor assistant that runs in the browser
// @website https://github.com/kynikos/wiki-monkey
// @supportURL https://github.com/kynikos/wiki-monkey/issues
// @updateURL https://raw.github.com/kynikos/wiki-monkey/master/src/configurations/WikiMonkey-bot.meta.js
// @downloadURL https://raw.github.com/kynikos/wiki-monkey/master/src/configurations/WikiMonkey-bot.user.js
// @icon http://cloud.github.com/downloads/kynikos/wiki-monkey/wiki-monkey.png
// @icon64 http://cloud.github.com/downloads/kynikos/wiki-monkey/wiki-monkey-64.png
// @match http://*.wikipedia.org/*
// @match https://wiki.archlinux.org/*
// @require https://raw.github.com/kynikos/js-aux-lib/1.0/src/Async.js
// @require https://raw.github.com/kynikos/js-aux-lib/1.0/src/Compatibility.js
// @require https://raw.github.com/kynikos/js-aux-lib/1.0/src/HTTP.js
// @require https://raw.github.com/kynikos/js-aux-lib/1.0/src/Obj.js
// @require https://raw.github.com/kynikos/js-aux-lib/1.0/src/RegEx.js
// @require https://raw.github.com/kynikos/js-aux-lib/1.0/src/Str.js
// @require https://raw.github.com/kynikos/wiki-monkey/1.11.2/src/WikiMonkey.js
// @require https://raw.github.com/kynikos/wiki-monkey/1.11.2/src/modules/Bot.js
// @require https://raw.github.com/kynikos/wiki-monkey/1.11.2/src/modules/Cat.js
// @require https://raw.github.com/kynikos/wiki-monkey/1.11.2/src/modules/Diff.js
// @require https://raw.github.com/kynikos/wiki-monkey/1.11.2/src/modules/Editor.js
// @require https://raw.github.com/kynikos/wiki-monkey/1.11.2/src/modules/Interlanguage.js
// @require https://raw.github.com/kynikos/wiki-monkey/1.11.2/src/modules/Log.js
// @require https://raw.github.com/kynikos/wiki-monkey/1.11.2/src/modules/MW.js
// @require https://raw.github.com/kynikos/wiki-monkey/1.11.2/src/modules/Parser.js
// @require https://raw.github.com/kynikos/wiki-monkey/1.11.2/src/modules/Tables.js
// @require https://raw.github.com/kynikos/wiki-monkey/1.11.2/src/modules/UI.js
// @require https://raw.github.com/kynikos/wiki-monkey/1.11.2/src/plugins/ExpandContractions.js
// @require https://raw.github.com/kynikos/wiki-monkey/1.11.2/src/plugins/MultipleLineBreaks.js
// @require https://raw.github.com/kynikos/wiki-monkey/1.11.2/src/plugins/SimpleReplace.js
// @require https://raw.github.com/kynikos/wiki-monkey/1.11.2/src/plugins/UpdateCategoryTree.js
// ==/UserScript==

WM.UI.setEditor([
    [
        ["ExpandContractions", "Expand contractions", null],
        ["MultipleLineBreaks", "Multiple line breaks", null]
    ],
    [
        ["SimpleReplace", "RegExp substitution", ["1"]]
    ]
]);

WM.UI.setDiff(null);

WM.UI.setCategory([
    ["SimpleReplace", "RegExp substitution", ["1"]]
]);

WM.UI.setWhatLinksHere([
    ["SimpleReplace", "RegExp substitution", ["1"]]
]);

WM.UI.setLinkSearch([
    ["SimpleReplace", "RegExp substitution", ["1"]]
]);

WM.UI.setSpecial([
    [
        ["UpdateCategoryTree", "Update main ToC",
         [{}, "[[Wiki Monkey]]: automatic update"]]
    ]
]);

WM.UI.setSpecialList([
    ["SimpleReplace", "RegExp substitution", ["1"]]
]);

WM.main();
