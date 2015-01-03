/*
 *  Wiki Monkey - MediaWiki bot and editor assistant that runs in the browser
 *  Copyright (C) 2011-2014 Dario Giovannetti <dev@dariogiovannetti.net>
 *
 *  This file is part of Wiki Monkey.
 *
 *  Wiki Monkey is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Wiki Monkey is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Wiki Monkey.  If not, see <http://www.gnu.org/licenses/>.
 */

WM.UI = new function () {
    "use strict";

    var editor = null;

    this.setEditor = function(rows) {
        editor = rows;
    };

    var diff = null;

    this.setDiff = function(rows) {
        diff = rows;
    };

    var special = null;

    this.setSpecial = function(rows) {
        special = rows;
    };

    var recentChanges = null;

    this.setRecentChanges = function(rows) {
        recentChanges = rows;
    };

    var newPages = null;

    this.setNewPages = function(rows) {
        newPages = rows;
    }

    var bot = null;

    this.setBot = function(rows) {
        bot = rows;
    };

    var makeButtons = function (functions) {
        var divContainer = document.createElement('div');
        divContainer.id = 'WikiMonkeyButtons';

        Alib.CSS.addStyleElement("#WikiMonkeyButtons div.row " +
                                "{position:relative; margin-bottom:0.33em;} " +
                    "#WikiMonkeyButtons div.shortcut {position:absolute;} " +
                    "#WikiMonkeyButtons div.shortcut > input, " +
                                "#WikiMonkeyButtonAll {width:8.33em; " +
                                "margin-bottom:0.33em; font-weight:bold;} " +
                    "#WikiMonkeyButtons div.plugins {margin-left:9em;} " +
                    "#WikiMonkeyButtons div.pluginUI {display:inline-block; " +
                                "margin-bottom:0.33em; margin-right:0.33em;}");

        var buttonAll = document.createElement('input');
        buttonAll.setAttribute('type', 'button');
        buttonAll.setAttribute('value', 'Execute all');
        buttonAll.id = "WikiMonkeyButtonAll";

        var allFunctions = [];
        var rowsN = 0;

        for (var r in functions) {
            var row = functions[r];

            var buttonRow = document.createElement('input');
            buttonRow.setAttribute('type', 'button');
            buttonRow.setAttribute('value', 'Execute row');

            var pRow = document.createElement('div');
            pRow.className = "shortcut";
            pRow.appendChild(buttonRow);

            var divPlugins = document.createElement('div');
            divPlugins.className = "plugins";

            var divRow = document.createElement('div');
            divRow.className = "row";
            divRow.appendChild(pRow);

            var rowFunctions = [];
            var buttonsN = 0;

            for (var f in row) {
                var ff = row[f];

                var buttonFunction = document.createElement('input');
                buttonFunction.setAttribute('type', 'button');
                buttonFunction.setAttribute('value', ff[1]);

                buttonFunction.addEventListener("click", (function (fn, arg) {
                    return function () {
                        WM.Log.logHidden("Plugin: " + fn);
                        WM.Plugins[fn].main(arg, null);
                    };
                })(ff[0], ff[2]), false);

                var exFunction = (function (plugin) {
                    return function (args, callNext) {
                        WM.Log.logHidden("Plugin: " + plugin);
                        WM.Plugins[plugin].main(args, callNext);
                    };
                })(ff[0]);

                rowFunctions.push([exFunction, ff[2]]);
                allFunctions.push([exFunction, ff[2]]);

                var divFunction = document.createElement('div');
                divFunction.className = 'pluginUI';
                divFunction.appendChild(buttonFunction);

                var makeUI = WM.Plugins[ff[0]].makeUI;
                if (makeUI instanceof Function) {
                    divFunction.appendChild(makeUI(ff[2]));
                }

                divPlugins.appendChild(divFunction);

                buttonsN++;
            }

            buttonRow.addEventListener("click", (function (rowFunctions) {
                return function () {
                    Alib.Async.executeAsync(rowFunctions, -1);
                };
            })(rowFunctions), false);

            divRow.appendChild(divPlugins);
            divContainer.appendChild(divRow);

            if (buttonsN <= 1) {
                buttonRow.disabled = true;
            }

            rowsN++;
        }

        buttonAll.addEventListener("click", (function (allFunctions) {
            return function () {
                Alib.Async.executeAsync(allFunctions, -1);
            };
        })(allFunctions), false);

        if (rowsN > 1) {
            divRow = document.createElement('div');
            divRow.className = "row";
            divRow.appendChild(buttonAll);
            divContainer.appendChild(divRow);
        }

        return divContainer;
    };

    this._makeUI = function () {
        var nextNode, UI;
        var display = true;
        var displayLog = true;

        if (document.getElementById('editform')) {
            nextNode = document.getElementById('wpSummaryLabel'
                                                    ).parentNode.nextSibling;
            UI = (editor) ? makeButtons(editor) : null;
        }
        else if (document.getElementById('mw-diff-otitle1')) {
            nextNode = document.getElementById('bodyContent'
                                            ).getElementsByTagName('h2')[0];
            UI = (diff) ? makeButtons(diff) : null;
        }
        else if (document.getElementById('mw-subcategories') ||
                                        document.getElementById('mw-pages')) {
            nextNode = document.getElementById('bodyContent');
            UI = (bot) ? WM.Bot._makeUI(bot,
                            [[document.getElementById('mw-pages'), 0, "Pages"],
                            [document.getElementById('mw-subcategories'), 0,
                            "Subcategories"]]) : null;
            display = false;
        }
        else if (document.getElementById('mw-whatlinkshere-list')) {
            nextNode = document.getElementById('bodyContent'
                                ).getElementsByTagName('form')[0].nextSibling;
            UI = (bot) ? WM.Bot._makeUI(bot,
                            [[document.getElementById('mw-whatlinkshere-list'),
                            0, "Pages"]]) : null;
            display = false;
        }
        else if (document.getElementById('mw-linksearch-form') &&
                                        document.getElementById('bodyContent'
                                        ).getElementsByTagName('ol')[0]) {
            nextNode = document.getElementById('mw-linksearch-form'
                                                                ).nextSibling;
            UI = (bot) ? WM.Bot._makeUI(bot,
                        [[document.getElementById('bodyContent'
                        ).getElementsByTagName('ol')[0], 1, "Pages"]]) : null;
            display = false;
        }
        else if (document.getElementById('mw-prefixindex-list-table')) {
            nextNode = document.getElementById('mw-prefixindex-list-table');
            UI = (bot) ? WM.Bot._makeUI(bot,
                                [[nextNode.getElementsByTagName('tbody')[0],
                                0, "Pages"]]) : null;
            display = false;
        }
        else {
            var wikiUrls = WM.MW.getWikiUrls();
            var patt1A = new RegExp(Alib.RegEx.escapePattern(wikiUrls.full) +
                    "\?.*?" + "title\\=Special(\\:|%3[Aa])SpecialPages", '');
            var patt1B = new RegExp(Alib.RegEx.escapePattern(wikiUrls.short) +
                    "Special(\\:|%3[Aa])SpecialPages", '');
            var patt2A = new RegExp(Alib.RegEx.escapePattern(wikiUrls.full) +
                    "\?.*?" + "title\\=Special(\\:|%3[Aa])RecentChanges", '');
            var patt2B = new RegExp(Alib.RegEx.escapePattern(wikiUrls.short) +
                    "Special(\\:|%3[Aa])RecentChanges", '');
            var patt3A = new RegExp(Alib.RegEx.escapePattern(wikiUrls.full) +
                    "\?.*?" + "title\\=Special(\\:|%3[Aa])NewPages", '');
            var patt3B = new RegExp(Alib.RegEx.escapePattern(wikiUrls.short) +
                    "Special(\\:|%3[Aa])NewPages", '');
            var patt4A = new RegExp(Alib.RegEx.escapePattern(wikiUrls.full) +
                    "\?.*?" + "title\\=Special(\\:|%3[Aa])ProtectedPages", '');
            var patt4B = new RegExp(Alib.RegEx.escapePattern(wikiUrls.short) +
                    "Special(\\:|%3[Aa])ProtectedPages", '');

            if (location.href.search(patt1A) > -1 ||
                                        location.href.search(patt1B) > -1) {
                nextNode = document.getElementById('bodyContent');
                UI = (special) ? makeButtons(special) : null;
            }
            else if (location.href.search(patt2A) > -1 ||
                                        location.href.search(patt2B) > -1) {
                nextNode = document.getElementById('mw-content-text'
                                            ).getElementsByTagName('h4')[0];
                UI = (recentChanges) ? WM.Filters._makeUI(recentChanges) :
                                                                        null;
                displayLog = false;
            }
            else if (location.href.search(patt3A) > -1 ||
                                        location.href.search(patt3B) > -1) {
                nextNode = document.getElementById('mw-content-text'
                                            ).getElementsByTagName('ul')[0];
                UI = (newPages) ? WM.Filters._makeUI(newPages) : null;
                displayLog = false;
            }
            else if (location.href.search(patt4A) > -1 ||
                                        location.href.search(patt4B) > -1) {
                nextNode = document.getElementById('mw-content-text'
                                            ).getElementsByTagName('ul')[0];
                UI = (bot) ? WM.Bot._makeUI(bot,
                                    [[document.getElementById('mw-content-text'
                                            ).getElementsByTagName('ul')[0],
                                    0, "Pages"]]) : null;
                display = false;
            }
            else if (document.getElementsByClassName('mw-spcontent'
                                                                ).length > 0) {
                nextNode = document.getElementsByClassName('mw-spcontent')[0];
                UI = (bot) ? WM.Bot._makeUI(bot,
                                    [[nextNode.getElementsByTagName('ol')[0],
                                    0, "Pages"]]) : null;
                display = false;
            }
            else if (document.getElementsByClassName('mw-allpages-table-chunk'
                                                                ).length > 0) {
                nextNode = document.getElementsByClassName(
                                                'mw-allpages-table-chunk')[0];
                UI = (bot) ? WM.Bot._makeUI(bot,
                                [[nextNode.getElementsByTagName('tbody')[0],
                                0, "Pages"]]) : null;
                display = false;
            }
        }

        if (UI) {
            Alib.CSS.addStyleElement("#WikiMonkey {position:relative;} " +
                        "#WikiMonkey fieldset {margin:0 0 1em 0;}");

            var main = document.createElement('fieldset');
            main.id = 'WikiMonkey';

            var legend = document.createElement('legend');
            legend.appendChild(document.createTextNode('Wiki Monkey '));

            var hide = document.createElement('a');
            hide.href = '#WikiMonkey';
            hide.innerHTML = '[hide]';
            hide.addEventListener("click", function () {
                var wmmain = document.getElementById('WikiMonkeyMain');
                if (wmmain.style.display == 'none') {
                    wmmain.style.display = 'block';
                    this.innerHTML = '[hide]';
                }
                else {
                    wmmain.style.display = 'none';
                    this.innerHTML = '[show]';
                }
                return false;
            }, false);
            legend.appendChild(hide);

            legend.appendChild(document.createTextNode(' '));

            var help = document.createElement('a');
            help.href = 'https://github.com/kynikos/wiki-monkey/wiki'
            help.innerHTML = '[help]';
            legend.appendChild(help);

            main.appendChild(legend);

            var main2 = document.createElement('div');
            main2.id = 'WikiMonkeyMain';

            main2.appendChild(UI);

            var logArea = WM.Log._makeLogArea();
            if (!displayLog) {
                logArea.style.display = 'none';
            }
            main2.appendChild(logArea);

            if (!display) {
                main2.style.display = 'none';
                hide.innerHTML = '[show]';
            }
            main.appendChild(main2);

            nextNode.parentNode.insertBefore(main, nextNode);
        }
    };
};