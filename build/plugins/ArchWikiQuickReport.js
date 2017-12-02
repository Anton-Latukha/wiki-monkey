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
var CSS, HTTP;

CSS = require('../../lib.js.generic/dist/CSS');

HTTP = require('../../lib.js.generic/dist/HTTP');

module.exports.ArchWikiQuickReport = (function() {
  class ArchWikiQuickReport {
    constructor(WM) {
      this.mainGetEndTimestamp = this.mainGetEndTimestamp.bind(this);
      this.mainWrite = this.mainWrite.bind(this);
      this.mainEnd = this.mainEnd.bind(this);
      this.WM = WM;
    }

    makeUI(args) {
      var article, i, input, len, link, option, select, span, types, value;
      CSS.addStyleElement("#WikiMonkey-ArchWikiQuickReport > select, #WikiMonkey-ArchWikiQuickReport > input, #WikiMonkey-ArchWikiQuickReport > a {margin-left:0.33em;}");
      article = args[0];
      select = document.createElement('select');
      types = ["&lt;TYPE&gt;", "content", "style"];
      for (i = 0, len = types.length; i < len; i++) {
        value = types[i];
        option = document.createElement('option');
        option.setAttribute('value', value);
        option.innerHTML = value;
        select.appendChild(option);
      }
      select.id = "WikiMonkey-ArchWikiQuickReport-select";
      input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.id = "WikiMonkey-ArchWikiQuickReport-input";
      link = document.createElement('a');
      link.href = "/index.php/" + article;
      link.innerHTML = article;
      span = document.createElement('span');
      span.id = "WikiMonkey-ArchWikiQuickReport";
      span.appendChild(select);
      span.appendChild(input);
      span.appendChild(link);
      return span;
    }

    main(args, callNext) {
      var article, select, summary, type;
      article = args[0];
      summary = args[1];
      this.WM.Log.logInfo('Appending diff to ' + this.WM.Log.linkToWikiPage(article, article) + " ...");
      select = document.getElementById("WikiMonkey-ArchWikiQuickReport-select");
      type = select.options[select.selectedIndex].value;
      if (type !== 'content' && type !== 'style') {
        return this.WM.Log.logError('Select a valid report type');
      } else {
        return this.WM.Diff.getEndTimestamp(this.mainGetEndTimestamp, [article, type, summary, callNext]);
      }
    }

    mainGetEndTimestamp(enddate, args) {
      var article, callNext, summary, type;
      article = args[0];
      type = args[1];
      summary = args[2];
      callNext = args[3];
      return this.WM.MW.callQueryEdit(article, this.mainWrite, [type, summary, enddate, callNext]);
    }

    mainWrite(article, source, timestamp, edittoken, args) {
      var callNext, enddate, expsummary, newtext, notes, pEnddate, summary, title, type;
      type = args[0];
      summary = args[1];
      enddate = args[2];
      callNext = args[3];
      title = HTTP.getURIParameter(null, 'title');
      pEnddate = enddate.substr(0, 10) + "&nbsp;" + enddate.substr(11, 8);
      notes = document.getElementById("WikiMonkey-ArchWikiQuickReport-input").value;
      newtext = this.WM.Tables.appendRow(source, null, ["[" + location.href + " " + title + "]", pEnddate, type, notes]);
      // Javascript doesn't support look behind...
      expsummary = summary.replace(/(^|[^%])(%%)*%t/g, '$1$2[[' + title + ']]');
      expsummary = expsummary.replace(/%(.)/g, '$1');
      return this.WM.MW.callAPIPost({
        action: "edit",
        bot: "1",
        title: article,
        summary: expsummary,
        text: newtext,
        basetimestamp: timestamp,
        token: edittoken
      }, this.mainEnd, [article, callNext], null);
    }

    mainEnd(res, args) {
      var article, callNext;
      article = args[0];
      callNext = args[1];
      if (res.edit && res.edit.result === 'Success') {
        this.WM.Log.logInfo('Diff correctly appended to ' + this.WM.Log.linkToWikiPage(article, article));
        if (callNext) {
          return callNext();
        }
      } else {
        return this.WM.Log.logError('The diff has not been appended!\n' + res['error']['info'] + " (" + res['error']['code'] + ")");
      }
    }

  };

  ArchWikiQuickReport.REQUIRES_GM = false;

  return ArchWikiQuickReport;

})();
