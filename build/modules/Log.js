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
var Str, jss;

({jss} = require('./libs'));

Str = require('../../lib.js.generic/dist/Str');

module.exports = (function() {
  var classesToLevels;

  class exports {
    constructor(WM) {
      var classes, styles;
      this.WM = WM;
      this._currentInfoDisplayState = true;
      // The .warning and .error classes are already used by
      // MediaWiki, without associating them with an id and a tag
      styles = {
        log: {
          height: '10em',
          border: '2px solid #07b',
          padding: '0.5em',
          overflow: 'auto',
          resize: 'vertical',
          'background-color': '#111',
          '& p.timestamp, & p.message': {
            border: 'none',
            padding: 0,
            'font-family': 'monospace',
            color: '#eee'
          },
          '& p.timestamp': {
            margin: '0 1em 0 0',
            'white-space': 'nowrap'
          },
          '& p.message': {
            margin: 0
          },
          '& div.mdebug, & div.minfo, & div.mwarning, & div.merror': {
            display: 'flex'
          },
          '& div.mhidden': {
            display: 'none'
          },
          '& div.mjson': {
            display: 'none'
          },
          '& div.mdebug p.message': {
            color: 'cyan'
          },
          '& div.mwarning p.message': {
            color: 'gold'
          },
          '& div.merror p.message': {
            color: 'red'
          },
          '& a': {
            color: 'inherit',
            'text-decoration': 'underline'
          }
        }
      };
      ({classes} = jss.createStyleSheet(styles, {
        classNamePrefix: "WikiMonkey-"
      }).attach());
      this.classes = classes;
    }

    _makeLogArea() {
      var log, par;
      log = document.createElement('div');
      log.id = 'WikiMonkeyLog';
      par = document.createElement('p');
      par.appendChild(this.makeFilterLink());
      par.appendChild(document.createTextNode(' '));
      par.appendChild(this.makeSaveLink());
      log.appendChild(par);
      this.logarea = document.createElement('div');
      this.logarea.className = this.classes.log;
      log.appendChild(this.logarea);
      return log;
    }

    makeFilterLink() {
      var link;
      link = document.createElement('a');
      link.href = '#WikiMonkey';
      link.innerHTML = this.computeFilterLinkAnchor();
      link.addEventListener("click", (event) => {
        var i, len, msg, msgs;
        event.preventDefault();
        // Change _currentInfoDisplayState *before* the loop, to prevent
        // race bugs
        this._currentInfoDisplayState = !this._currentInfoDisplayState;
        link.innerHTML = this.computeFilterLinkAnchor();
        msgs = this.logarea.getElementsByClassName('minfo');
        for (i = 0, len = msgs.length; i < len; i++) {
          msg = msgs[i];
          msg.style.display = this.computeInfoDisplayStyle();
        }
        return this.scrollToBottom();
      }, false);
      return link;
    }

    makeSaveLink() {
      var link;
      link = document.createElement('a');
      link.href = '#';
      link.download = 'WikiMonkey.log';
      link.innerHTML = '[save log]';
      link.id = 'WikiMonkeyLog-Save';
      link.addEventListener("click", () => {
        link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.composeSaveLogText());
        return link.download = this.composeSaveLogFilename();
      }, false);
      return link;
    }

    composeSaveLogText() {
      var div, divs, i, len, level, message, ps, text, tstamp;
      divs = this.logarea.getElementsByTagName('div');
      text = '';
      for (i = 0, len = divs.length; i < len; i++) {
        div = divs[i];
        ps = div.getElementsByTagName('p');
        tstamp = ps[0].innerHTML;
        level = classesToLevels[div.className];
        message = ps[1].innerHTML;
        text += tstamp + '\t' + level + '\t' + message + '\n';
      }
      return text;
    }

    composeSaveLogFilename() {
      var date;
      date = new Date();
      return 'WikiMonkey-' + date.getFullYear() + Str.padLeft(String(date.getMonth() + 1), '0', 2) + Str.padLeft(String(date.getDate()), '0', 2) + Str.padLeft(String(date.getHours()), '0', 2) + Str.padLeft(String(date.getMinutes()), '0', 2) + '.log';
    }

    computeInfoDisplayStyle() {
      if (this._currentInfoDisplayState) {
        return 'flex';
      } else {
        return 'none';
      }
    }

    computeFilterLinkAnchor() {
      if (this._currentInfoDisplayState) {
        return '[hide info messages]';
      } else {
        return '[show info messages]';
      }
    }

    scrollToBottom() {
      return this.logarea.scrollTop = this.logarea.scrollHeight - this.logarea.clientHeight;
    }

    appendMessage(text, type) {
      var line, msg, now, test, tstamp;
      tstamp = document.createElement('p');
      tstamp.className = 'timestamp';
      now = new Date();
      tstamp.innerHTML = now.toLocaleTimeString();
      msg = document.createElement('p');
      msg.className = 'message';
      // Do not allow the empty string, otherwise the resulting html element
      // may not be rendered by the browser
      msg.innerHTML = text ? text : " ";
      line = document.createElement('div');
      line.appendChild(tstamp);
      line.appendChild(msg);
      line.className = type;
      if (type === 'minfo') {
        line.style.display = this.computeInfoDisplayStyle();
      }
      // This test must be done *before* appending the new line
      test = this.logarea.scrollTop + this.logarea.clientHeight === this.logarea.scrollHeight;
      this.logarea.appendChild(line);
      if (test) {
        return this.scrollToBottom();
      }
    }

    logHidden(text) {
      return this.appendMessage(text, 'mhidden');
    }

    logJson(component, data) {
      var text;
      text = JSON.stringify({
        "component": component,
        "data": data
      });
      return this.appendMessage(text, 'mjson');
    }

    logDebug(text) {
      return this.appendMessage(text, 'mdebug');
    }

    logInfo(text) {
      return this.appendMessage(text, 'minfo');
    }

    logWarning(text) {
      return this.appendMessage(text, 'mwarning');
    }

    logError(text) {
      return this.appendMessage(text, 'merror');
    }

    linkToPage(url, anchor) {
      // Must return a string, not a DOM element
      return "<a href=\"" + url + "\">" + anchor + "</a>";
    }

    linkToWikiPage(title, anchor) {
      var wikiUrls;
      // Must return a string, not a DOM element
      // Use an absolute (full) URL so it will be usable in the downloadable
      //   version of the log
      // Do *not* use encodeURIComponent(title) because the passed title may
      //   have a fragment or a query string that would then be encoded
      //   MediaWiki should be able to correctly resolve the title anyway
      wikiUrls = this.WM.MW.getWikiUrls();
      return "<a href=\"" + wikiUrls.short + title + "\">" + anchor + "</a>";
    }

  };

  classesToLevels = {
    'mhidden': 'HDN',
    'mjson': 'JSN',
    'mdebug': 'DBG',
    'minfo': 'INF',
    'mwarning': 'WRN',
    'merror': 'ERR'
  };

  return exports;

})();
