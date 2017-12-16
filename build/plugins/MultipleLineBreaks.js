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
var Plugin;

({Plugin} = require('./_Plugin'));

module.exports.MultipleLineBreaks = (function() {
  class MultipleLineBreaks extends Plugin {
    main_editor(callNext) {
      var newtext, source;
      source = this.WM.Editor.readSource();
      newtext = source;
      newtext = newtext.replace(/[\n]{3,}/g, '\n\n');
      if (newtext !== source) {
        this.WM.Editor.writeSource(newtext);
        this.WM.Log.logInfo("Removed multiple line breaks");
      }
      if (callNext) {
        return callNext();
      }
    }

  };

  MultipleLineBreaks.conf_default = {
    enabled: true,
    editor_menu: ["Text plugins", "Squash multiple line breaks"]
  };

  return MultipleLineBreaks;

})();
