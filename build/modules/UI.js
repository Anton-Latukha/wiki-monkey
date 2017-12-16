// Generated by CoffeeScript 2.0.3
// Wiki Monkey - MediaWiki bot and editor-assistant user script
// Copyright (C) 2011 Dario Giovannetti <dev@dariogiovannetti.net>

// This file is part of Wiki Monkey.

// Wiki Monkey is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Wiki Monkey is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Wiki Monkey.  If not, see <http://www.gnu.org/licenses/>.
var CSS, RegEx;

CSS = require('../../auxiliary/lib.js.generic/dist/CSS');

RegEx = require('../../auxiliary/lib.js.generic/dist/RegEx');

module.exports = class exports {
  constructor(WM) {
    this.WM = WM;
  }

  _makeUI() {
    var UI, conf, date, display, displayLog, hide, legend, logArea, main, main2, nextNode, patt1A, patt1B, patt2A, patt2B, patt3A, patt3B, patt4A, patt4B, patt5A, patt5B, wikiUrls;
    display = true;
    displayLog = true;
    this.WM.Mods.applyGeneralMods();
    if (document.getElementById('editform')) {
      nextNode = document.getElementById('wpSummaryLabel').parentNode.nextSibling;
      conf = this.WM.Plugins.editor;
      UI = conf.length ? this.WM.Menu._makeUI('editor', conf) : null;
      this.WM.Mods.applyEditorMods();
    } else if (document.getElementById('mw-diff-otitle1')) {
      nextNode = document.getElementById('bodyContent').getElementsByTagName('h2')[0];
      conf = this.WM.Plugins.diff;
      UI = conf.length ? this.WM.Menu._makeUI('diff', conf) : null;
    } else if (document.getElementById('mw-subcategories') || document.getElementById('mw-pages')) {
      nextNode = document.getElementById('bodyContent');
      conf = this.WM.Plugins.bot;
      UI = conf.length ? this.WM.Bot._makeUI(conf, [[document.getElementById('mw-pages'), 0, "Pages"], [document.getElementById('mw-subcategories'), 0, "Subcategories"]]) : null;
      display = false;
    } else if (document.getElementById('mw-whatlinkshere-list')) {
      nextNode = document.getElementById('bodyContent').getElementsByTagName('form')[0].nextSibling;
      conf = this.WM.Plugins.bot;
      UI = conf.length ? this.WM.Bot._makeUI(conf, [[document.getElementById('mw-whatlinkshere-list'), 0, "Pages"]]) : null;
      display = false;
    } else if (document.body.classList.contains('mw-special-LinkSearch') && document.getElementById('bodyContent').getElementsByTagName('ol')[0]) {
      nextNode = document.getElementsByClassName('mw-spcontent')[0];
      conf = this.WM.Plugins.bot;
      UI = conf.length ? this.WM.Bot._makeUI(conf, [[document.getElementById('bodyContent').getElementsByTagName('ol')[0], 1, "Pages"]]) : null;
      display = false;
    } else if (document.getElementById('mw-prefixindex-list-table')) {
      nextNode = document.getElementById('mw-prefixindex-list-table');
      conf = this.WM.Plugins.bot;
      UI = conf.length ? this.WM.Bot._makeUI(conf, [[nextNode.getElementsByTagName('tbody')[0], 0, "Pages"]]) : null;
      display = false;
    } else {
      wikiUrls = this.WM.MW.getWikiUrls();
      patt1A = new RegExp(RegEx.escapePattern(wikiUrls.full) + "\?.*?" + "title\\=Special(\\:|%3[Aa])SpecialPages", '');
      patt1B = new RegExp(RegEx.escapePattern(wikiUrls.short) + "Special(\\:|%3[Aa])SpecialPages", '');
      patt2A = new RegExp(RegEx.escapePattern(wikiUrls.full) + "\?.*?" + "title\\=Special(\\:|%3[Aa])RecentChanges", '');
      patt2B = new RegExp(RegEx.escapePattern(wikiUrls.short) + "Special(\\:|%3[Aa])RecentChanges", '');
      patt3A = new RegExp(RegEx.escapePattern(wikiUrls.full) + "\?.*?" + "title\\=Special(\\:|%3[Aa])NewPages", '');
      patt3B = new RegExp(RegEx.escapePattern(wikiUrls.short) + "Special(\\:|%3[Aa])NewPages", '');
      patt4A = new RegExp(RegEx.escapePattern(wikiUrls.full) + "\?.*?" + "title\\=Special(\\:|%3[Aa])ProtectedPages", '');
      patt4B = new RegExp(RegEx.escapePattern(wikiUrls.short) + "Special(\\:|%3[Aa])ProtectedPages", '');
      patt5A = new RegExp(RegEx.escapePattern(wikiUrls.full) + "\?.*?" + "title\\=Special(\\:|%3[Aa])Contributions", '');
      patt5B = new RegExp(RegEx.escapePattern(wikiUrls.short) + "Special(\\:|%3[Aa])Contributions", '');
      if (location.href.search(patt1A) > -1 || location.href.search(patt1B) > -1) {
        nextNode = document.getElementById('bodyContent');
        conf = this.WM.Plugins.special;
        UI = conf.length ? this.WM.Menu._makeUI('special', conf) : null;
      } else if (location.href.search(patt2A) > -1 || location.href.search(patt2B) > -1) {
        nextNode = document.getElementById('mw-content-text').getElementsByTagName('h4')[0];
        conf = this.WM.Plugins.recentchanges;
        UI = conf.length ? this.WM.Filters._makeUI('recentchanges', conf) : null;
        displayLog = false;
        this.WM.Mods.applyRecentChangesMods();
      } else if (location.href.search(patt3A) > -1 || location.href.search(patt3B) > -1) {
        nextNode = document.getElementById('mw-content-text').getElementsByTagName('ul')[0];
        conf = this.WM.Plugins.newpages;
        UI = conf.length ? this.WM.Filters._makeUI('newpages', conf) : null;
        displayLog = false;
      } else if (location.href.search(patt4A) > -1 || location.href.search(patt4B) > -1) {
        nextNode = document.getElementById('mw-content-text').getElementsByTagName('ul')[0];
        conf = this.WM.Plugins.bot;
        UI = conf.length ? this.WM.Bot._makeUI(conf, [[document.getElementById('mw-content-text').getElementsByTagName('ul')[0], 0, "Pages"]]) : null;
        display = false;
      } else if (location.href.search(patt5A) > -1 || location.href.search(patt5B) > -1) {
        this.WM.Mods.applyContributionsMods();
      } else if (document.getElementsByClassName('mw-spcontent').length > 0) {
        nextNode = document.getElementsByClassName('mw-spcontent')[0];
        conf = this.WM.Plugins.bot;
        UI = conf.length ? this.WM.Bot._makeUI(conf, [[nextNode.getElementsByTagName('ol')[0], 0, "Pages"]]) : null;
        display = false;
      } else if (document.getElementsByClassName('mw-allpages-table-chunk').length > 0) {
        nextNode = document.getElementsByClassName('mw-allpages-table-chunk')[0];
        conf = this.WM.Plugins.bot;
        UI = conf.length ? this.WM.Bot._makeUI(conf, [[nextNode.getElementsByTagName('tbody')[0], 0, "Pages"]]) : null;
        display = false;
      }
    }
    if (UI) {
      CSS.addStyleElement("#WikiMonkey {position:relative;} #WikiMonkey fieldset {margin:0 0 1em 0;}");
      main = document.createElement('fieldset');
      main.id = 'WikiMonkey';
      legend = document.createElement('legend');
      legend.appendChild(document.createTextNode('Wiki Monkey '));
      hide = document.createElement('a');
      hide.href = '#WikiMonkey';
      hide.innerHTML = '[hide]';
      hide.addEventListener("click", function(event) {
        var wmmain;
        event.preventDefault();
        wmmain = document.getElementById('WikiMonkeyMain');
        if (wmmain.style.display === 'none') {
          wmmain.style.display = 'block';
          return this.innerHTML = '[hide]';
        } else {
          wmmain.style.display = 'none';
          return this.innerHTML = '[show]';
        }
      }, false);
      legend.appendChild(hide);
      main.appendChild(legend);
      main2 = document.createElement('div');
      main2.id = 'WikiMonkeyMain';
      main2.appendChild(UI);
      logArea = this.WM.Log._makeLogArea();
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
      this.WM.Log.logHidden('Wiki Monkey version: ' + this.WM.VERSION);
      date = new Date();
      this.WM.Log.logHidden('Date: ' + date.toString());
      return this.WM.Log.logHidden('URL: ' + location.href);
    }
  }

};
