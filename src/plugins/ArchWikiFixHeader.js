WM.Plugins.ArchWikiFixHeader = new function () {
    var storeMatches = function (source, regExp, single) {
        var match, L, i;
        var result = [];
        while (true) {
            match = regExp.exec(source);
            if (match) {
                L = match[0].length;
                result.push(match);
                i = regExp.lastIndex;
                source = source.substring(0, i - L) + source.substring(i);
                regExp.lastIndex = i - L;
                if (single) {
                    break;
                }
            }
            else {
                break;
            }
        }
        return [source, result];
    };
    
    this.main = function (args) {
        var source = WM.Editor.readSource();
        
        var elements = {};
        
        // Note that all patterns get only left-side white space
        
        var res = storeMatches(source, /^\s*(&lt;noinclude&gt;)/g, true);
        elements.noinclude = res[1];
        
        res = storeMatches(res[0], /\s*(\{\{(DISPLAYTITLE:(.+?)|[Ll]owercase title)\}\})/g, false);
        elements.displaytitle = res[1];
        
        // Ignore __TOC__, __START__ and __END__
        res = storeMatches(res[0], /\s*(__(NOTOC|FORCETOC|NOEDITSECTION|NEWSECTIONLINK|NONEWSECTIONLINK|NOGALLERY|HIDDENCAT|NOCONTENTCONVERT|NOCC|NOTITLECONVERT|NOTC|INDEX|NOINDEX|STATICREDIRECT)__)/g, false);
        elements.behaviorswitches = res[1];
        
        res = storeMatches(res[0], /\s*(\[\[[Cc]ategory:(.+?([ _]\(([^\(]+?)\))?)\]\])/g, false);
        elements.categories = res[1];
        
        var interwikiLanguages = WM.ArchWiki.getInterwikiLanguages();
        var regExp = new RegExp("\\s*(\\[\\[(" + interwikiLanguages.join("|") + "):(.+?)\\]\\])", "g");
        res = storeMatches(res[0], regExp, false);
        elements.interwiki = res[1];
        
        res = storeMatches(res[0], /\s*(\{\{[Ii]18n\|(.+?)\}\})/g, true);
        elements.i18n = res[1];
        
        var content = res[0];
        
        var newtext = "";
        
        // if (elements.noinclude) is always true
        if (elements.noinclude.length) {
            newtext += elements.noinclude[0][1];
        }
        
        var L = elements.displaytitle.length;
        if (L) {
            newtext += elements.displaytitle[elements.displaytitle.length - 1][1];
            if (L > 1) {
                WM.Log.logWarning("Found multiple instances of {{DISPLAYTITLE:...}} or {{Lowercase title}}: only the last one has been used, the others have been deleted");
            }
        }
        
        var behaviorSwitches = [];
        for each (var sw in elements.behaviorswitches) {
            if (behaviorSwitches.indexOf(sw[1]) == -1) {
                behaviorSwitches.push(sw[1]);
            }
            else {
                WM.Log.logWarning("Removed duplicate of " + sw[1]);
            }
        }
        
        // if (behaviorSwitches) is always true
        if (behaviorSwitches.length) {
            if (newtext) {
                newtext += " ";
            }
            newtext += behaviorSwitches.join(" ");
        }
        
        if (newtext) {
            newtext += "\n";
        }
        
        var title = WM.Editor.getTitle().match(/^(.+?)([ _]\(([^\(]+)\))?$/);
        var detectedLanguage = decodeURIComponent(title[3]);
        var pureTitle;
        if (!detectedLanguage || !WM.ArchWiki.isCategoryLanguage(detectedLanguage)) {
            detectedLanguage = "English";
            pureTitle = decodeURIComponent(title[0]);
        }
        else {
            pureTitle = decodeURIComponent(title[1]);
        }
        
        var categories = [];
        var lang;
        for each (var cat in elements.categories) {
            lang = decodeURIComponent(cat[2]);
            if (!WM.ArchWiki.isCategoryLanguage(lang)) {
                lang = decodeURIComponent(cat[4]);
                if (!lang || !WM.ArchWiki.isCategoryLanguage(lang)) {
                    lang = "English";
                }
            }
            
            if (detectedLanguage != lang) {
                WM.Log.logWarning(cat[1] + " belongs to a different language than the one of the title (" + detectedLanguage + ")");
            }
            
            if (categories.indexOf(cat[1]) == -1) {
                categories.push(cat[1]);
            }
            else {
                WM.Log.logWarning("Removed duplicate of " + cat[1]);
            }
        }
        
        // if (categories) is always true
        if (categories.length) {
            newtext += categories.join("\n");
            newtext += "\n";
        }
        else {
            WM.Log.logWarning("The article is not categorized");
        }
        
        var interwiki = [];
        for each (var link in elements.interwiki) {
            if (interwiki.indexOf(link[1]) == -1) {
                interwiki.push(link[1]);
            }
            else {
                WM.Log.logWarning("Removed duplicate of " + link[1]);
            }
        }
        
        // if (interwiki) is always true
        if (interwiki.length) {
            newtext += interwiki.join("\n");
            newtext += "\n";
        }
        
        var L = elements.i18n.length;
        if (L) {
            if (L > 1) {
                WM.Log.logWarning("Found multiple instances of {{i18n|...}}: only the first one has been used, the others have been ignored");
            }
            
            var parsedTitle = elements.i18n[0][2].replace(/_/g, " ");
            var test1 = pureTitle.substr(0, 1).toLowerCase() != parsedTitle.substr(0, 1).toLowerCase();
            var test2 = pureTitle.substr(1) != parsedTitle.substr(1);
            
            if (test1 || test2) {
                newtext += "{{i18n|" + pureTitle + "}}";
                WM.Log.logWarning("Updated Template:i18n since it wasn't matching the current article title");
            }
            else {
                newtext += "{{i18n|" + parsedTitle + "}}";
            }
        }
        else {
            newtext += "{{i18n|" + pureTitle + "}}";
            WM.Log.logInfo("Added Template:i18n");
        }
        newtext += "\n";
        
        var firstChar = content.search(/[^\s]/);
        content = content.substr(firstChar);
        
        // This workaround shouldn't be necessary anymore
        //var test = content.substr(0, 2);
        //if (test != "{{" && test != "[[") {
            newtext += "\n";  // This line should be merged with the previous `newtext += "\n"`;
        //}
        
        newtext += content;
        
        if (newtext != source) {
            WM.Editor.writeSource(newtext);
            WM.Log.logInfo("Fixed header");
        }
    };
};
