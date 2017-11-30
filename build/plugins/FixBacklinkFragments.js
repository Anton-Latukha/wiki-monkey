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
var CSS;

CSS = require('../../lib.js.generic/dist/CSS');

module.exports.FixBacklinkFragments = (function() {
  var readTarget;

  class FixBacklinkFragments {
    constructor(WM) {
      this.makeBotUI = this.makeBotUI.bind(this);
      this.fixLinks = this.fixLinks.bind(this);
      this.fixArchWikiLinks = this.fixArchWikiLinks.bind(this);
      this.fixArchWikiLink = this.fixArchWikiLink.bind(this);
      this.fixFragment = this.fixFragment.bind(this);
      this.mainAutoFindSections = this.mainAutoFindSections.bind(this);
      this.mainAutoRead = this.mainAutoRead.bind(this);
      this.mainAutoWrite = this.mainAutoWrite.bind(this);
      this.mainAutoEnd = this.mainAutoEnd.bind(this);
      this.WM = WM;
    }

    makeBotUI(args) {
      var divMain, label, target;
      CSS.addStyleElement("#WikiMonkey-FixBacklinkFragments " + "input[type='text'] {margin-left:0.33em;}");
      divMain = document.createElement('div');
      divMain.id = "WikiMonkey-FixBacklinkFragments";
      label = document.createElement('span');
      label.innerHTML = 'Target page:';
      divMain.appendChild(label);
      target = document.createElement('input');
      target.setAttribute('type', 'text');
      target.id = "WikiMonkey-FixBacklinkFragments-Target";
      if (this.WM.WhatLinksHere.isWhatLinksHerePage()) {
        target.value = this.WM.WhatLinksHere.getTitle();
      }
      divMain.appendChild(target);
      return divMain;
    }

    fixLinks(source, target, sections) {
      var fixedFragment, i, len, link, links, newText, newlink, oldlink, prevId, rawfragment;
      // Note that it's impossible to recognize any namespaces in the title
      //   without querying the server
      // Alternatively, a list of the known namespaces could be maintained
      //   for each wiki
      // Recognizing namespaces would let recognize more liberal link
      //   syntaxes (e.g. spaces around the colon)
      links = this.WM.Parser.findInternalLinks(source, null, target);
      newText = "";
      prevId = 0;
      for (i = 0, len = links.length; i < len; i++) {
        link = links[i];
        newText += source.substring(prevId, link.index);
        newlink = link.rawLink;
        rawfragment = link.fragment;
        if (rawfragment) {
          fixedFragment = this.fixFragment(rawfragment, sections);
          if (fixedFragment === true) {
            null;
          } else if (fixedFragment) {
            oldlink = newlink;
            newlink = "[[" + target + "#" + fixedFragment + (link.anchor ? "|" + link.anchor : "") + "]]";
            this.WM.Log.logInfo("Fixed broken link fragment: " + oldlink + " -> " + this.WM.Log.linkToWikiPage(link.link, newlink));
          } else {
            this.WM.Log.logWarning("Cannot fix broken link fragment: " + this.WM.Log.linkToWikiPage(link.link, newlink));
          }
        }
        newText += newlink;
        prevId = link.index + link.length;
      }
      newText += source.substr(prevId);
      // Without this check this plugin would be specific to ArchWiki
      if (location.hostname === 'wiki.archlinux.org') {
        newText = this.fixArchWikiLinks(newText, target, sections);
      }
      return newText;
    }

    fixArchWikiLinks(source, target, sections) {
      var i, j, len, len1, link, link2, links, links2, newText1, newText2, prevId;
      links = this.WM.Parser.findTemplates(source, 'Related');
      newText1 = "";
      prevId = 0;
      for (i = 0, len = links.length; i < len; i++) {
        link = links[i];
        newText1 += source.substring(prevId, link.index);
        newText1 += this.fixArchWikiLink(target, sections, link, 1);
        prevId = link.index + link.length;
      }
      newText1 += source.substr(prevId);
      links2 = this.WM.Parser.findTemplates(newText1, 'Related2');
      newText2 = "";
      prevId = 0;
      for (j = 0, len1 = links2.length; j < len1; j++) {
        link2 = links2[j];
        newText2 += newText1.substring(prevId, link2.index);
        newText2 += this.fixArchWikiLink(target, sections, link2, 2);
        prevId = link2.index + link2.length;
      }
      newText2 += newText1.substr(prevId);
      return newText2;
    }

    fixArchWikiLink(target, sections, template, expectedArgs) {
      var anchor, args, fixedFragment, fragId, link, ltitle, newlink, rawfragment;
      args = template.arguments;
      // Don't crash in case of malformed templates
      if (args.length === expectedArgs) {
        link = args[0].value;
        fragId = link.indexOf('#');
        if (fragId > -1) {
          ltitle = link.substring(0, fragId);
          // Note that it's impossible to recognize any namespaces in the
          //   title without querying the server
          // Alternatively, a list of the known namespaces could be
          //   maintained for each wiki
          // Recognizing namespaces would let recognize more liberal link
          //   syntaxes (e.g. spaces around the colon)
          if (this.WM.Parser.compareArticleTitles(ltitle, target)) {
            rawfragment = link.substr(fragId + 1);
            fixedFragment = this.fixFragment(rawfragment, sections);
            if (fixedFragment === true) {
              null;
            } else if (fixedFragment) {
              anchor = args[1] ? "|" + args[1].value : "";
              newlink = "{{" + template.title + "|" + target + "#" + fixedFragment + anchor + "}}";
              this.WM.Log.logInfo("Fixed broken link fragment: " + template.rawTransclusion + " -> " + this.WM.Log.linkToWikiPage(link, newlink));
              return newlink;
            } else {
              this.WM.Log.logWarning("Cannot fix broken link fragment: " + this.WM.Log.linkToWikiPage(link, template.rawTransclusion));
            }
          }
        }
      } else {
        this.WM.Log.logWarning("Template:" + template.title + " must have " + expectedArgs + " and only " + expectedArgs + (expectedArgs > 1 ? " arguments: " : " argument: ") + template.rawTransclusion);
      }
      return template.rawTransclusion;
    }

    fixFragment(rawfragment, sections) {
      var fragment, i, len, section;
      if (rawfragment) {
        fragment = this.WM.Parser.squashContiguousWhitespace(rawfragment).trim();
        if (sections.indexOf(fragment) < 0) {
          for (i = 0, len = sections.length; i < len; i++) {
            section = sections[i];
            // The FixFragments and FixLinkFragments plugins also try
            // to fix dot-encoded fragments however it's too dangerous
            // to do it with this bot plugin, have the user fix
            // fragments manually
            if (section.toLowerCase() === fragment.toLowerCase()) {
              return section;
            }
          }
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    }

    mainAuto(args, title, callBot, chainArgs) {
      var params, summary, target;
      summary = args;
      target = readTarget();
      this.WM.Log.logHidden("Target page: " + target);
      if (target) {
        if (chainArgs === null) {
          params = {
            'action': 'parse',
            'prop': 'sections',
            'page': target,
            'redirects': 1
          };
          this.WM.Log.logWarning("If some articles in the list are linking to the target article through a redirect, you should process the backlinks of that redirect page separately through its Special:WhatLinksHere page, as this plugin can only fix links that exactly match the title of the target article.\nIn order to save time you are advised to hide the redirects in the page lists that allow to do so.");
          return this.WM.MW.callAPIGet(params, this.mainAutoFindSections, [title, target, summary, callBot], null);
        } else {
          return this.mainAutoRead(target, chainArgs, title, summary, callBot);
        }
      } else {
        this.WM.Log.logError('The target page cannot be empty');
        return callBot(false, null);
      }
    }

    mainAutoFindSections(res, args) {
      var callBot, i, len, ref, section, sections, summary, target, title;
      title = args[0];
      target = args[1];
      summary = args[2];
      callBot = args[3];
      sections = [];
      if (res.parse) {
        ref = res.parse.sections;
        for (i = 0, len = ref.length; i < len; i++) {
          section = ref[i];
          sections.push(this.WM.Parser.squashContiguousWhitespace(section.line).trim());
        }
        return this.mainAutoRead(target, sections, title, summary, callBot);
      } else {
        this.WM.Log.logError("The set target page, " + target + ", seems not to exist");
        if (res.error) {
          return callBot(res.error.code, sections);
        } else {
          return callBot(false, sections);
        }
      }
    }

    mainAutoRead(target, sections, title, summary, callBot) {
      return this.WM.MW.callQueryEdit(title, this.mainAutoWrite, [target, summary, callBot, sections]);
    }

    mainAutoWrite(title, source, timestamp, edittoken, args) {
      var callBot, newtext, sections, summary, target;
      target = args[0];
      summary = args[1];
      callBot = args[2];
      sections = args[3];
      newtext = this.fixLinks(source, target, sections);
      if (newtext !== source) {
        return this.WM.MW.callAPIPost({
          action: "edit",
          bot: "1",
          title: title,
          summary: summary,
          text: newtext,
          basetimestamp: timestamp,
          token: edittoken
        }, this.mainAutoEnd, [callBot, sections], null);
      } else {
        return callBot(0, sections);
      }
    }

    mainAutoEnd(res, args) {
      var callBot, sections;
      callBot = args[0];
      sections = args[1];
      if (res.edit && res.edit.result === 'Success') {
        return callBot(1, sections);
      } else if (res.error) {
        this.WM.Log.logError(res.error.info + " (" + res.error.code + ")");
        return callBot(res.error.code, sections);
      } else {
        return callBot(false, sections);
      }
    }

  };

  readTarget = function() {
    return document.getElementById("WikiMonkey-FixBacklinkFragments-Target").value;
  };

  return FixBacklinkFragments;

})();
