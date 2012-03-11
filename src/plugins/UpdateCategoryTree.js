WM.Plugins.UpdateCategoryTree = new function () {
    this.makeUI = function (args) {
        var tocs = args[0];
        
        var select = document.createElement('select');
        var option;
        for (var key in tocs) {
            option = document.createElement('option');
            option.value = JSON.stringify(tocs[key]);
            option.innerHTML = key;
            select.appendChild(option);
        }
        option = document.createElement('option');
        option.value = 'ALL';
        option.innerHTML = 'UPDATE ALL';
        select.appendChild(option);
        select.id = "UpdateCategoryTree-select";
        
        return select;
    };
    
    var createCatLink = function (cat, replace) {
        var regExp = new RegExp(replace[0], replace[1]);
        var catName = cat.substr(9).replace(regExp, replace[2]);
        return "[[:" + cat + "|" + catName + "]]";
    };
    
    var recurse = function (tree, params, indent, ancestors) {
        var info, parents, subAncestors;
        var text = "";
        
        for (var cat in tree) {
            WM.Log.logInfo("Processing " + cat + "...");
            
            text += indent + createCatLink(cat, params.replace) + " ";
            
            if (tree[cat] == "loop") {
                text += "'''[LOOP]'''\n";
                WM.Log.logWarning("Loop in " + cat);
            }
            else {
                info = WM.Cat.getInfo(cat);
                parents = WM.Cat.getParents(cat);
                
                text += "(" + ((info) ? info.pages : 0) + ") ";
                
                if (parents.length > 1) {
                    outer_loop:
                    for each (var par in parents) {
                        for (var anc in ancestors) {
                            if (par == anc) {
                                parents.splice(parents.indexOf(par), 1);
                                break outer_loop;
                            }
                        }
                    }
                    for (var i in parents) {
                        parents[i] = createCatLink(parents[i], params.replace);
                    }
                    text += "(" + params.alsoIn + " " + parents.join(", ") + ")";
                }
                
                text += "\n";
                
                // Create a copy of the object, not just a new reference
                subAncestors = JSON.parse(JSON.stringify(ancestors));
                
                subAncestors[cat] = true;
                subIndent = indent + params.indentType;
                
                text += recurse(tree[cat], params, subIndent, subAncestors);
            }
        }
        
        return text
    };
    
    var updateToC = function (toc, params, summary, minInterval) {
        var startMark = "START AUTO TOC - DO NOT REMOVE OR MODIFY THIS MARK-->";
        var endMark = "<!--END AUTO TOC - DO NOT REMOVE OR MODIFY THIS MARK";
        
        WM.Log.logInfo('Updating ' + toc + "...");
        
        var res = WM.MW.callAPIGet({action: "query",
                                    prop: "info|revisions",
                                    rvprop: "content|timestamp",
                                    intoken: "edit",
                                    titles: encodeURIComponent(toc)});
        var pages = res.query.pages;
        
        var pageid;
        for each (pageid in pages) {
            break;
        }
        
        var edittoken = pageid.edittoken;
        var timestamp = pageid.revisions[0].timestamp;
        var source = pageid.revisions[0]["*"];
        
        var now = new Date();
        var msTimestamp = Date.parse(timestamp);
        if (now.getTime() - msTimestamp >= minInterval) {
            var start = source.indexOf(startMark) + startMark.length;
            var end = source.lastIndexOf(endMark);
            
            if (start > -1 && end > -1) {
                var part1 = source.substring(0, start);
                var part2 = source.substring(end);
                
                var tree = WM.Cat.getTree(params.root);
                
                var treeText = recurse(tree, params, "", {});
                
                var newtext = part1 + "\n" + treeText + part2;
                
                if (newtext != source) {
                    res = WM.MW.callAPIPost({action: "edit",
                                             bot: "1",
                                             title: encodeURIComponent(toc),
                                             summary: encodeURIComponent(summary),
                                             text: encodeURIComponent(newtext),
                                             basetimestamp: timestamp,
                                             token: encodeURIComponent(edittoken)});
                    
                    if (res.edit && res.edit.result == 'Success') {
                        WM.Log.logInfo(toc + ' correctly updated');
                    }
                    else {
                        WM.Log.logError(toc + ' has not been updated!');
                    }
                }
                else {
                    WM.Log.logInfo(toc + ' is already up to date');
                }
            }
            else {
                WM.Log.logError("Cannot find insertion marks in " + toc);
            }
        }
        else {
            WM.Log.logWarning(toc + ' has been updated too recently');
        }
    };
    
    this.main = function (args) {
        var tocs = args[0];
        var summary = args[1];
        
        var minInterval;
        if (WM.MW.isUserBot()) {
            minInterval = 60000;
        }
        else {
            minInterval = 86400000;
        }
        
        var select = document.getElementById("UpdateCategoryTree-select");
        var option = select.options[select.selectedIndex];
        var toc = option.innerHTML;
        var value = option.value;
        
        if (value == 'ALL') {
            for (var key in tocs) {
                updateToC(key, tocs[key], summary, minInterval);
            }
        }
        else {
            var vals = JSON.parse(value);
            updateToC(toc, vals, summary, minInterval);
        }
    };
};
