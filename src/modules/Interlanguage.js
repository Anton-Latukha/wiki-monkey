/*
 *  Wiki Monkey - MediaWiki bot and editor assistant that runs in the browser
 *  Copyright (C) 2011-2013 Dario Giovannetti <dev@dariogiovannetti.net>
 *
 *  This file is part of Wiki Monkey.
 *
 *  Wiki Monkey is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Wiki Monkey is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Wiki Monkey.  If not, see <http://www.gnu.org/licenses/>.
 */

WM.Interlanguage = new function () {
    this.parseLinks = function (whitelist, source, iwmap) {
        var parsedLinks = WM.Parser.findSpecialLinks(
            source,
            whitelist.join("|")
        );

        var langlinks = [];
        for (var p in parsedLinks) {
            var link = parsedLinks[p];
            // Do not store the tag lowercased, since it should be kept as
            // original
            var ltag = link.match[2];
            var ltitle = link.match[3];
            for (var iw in iwmap) {
                if (iwmap[iw].prefix.toLowerCase() == ltag.toLowerCase()) {
                    // Fix the url _before_ replacing $1
                    var lurl = WM.MW.fixInterwikiUrl(iwmap[iw].url);
                    lurl = lurl.replace("$1", encodeURIComponent(WM.Parser.squashContiguousWhitespace(ltitle)));
                    break;
                }
            }
            langlinks.push({
                lang: ltag,
                title: ltitle,
                url: lurl,
                index: link.index,
                length: link.length,
            });
        }

        return langlinks;
    };

    this.queryLinks = function (api, queryTitle, title, whitelist, redirects, callEnd, callArgs) {
        var query = {
            action: "query",
            prop: "info|revisions",
            rvprop: "content|timestamp",
            intoken: "edit",
            titles: queryTitle,
            meta: "siteinfo",
            siprop: "interwikimap",
            sifilteriw: "local",
        }

        // When called by the bot, if the start page is a redirect itself,
        // it shoudln't be resolved
        if (redirects) {
            query.redirects = "1";
        }

        WM.MW.callAPIGet(
            query,
            api,
            function (res, args) {
                var page = Alib.Obj.getFirstItem(res.query.pages);
                if (page.revisions) {
                    var source = page.revisions[0]["*"];
                    var timestamp = page.revisions[0].timestamp;
                    var edittoken = page.edittoken;
                    var iwmap = res.query.interwikimap;
                    var langlinks = WM.Interlanguage.parseLinks(whitelist, source, iwmap);
                }
                else {
                    // The requested article doesn't exist
                    var source = false;
                    var timestamp = false;
                    var edittoken = false;
                    var iwmap = res.query.interwikimap;
                    var langlinks = false;
                }

                callEnd(
                    api,
                    title,
                    whitelist,
                    // From now on, redirects can be followed
                    true,
                    langlinks,
                    iwmap,
                    source,
                    timestamp,
                    edittoken,
                    args
                );
            },
            callArgs
        );
    };

    this.createNewLink = function (origTag, title, url) {
        return {
            origTag: origTag,
            title: title,
            url: url,
        };
    };

    this.createVisitedLink = function (origTag, title, url, iwmap, api, source, timestamp, edittoken, links) {
        var entry = {
            origTag: origTag,
            title: title,
            url: url,
            iwmap: iwmap,
            api: api,
            source: source,
            timestamp: timestamp,
            edittoken: edittoken,
            links: [],
        };
        for (var l in links) {
            entry.links.push(links[l]);
        }
        return entry;
    };

    this.collectLinks = function (visitedlinks, newlinks, whitelist, redirects, callEnd, callArgs) {
        for (var tag in newlinks) {
            var link = newlinks[tag];
            break;
        }

        if (link) {
            delete newlinks[tag];

            var url = link.url;

            // Don't use WM.MW.getTitleFromWikiUrl(decodeURI(url)) because
            // it wouldn't decode some characters like colons, which are
            // required to be decoded instead when making an API call
            var queryTitle = decodeURIComponent(WM.MW.getTitleFromWikiUrl(url));

            if (queryTitle) {
                WM.Log.logInfo("Reading " + decodeURI(url) + "...");

                var origTag = link.origTag;
                var title = link.title;
                var api = WM.MW.getWikiUrls(url).api;

                this.queryLinks(
                    api,
                    queryTitle,
                    title,
                    whitelist,
                    redirects,
                    WM.Interlanguage._collectLinksContinue,
                    [url, tag, origTag, visitedlinks, newlinks, callEnd, callArgs]
                );
            }
            else {
                WM.Log.logWarning("Cannot extract the page title from " + decodeURI(url));
                WM.Interlanguage.collectLinks(
                    visitedlinks,
                    newlinks,
                    whitelist,
                    redirects,
                    callEnd,
                    callArgs
                );
            }
        }
        else {
            callEnd(visitedlinks, callArgs);
        }
    };

    this._collectLinksContinue = function (api, title, whitelist, redirects, langlinks, iwmap, source, timestamp, edittoken, args) {
        var url = args[0];
        var tag = args[1];
        var origTag = args[2];
        var visitedlinks = args[3];
        var newlinks = args[4];
        var callEnd = args[5];
        var callArgs = args[6];

        if (langlinks === false) {
            WM.Log.logWarning("[[" + tag + ":" + title + "]] seems to point to a non-existing article, removing it if it was linked from the processed article");
        }
        else {
            visitedlinks[tag] = WM.Interlanguage.createVisitedLink(origTag, title, url, iwmap, api, source, timestamp, edittoken, langlinks);

            for (var l in langlinks) {
                var link = langlinks[l];
                var nlink = newlinks[link.lang.toLowerCase()];
                var vlink = visitedlinks[link.lang.toLowerCase()];

                if (!vlink && !nlink) {
                    newlinks[link.lang.toLowerCase()] = WM.Interlanguage.createNewLink(link.lang, link.title, link.url);
                }
                else if (vlink && vlink.url != link.url) {
                    // Just ignore any conflicting links and warn the user:
                    // if it's a real conflict, the user will investigate it,
                    // otherwise the user will ignore it
                    WM.Log.logWarning("Possibly conflicting interlanguage links: [[" + link.lang + ":" + link.title + "]] and [[" + link.lang + ":" + visitedlinks[link.lang.toLowerCase()].title + "]]");
                }
                else if (nlink && nlink.url != link.url) {
                    // Just ignore any conflicting links and warn the user:
                    // if it's a real conflict, the user will investigate it,
                    // otherwise the user will ignore it
                    WM.Log.logWarning("Possibly conflicting interlanguage links: [[" + link.lang + ":" + link.title + "]] and [[" + link.lang + ":" + newlinks[link.lang.toLowerCase()].title + "]]");
                }
            }
        }

        WM.Interlanguage.collectLinks(
            visitedlinks,
            newlinks,
            whitelist,
            redirects,
            callEnd,
            callArgs
        );
    };

    this.updateLinks = function (lang, url, iwmap, source, oldlinks, newlinks) {
        lang = lang.toLowerCase();
        var linkList = [];

        for (var tag in newlinks) {
            if (tag != lang) {
                var link = newlinks[tag];
                var tagFound = false;
                for (var iw in iwmap) {
                    if (iwmap[iw].prefix.toLowerCase() == tag.toLowerCase()) {
                        if (WM.MW.getWikiUrls(iwmap[iw].url).api == link.api) {
                            linkList.push("[[" + link.origTag + ":" + link.title + "]]");
                        }
                        else {
                            WM.Log.logWarning("On " + decodeURI(url) + ", " + tag + " interlanguage links point to a different wiki than the others, ignoring them");
                        }
                        tagFound = true;
                        break;
                    }
                }
                if (!tagFound) {
                    WM.Log.logWarning(tag + " interlanguage links are not supported in " + decodeURI(url) + ", ignoring them");
                }
            }
        }

        linkList.sort(
            function (a, b) {
                // Sorting is case sensitive by default
                if (a.toLowerCase() > b.toLowerCase())
                    return 1;
                if (b.toLowerCase() > a.toLowerCase())
                    return -1;
                else
                    return 0;
            }
        );

        var cleanText = "";
        var textId = 0;
        for (var l in oldlinks) {
            var link = oldlinks[l];
            cleanText += source.substring(textId, link.index);
            textId = link.index + link.length;
        }
        cleanText += source.substring(textId);

        if (oldlinks.length) {
            // Insert the new links at the index of the first previous link
            var firstLink = oldlinks[0].index;
        }
        else {
            var firstLink = 0;
        }

        var parts = [
            cleanText.substring(0, firstLink).trim(),
            linkList.join("\n"),
            cleanText.substr(firstLink).trim()
        ]

        var newText = "";

        for (var p = 0; p < 3; p++) {
            newText += parts[p] + ((parts[p]) ? "\n" : "");
        }

        return newText;
    };
};
