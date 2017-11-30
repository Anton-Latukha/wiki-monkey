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
module.exports.DeletePages = class DeletePages {
  constructor(WM) {
    this.WM = WM;
  }

  mainAuto(args, title, callBot, chainArgs) {
    var summary;
    summary = args;
    return this.WM.MW.callQuery({
      prop: 'info',
      intoken: 'delete',
      titles: title
    }, this.WM.Plugins.DeletePages.mainAutoWrite, [title, summary, callBot], null);
  }

  mainAutoWrite(page, args) {
    var callBot, deletetoken, summary, title;
    title = args[0];
    summary = args[1];
    callBot = args[2];
    deletetoken = page.deletetoken;
    return this.WM.MW.callAPIPost({
      action: 'delete',
      bot: '1',
      title: title,
      token: deletetoken,
      reason: summary
    }, this.WM.Plugins.DeletePages.mainAutoEnd, [title, callBot], null);
  }

  mainAutoEnd(res, args) {
    var callBot, title;
    title = args[0];
    callBot = args[1];
    if (!res.delete) {
      if (res.error) {
        this.WM.Log.logError(`${this.WM.Log.linkToWikiPage(title, title)} has not been deleted!\n${res.error.info} (${res.error.code})`);
        return callBot(res.error.code, null);
      } else {
        return callBot(false, null);
      }
    } else {
      return callBot(1, null);
    }
  }

};
