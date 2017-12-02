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
module.exports.ArchWikiWantedCategories = (function() {
  class ArchWikiWantedCategories {
    constructor(WM) {
      this.WM = WM;
    }

    mainAuto(args, title, callBot, chainArgs) {
      title = title.replace(" (page does not exist)", "");
      return this.WM.MW.callQuery({
        prop: "info",
        intoken: "edit",
        titles: title
      }, this.mainAutoWrite, [title, callBot], null);
    }

    mainAutoWrite(page, args) {
      var callBot, edittoken, language, summary, text, title;
      title = args[0];
      callBot = args[1];
      edittoken = page.edittoken;
      language = this.WM.ArchWiki.detectLanguage(title)[1];
      if (language !== this.WM.ArchWiki.getLocalLanguage()) {
        text = "[[Category:" + language + "]]";
        summary = "wanted category";
        return this.WM.MW.callAPIPost({
          action: "edit",
          bot: "1",
          title: title,
          summary: summary,
          text: text,
          createonly: "1",
          token: edittoken
        }, this.mainAutoEnd, callBot, null);
      } else {
        return callBot(0, null);
      }
    }

    mainAutoEnd(res, callBot) {
      if (res.edit && res.edit.result === 'Success') {
        return callBot(1, null);
      } else if (res.error) {
        this.WM.Log.logError(res.error.info + " (" + res.error.code + ")");
        return callBot(res.error.code, null);
      } else {
        return callBot(false, null);
      }
    }

  };

  ArchWikiWantedCategories.REQUIRES_GM = false;

  return ArchWikiWantedCategories;

})();
