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
var Str,
  indexOf = [].indexOf;

Str = require('../../lib.js.generic/dist/Str');

module.exports = class exports {
  constructor(WM) {
    this.mainContinue = this.mainContinue.bind(this);
    this.readToC = this.readToC.bind(this);
    this.processToC = this.processToC.bind(this);
    this.storeAlternativeNames = this.storeAlternativeNames.bind(this);
    this.processCategory = this.processCategory.bind(this);
    this.processCategoryAddSuffix = this.processCategoryAddSuffix.bind(this);
    this.processCategoryEnd = this.processCategoryEnd.bind(this);
    this.createCatLink = this.createCatLink.bind(this);
    this.writeToC = this.writeToC.bind(this);
    this.checkWrite = this.checkWrite.bind(this);
    this.WM = WM;
  }

  main(args, callNext) {
    var inparams, params, showRootAlsoIn, summary;
    inparams = args[0];
    summary = args[1];
    // The third argument was added in 2.0.7, therefore previous
    // configurations don't have it
    if (args[2] != null) {
      showRootAlsoIn = args[2];
    } else {
      showRootAlsoIn = false;
      this.WM.Log.logInfo("The configuration does not specify the " + "showRootAlsoIn value, defaulting to false");
    }
    if (inparams.constructor === Array) {
      if (inparams[0] === "ArchWiki") {
        params = this.WM.ArchWiki.getTableOfContents(inparams[1]);
      } else {
        this.WM.Log.logError("Unrecognized parameter");
        return false;
      }
    } else {
      params = inparams;
    }
    return this.WM.MW.isUserBot(this.mainContinue, [params, showRootAlsoIn, summary, callNext]);
  }

  mainContinue(botTest, args) {
    return this.readToC({
      params: args[0],
      minInterval: botTest ? 60000 : 21600000,
      edittoken: "",
      timestamp: "",
      source: "",
      startId: 0,
      endId: 0,
      treeText: "",
      startMark: "START AUTO TOC - DO NOT REMOVE OR MODIFY THIS MARK-->",
      endMark: "<!--END AUTO TOC - DO NOT REMOVE OR MODIFY THIS MARK",
      altNames: {},
      showRootAlsoIn: args[1],
      summary: args[2],
      callNext: args[3]
    });
  }

  readToC(args) {
    this.WM.Log.logInfo('Updating ' + this.WM.Log.linkToWikiPage(args.params.page, args.params.page) + " ...");
    return this.WM.MW.callQueryEdit(args.params.page, this.processToC, args);
  }

  processToC(title, source, timestamp, edittoken, args) {
    var end, msTimestamp, now, start;
    args.source = source;
    args.timestamp = timestamp;
    args.edittoken = edittoken;
    now = new Date();
    msTimestamp = Date.parse(args.timestamp);
    if (now.getTime() - msTimestamp >= args.minInterval) {
      start = args.source.indexOf(args.startMark);
      end = args.source.lastIndexOf(args.endMark);
      if (start > -1 && end > -1) {
        args.startId = start + args.startMark.length;
        args.endId = end;
        args.treeText = "";
        args.altNames = args.params.keepAltName ? this.storeAlternativeNames(args.source) : {};
        return this.WM.Cat.recurseTree({
          node: args.params.root,
          callNode: this.processCategory,
          callEnd: this.writeToC,
          callArgs: args
        });
      } else {
        this.WM.Log.logError("Cannot find insertion marks in " + this.WM.Log.linkToWikiPage(args.params.page, args.params.page));
        if (args.callNext) {
          return args.callNext();
        }
      }
    } else {
      this.WM.Log.logWarning(this.WM.Log.linkToWikiPage(args.params.page, args.params.page) + ' has been updated too recently');
      if (args.callNext) {
        return args.callNext();
      }
    }
  }

  storeAlternativeNames(source) {
    var dict, match, regExp;
    dict = {};
    regExp = /\[\[\:([Cc]ategory\:.+?)\|(.+?)\]\]/gm;
    while (true) {
      match = regExp.exec(source);
      if (match) {
        dict[match[1].toLowerCase()] = match[2];
      } else {
        break;
      }
    }
    return dict;
  }

  processCategory(params) {
    var altName, args, indices, j, node, ref, text;
    args = params.callArgs;
    this.WM.Log.logInfo("Processing " + this.WM.Log.linkToWikiPage(params.node, params.node) + " ...");
    text = "";
    for (j = 0, ref = params.ancestors.length; 0 <= ref ? j < ref : j > ref; 0 <= ref ? j++ : j--) {
      text += args.params.indentType;
    }
    if (args.params.showIndices) {
      indices = [];
      node = params;
      while (node.parentIndex !== null) {
        indices.push(node.siblingIndex + 1);
        node = params.nodesList[node.parentIndex];
      }
      if (indices.length) {
        text += "<small>" + indices.reverse().join(".") + ".</small> ";
      }
    }
    altName = args.altNames[params.node.toLowerCase()] ? args.altNames[params.node.toLowerCase()] : null;
    text += this.createCatLink(params.node, args.params.replace, altName);
    text += args.params.rightToLeft ? "&lrm; " : " ";
    if (params.children === "loop") {
      text += "'''[LOOP]'''\n";
      this.WM.Log.logWarning("Loop in " + this.WM.Log.linkToWikiPage(params.node, params.node));
      return this.processCategoryEnd(params, args, text);
    } else {
      return this.WM.Cat.getParentsAndInfo(params.node, this.processCategoryAddSuffix, [params, args, text, altName]);
    }
  }

  processCategoryAddSuffix(parents, info, args_) {
    var alsoParents, altName, args, currParent, i, j, k, len, len1, par, params, parentTitles, text;
    params = args_[0];
    args = args_[1];
    text = args_[2];
    altName = args_[3];
    currParent = params.ancestors[params.ancestors.length - 1];
    alsoParents = [];
    text += "<small>(" + (info ? info.pages : 0) + ")";
    // Allow hiding the "also in" (whose currParent is undefined) links for
    // the root item, since the root's parent category would be displayed
    // there
    if (currParent || args.showRootAlsoIn) {
      for (j = 0, len = parents.length; j < len; j++) {
        par = parents[j];
        if (currParent !== par.title && !(indexOf.call(par, "hidden") >= 0)) {
          alsoParents.push(par);
        }
      }
      if (alsoParents.length) {
        parentTitles = [];
        for (k = 0, len1 = alsoParents.length; k < len1; k++) {
          i = alsoParents[k];
          altName = args.altNames[alsoParents[i].title.toLowerCase()] ? args.altNames[alsoParents[i].title.toLowerCase()] : null;
          parentTitles.push(this.createCatLink(alsoParents[i].title, args.params.replace, altName));
        }
        text += " (" + args.params.alsoIn + " " + parentTitles.join(", ") + ")";
      }
    }
    text += "</small>\n";
    return this.processCategoryEnd(params, args, text);
  }

  processCategoryEnd(params, args, text) {
    args.treeText += text;
    params.callArgs = args;
    return this.WM.Cat.recurseTreeContinue(params);
  }

  createCatLink(cat, replace, altName) {
    var catName, regExp;
    if (altName) {
      catName = altName;
    } else if (replace) {
      regExp = new RegExp(replace[0], replace[1]);
      catName = cat.substr(9).replace(regExp, replace[2]);
    } else {
      catName = cat.substr(9);
    }
    return "[[:" + cat + "|" + catName + "]]";
  }

  writeToC(params) {
    var args, newtext;
    args = params.callArgs;
    args.treeText = "\n" + args.treeText;
    newtext = Str.overwriteBetween(args.source, args.treeText, args.startId, args.endId);
    if (newtext !== args.source) {
      return this.WM.MW.callAPIPost({
        action: "edit",
        bot: "1",
        minor: "1",
        title: args.params.page,
        summary: args.summary,
        text: newtext,
        basetimestamp: args.timestamp,
        token: args.edittoken
      }, this.checkWrite, args, null);
    } else {
      this.WM.Log.logInfo(this.WM.Log.linkToWikiPage(args.params.page, args.params.page) + ' is already up to date');
      if (args.callNext) {
        return args.callNext();
      }
    }
  }

  checkWrite(res, args) {
    if (res.edit && res.edit.result === 'Success') {
      this.WM.Log.logInfo(this.WM.Log.linkToWikiPage(args.params.page, args.params.page) + ' correctly updated');
      if (args.callNext) {
        return args.callNext();
      }
    } else {
      return this.WM.Log.logError(this.WM.Log.linkToWikiPage(args.params.page, args.params.page) + ' has not been updated!\n' + res['error']['info'] + " (" + res['error']['code'] + ")");
    }
  }

};
