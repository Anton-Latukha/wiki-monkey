/*
 *  Wiki Monkey - MediaWiki bot and editor assistant that runs in the browser
 *  Copyright (C) 2011-2015 Dario Giovannetti <dev@dariogiovannetti.net>
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

WM.Cfg = new function () {
    "use strict";

    this._makeUI = function () {
        /*
         * Creating the preferences interface shouldn't rely on the saved
         * configuration, in order to always make it possible to fix a
         * misconfiguration
         */
        Alib.CSS.addStyleElement("#WikiMonkey-prefsection textarea {" +
                                                            "height:30em;} " +
            "#WikiMonkey-prefsection div, #WikiMonkey-prefsection p.message " +
                            "{display:inline-block; margin-bottom:0.5em;} " +
            "#WikiMonkey-prefsection input {margin-right:0.5em;}" +
            "#WikiMonkey-prefsection input[value='Save'] {font-weight:bold;}");

        var toc = $("#preftoc");
        var tlinks = toc.find("a").click(WM.Cfg._hideEditor);

        var link = $("<a/>")
            .attr({"id": "WikiMonkey-preftab", "href": "#wiki-monkey"})
            .text("Wiki Monkey")
            .click(WM.Cfg._showEditor);

        $("<li/>").appendTo(toc).append(link);

        var editor = $("<fieldset/>")
                        .addClass("prefsection")
                        .attr("id", "WikiMonkey-prefsection")
                        .hide();
        $("<legend/>")
            .addClass("mainLegend")
            .text("Wiki Monkey")
            .appendTo(editor);

        var bdiv = $("<div/>");
        $("<input/>")
            .attr("type", "button")
            .val("Save").click(saveEditor)
            .appendTo(bdiv);
        $("<input/>")
            .attr("type", "button")
            .val("Reset")
            .click(resetEditor)
            .appendTo(bdiv);
        $("<input/>")
            .attr("type", "button")
            .val("Defaults")
            .click(requestDefaults)
            .appendTo(bdiv);
        $("<input/>")
            .attr("type", "button")
            .val("Import")
            .click(importFile)
            .appendTo(bdiv);
        $("<input/>")
            .attr({"type": "file", "id": "WikiMonkey-import"})
            .change(doImportFile)
            .appendTo(bdiv)
            .hide();
        $("<input/>")
            .attr("type", "button")
            .val("Export")
            .click(exportEditor)
            .appendTo(bdiv);
        $("<a/>")
            .attr({"id": "WikiMonkey-export", "download": "WikiMonkey.conf"})
            .appendTo(bdiv);
        editor.append(bdiv);

        var help = $("<a/>")
            .attr("href", "https://github.com/kynikos/wiki-monkey/wiki")
            .text("[help]");

        $("<p/>")
            .addClass("message")
            .text("All pages running Wiki Monkey need to be refreshed " +
                                        "for saved changes to take effect. ")
            .append(help).appendTo(editor);

        $("<textarea/>").attr("id", "WikiMonkey-editor").appendTo(editor);

        $("<p/>")
            .text('Wiki Monkey version: ' + GM_info.script.version)
            .appendTo(editor);

        $("<p/>")
            .text("Actually installed plugins (in general, a subset of " +
                                    "those set in the loaded configuration):")
            .appendTo(editor);

        var list = $("<ul/>");

        for (var plugin in WM.Plugins) {
            $("<li/>").text(plugin).appendTo(list);
        }

        list.appendTo(editor);

        $("#preferences").children("fieldset").last().after(editor);

        resetEditor();

        if (location.hash == "#wiki-monkey") {
            WM.Cfg._showEditor();
        }
    };

    this._showEditor = function () {
        var tab = $("#WikiMonkey-preftab").parent();
        tab.siblings(".selected").removeClass("selected");
        tab.addClass("selected");

        var editor = $("#WikiMonkey-prefsection");
        editor.siblings("fieldset").hide();
        editor.show();

        editor.siblings(".mw-prefs-buttons").hide();
    };

    this._hideEditor = function () {
        $("#WikiMonkey-preftab").parent().removeClass("selected");

        var editor = $("#WikiMonkey-prefsection");
        editor.hide()
        editor.siblings(".mw-prefs-buttons").show();
    };

    var config = {};

    var DEFAULTS_REQUEST = "WARNING: If you click on the \"Save\" button " +
        "now, the saved configuration will be reset to the default values " +
        "at the next refresh!\nTo cancel this request, simply click on the " +
        "\"Reset\" button.";

    this._load = function(defaultConfig) {
        // Upper-scope config
        config = defaultConfig;

        var savedConfig = JSON.parse(localStorage.getItem("WikiMonkey"));

        if (savedConfig) {
            for (var section in savedConfig) {
                for (var type in config[section]) {
                    if (savedConfig[section][type]) {
                        // Don't do a deep (recursive) merge! It would also
                        // merge the plugins' arguments, and also other
                        // possible unexpected effects
                        $.extend(config[section][type],
                                                savedConfig[section][type]);
                    }
                }
            }
        }

        save();
    };

    this._getEditorPlugins = function() {
        return config["Plugins"]["Editor"];
    };

    this._getDiffPlugins = function() {
        return config["Plugins"]["Diff"];
    };

    this._getBotPlugins = function() {
        return config["Plugins"]["Bot"];
    };

    this._getSpecialPlugins = function() {
        return config["Plugins"]["Special"];
    };

    this._getRecentChangesPlugins = function() {
        return config["Plugins"]["RecentChanges"];
    };

    this._getNewPagesPlugins = function() {
        return config["Plugins"]["NewPages"];
    };

    this._getEditorMods = function() {
        return config["Mods"]["Editor"];
    };

    var save = function() {
        localStorage.setItem("WikiMonkey", JSON.stringify(config));
    };

    var saveEditor = function () {
        var text = $("#WikiMonkey-editor").val();

        try {
            // Upper-scope config
            config = JSON.parse(text)
        }
        catch (err) {
            if (text == DEFAULTS_REQUEST) {
                /*
                 * Setting config to {} will make it be completely overridden
                 * when the configuration is reloaded at the next refresh
                 */
                // Upper-scope config
                config = {};
                $("#WikiMonkey-editor").val("The configuration has been " +
                    "reset to the default values and will be available " +
                    "after refreshing the page.");
            }
            else {
                alert("Not a valid JSON object, the configuration has not " +
                                                                "been saved.");
                return false;
            }
        }

        save();
    };

    var resetEditor = function () {
        $("#WikiMonkey-editor").val(JSON.stringify(config, undefined, 4));
    };

    var requestDefaults = function () {
        $("#WikiMonkey-editor").val(DEFAULTS_REQUEST);
    };

    var importFile = function () {
        $("#WikiMonkey-import").trigger("click");
    };

    var doImportFile= function () {
        var file = this.files[0];
        var freader = new FileReader();

        freader.onload = function(fileLoadedEvent) {
            $("#WikiMonkey-editor").val(fileLoadedEvent.target.result);
        };

        freader.readAsText(file, "UTF-8");
    };

    var exportEditor = function () {
        var blob = new Blob([$("#WikiMonkey-editor").val()],
                                                        {type:'text/plain'});
        $("#WikiMonkey-export")
            .attr("href", window.URL.createObjectURL(blob))
            // .trigger("click"); doesn't work
            [0].click();
    };
};
