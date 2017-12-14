import os.path
import json

BUILD_PATH = './build/configurations/'
CONF_PATH = './configurations/'

COMMON = {
    "Bot": {
        "010SR": (
            "SimpleReplace",
            ("RegExp substitution", ),
            None,
        ),
        "020BL": (
            "FixBacklinkFragments",
            ("Fix links to specific sections of a target page", ),
            "fix links to specific sections"
        ),
    },
    "Diff": {},
    "Editor": {
        "040SL": (
            "FixFragments",
            ("Text plugins", "Fix section links"),
            None,
        ),
        "060EC": (
            "ExpandContractions",
            ("Text plugins", "Expand contractions"),
            None,
        ),
        "070ML": (
            "MultipleLineBreaks",
            ("Text plugins", "Squash multiple line breaks"),
            None,
        ),
        "110SR": (
            "SimpleReplace",
            ("RegExp substitution", ),
            None,
        ),
        "210ES": (
            "FixLinkFragments",
            ("Query plugins", "Fix external section links"),
            None,
        ),
    },
    "NewPages": {},
    "RecentChanges": {},
    "Special": {
        "020DR": (
            "FixDoubleRedirects",
            ("Fix double redirects", ),
            "fix double redirect"
        ),
    },
}

LOCAL = {
    "Bot": {
        "060AWC": (
            "ArchWikiWantedCategories",
            ("Create wanted categories", ),
            None,
        ),
        "070DP": (
            "DeletePages",
            ("Delete pages", ),
            "delete page"
        ),
        # The ArchPackages module is currently unusable
        # "040APT": (
        #     "ArchWikiUpdatePackageTemplates",
        #     ("Check packages linked with Pkg/AUR templates and "
        #      "possibly update them", ),
        #     "update Pkg/AUR templates to reflect new package status"
        # ),
        # "050AAL": (
        #     "ArchWikiOldAURLinks",
        #     ("Replace old-style direct AUR package links with "
        #      "Template:AUR", ),
        #     "replace old-style direct package links with Pkg/AUR templates"
        # ),
    },
    "Diff": {
        "020AST": (
            "ArchWikiSaveTalk",
            ("Save discussion", ),
            (
                "User:Kynikos/Tasks",
                "add discussion"
            )
        ),
    },
    "Editor": {
        # The ArchPackages module is currently unusable
        # "240APT": (
        #     "ArchWikiUpdatePackageTemplates",
        #     ("Query plugins", "Update package templates"),
        #     None,
        # ),
        # "230AAL": (
        #     "ArchWikiOldAURLinks",
        #     ("Query plugins", "Fix old AUR links"),
        #     None,
        # ),
    },
    "Special": {
        "030ASC": (
            "ArchWikiSortContacts",
            ("Sort contacts", "Sort Administrators"),
            (
                "ArchWiki:Administrators",
                30,
                30,
                "The following Administrators are currently inactive "
                "(less than 30 edits in the last 30 days):",
                "automatically sort list according to recent activity"
            )
        ),
        "040ASCM": (
            "ArchWikiSortContacts",
            ("Sort contacts", "Sort Maintainers"),
            (
                "ArchWiki:Maintainers",
                30,
                10,
                "The following Maintainers are currently inactive "
                "(less than 10 edits in the last 30 days):",
                "automatically sort list according to recent activity"
            )
        ),
    },
}

ARCHWIKI = {
    "Bot": {
        "030IL": (
            "SynchronizeInterlanguageLinks",
            ("Synchronize interlanguage links", ),
            (
                "ArchWiki",
                "ArchWiki",
                "ArchWiki",
                "synchronized interlanguage links with the other wikis"
            )
        ),
    },
    "Editor": {
        "010AHE": (
            "ArchWikiFixHeader",
            ("Text plugins", "Fix header"),
            None,
        ),
        "020ASE": (
            "ArchWikiFixHeadings",
            ("Text plugins", "Fix headings"),
            None,
        ),
        "030AEL": (
            "ArchWikiFixLinks",
            ("Text plugins", "Fix external links"),
            None,
        ),
        "050ACT": (
            "ArchWikiNewTemplates",
            ("Text plugins", "Use code templates"),
            None,
        ),
        "080ASR": (
            "ArchWikiSummaryToRelated",
            ("Text plugins", "Convert summary to related"),
            None,
        ),
        "220AIL": (
            "SynchronizeInterlanguageLinks",
            ("Query plugins", "Sync interlanguage links"),
            (
                "ArchWiki",
                "ArchWiki",
                "ArchWiki",
                None,
            )
        ),
    },
    "Diff": {
        "010AQR": (
            "ArchWikiQuickReport",
            ("Quick report", ),
            (
                "ArchWiki:Reports",
                "add report for %t"
            )
        ),
    },
    "NewPages": {
        "010ANP": (
            "ArchWikiNPFilter",
            ("Default filter", ),
            {
                "language": "English"
            }
        ),
    },
    "RecentChanges": {
        "010ARC": (
            "ArchWikiRCFilter",
            ("Default filter", ),
            {
                "language": "English"
            }
        ),
    },
    "Special": {
        "010CTar": (
            "UpdateCategoryTree",
            ("Update category trees", "Arabic"),
            (
                (
                    "ArchWiki",
                    "ar"
                ),
                "automatic update",
                False,
            )
        ),
        "010CTbg": (
            "UpdateCategoryTree",
            ("Update category trees", "Bulgarian"),
            (
                (
                    "ArchWiki",
                    "bg"
                ),
                "automatic update",
                False,
            )
        ),
        "010CTcs": (
            "UpdateCategoryTree",
            ("Update category trees", "Czech"),
            (
                (
                    "ArchWiki",
                    "cs"
                ),
                "automatic update",
                False,
            )
        ),
        "010CTda": (
            "UpdateCategoryTree",
            ("Update category trees", "Danish"),
            (
                (
                    "ArchWiki",
                    "da"
                ),
                "automatic update",
                False,
            )
        ),
        "010CTel": (
            "UpdateCategoryTree",
            ("Update category trees", "Greek"),
            (
                (
                    "ArchWiki",
                    "el"
                ),
                "automatic update",
                False,
            )
        ),
        "010CTen": (
            "UpdateCategoryTree",
            ("Update category trees", "English"),
            (
                (
                    "ArchWiki",
                    "en"
                ),
                "automatic update",
                False,
            )
        ),
        "010CTes": (
            "UpdateCategoryTree",
            ("Update category trees", "Spanish"),
            (
                (
                    "ArchWiki",
                    "es"
                ),
                "automatic update",
                False,
            )
        ),
        "010CThe": (
            "UpdateCategoryTree",
            ("Update category trees", "Hebrew"),
            (
                (
                    "ArchWiki",
                    "he"
                ),
                "automatic update",
                False,
            )
        ),
        "010CThr": (
            "UpdateCategoryTree",
            ("Update category trees", "Croatian"),
            (
                (
                    "ArchWiki",
                    "hr"
                ),
                "automatic update",
                False,
            )
        ),
        "010CThu": (
            "UpdateCategoryTree",
            ("Update category trees", "Hungarian"),
            (
                (
                    "ArchWiki",
                    "hu"
                ),
                "automatic update",
                False,
            )
        ),
        "010CTid": (
            "UpdateCategoryTree",
            ("Update category trees", "Indonesian"),
            (
                (
                    "ArchWiki",
                    "id"
                ),
                "automatic update",
                False,
            )
        ),
        "010CTit": (
            "UpdateCategoryTree",
            ("Update category trees", "Italian"),
            (
                (
                    "ArchWiki",
                    "it"
                ),
                "automatic update",
                False,
            )
        ),
        "010CTko": (
            "UpdateCategoryTree",
            ("Update category trees", "Korean"),
            (
                (
                    "ArchWiki",
                    "ko"
                ),
                "automatic update",
                False,
            )
        ),
        "010CTlt": (
            "UpdateCategoryTree",
            ("Update category trees", "Lithuanian"),
            (
                (
                    "ArchWiki",
                    "lt"
                ),
                "automatic update",
                False,
            )
        ),
        "010CTnl": (
            "UpdateCategoryTree",
            ("Update category trees", "Dutch"),
            (
                (
                    "ArchWiki",
                    "nl"
                ),
                "automatic update",
                False,
            )
        ),
        "010CTpl": (
            "UpdateCategoryTree",
            ("Update category trees", "Polish"),
            (
                (
                    "ArchWiki",
                    "pl"
                ),
                "automatic update",
                False,
            )
        ),
        "010CTpt": (
            "UpdateCategoryTree",
            ("Update category trees", "Portuguese"),
            (
                (
                    "ArchWiki",
                    "pt"
                ),
                "automatic update",
                False,
            )
        ),
        "010CTru": (
            "UpdateCategoryTree",
            ("Update category trees", "Russian"),
            (
                (
                    "ArchWiki",
                    "ru"
                ),
                "automatic update",
                False,
            )
        ),
        "010CTsk": (
            "UpdateCategoryTree",
            ("Update category trees", "Slovak"),
            (
                (
                    "ArchWiki",
                    "sk"
                ),
                "automatic update",
                False,
            )
        ),
        "010CTsr": (
            "UpdateCategoryTree",
            ("Update category trees", "Serbian"),
            (
                (
                    "ArchWiki",
                    "sr"
                ),
                "automatic update",
                False,
            )
        ),
        "010CTth": (
            "UpdateCategoryTree",
            ("Update category trees", "Thai"),
            (
                (
                    "ArchWiki",
                    "th"
                ),
                "automatic update",
                False,
            )
        ),
        "010CTtr": (
            "UpdateCategoryTree",
            ("Update category trees", "Turkish"),
            (
                (
                    "ArchWiki",
                    "tr"
                ),
                "automatic update",
                False,
            )
        ),
        "010CTuk": (
            "UpdateCategoryTree",
            ("Update category trees", "Ukrainian"),
            (
                (
                    "ArchWiki",
                    "uk"
                ),
                "automatic update",
                False,
            )
        ),
        "010CTzhhans": (
            "UpdateCategoryTree",
            ("Update category trees", "Chinese (Simplified)"),
            (
                (
                    "ArchWiki",
                    "zh-hans"
                ),
                "automatic update",
                False,
            )
        ),
        "010CTzhhant": (
            "UpdateCategoryTree",
            ("Update category trees", "Chinese (Traditional)"),
            (
                (
                    "ArchWiki",
                    "zh-hant"
                ),
                "automatic update",
                False,
            )
        ),
        "040ASCC": (
            "ArchWikiSortContacts",
            # Always disabled by default, but leave available for e.g.
            # Translation Teams
            None,
            None,
        ),
    },
}

WIKIPEDIA = {
    "Bot": {
        "030IL": (
            "SynchronizeInterlanguageLinks",
            # Always disabled by default, but leave available
            None,
            None,
        ),
    },
    "Editor": {
        "220IL": (
            "SynchronizeInterlanguageLinks",
            # Always disabled by default, but leave available
            None,
            None,
        ),
    },
    "Special": {
        "030CT": (
            "UpdateCategoryTree",
            # Always disabled by default, but leave available
            None,
            None,
        ),
    },
}

MODS = {
    "Contributions": {
        'hide_rollback_links': True,
    },
    "Editor": {
        'disable_edit_summary_submit_on_enter': True,
        'scroll_to_first_heading': False,
    },
    "General": {
        'heading_number_style': False,
    },
    "RecentChanges": {
        'hide_rollback_links': True,
    },
}

CONFIGS = {
    # COMMON is included by default
    # Names that start with an underscore ("_") are not turned into
    #  /configurations/*.json files
    '_local': (WIKIPEDIA, ARCHWIKI, LOCAL),
    'ArchWiki': (ARCHWIKI, ),
    'Wikipedia': (WIKIPEDIA, ),
}


def compile():
    os.makedirs(BUILD_PATH, exist_ok=True)
    os.makedirs(CONF_PATH, exist_ok=True)

    for cname, dicts in CONFIGS.items():
        cfg = {
            'Plugins': {},
            'Mods': MODS.copy(),
        }

        for interface, plugins in COMMON.items():
            cfg['Plugins'][interface] = {}

            for pluginid, plugincfg in plugins.items():
                cfg['Plugins'][interface][pluginid] = list(plugincfg)

        for dict_ in dicts:
            for interface, plugins in dict_.items():
                for pluginid, plugincfg in plugins.items():
                    cfg['Plugins'][interface][pluginid] = list(plugincfg)

        jdump = json.dumps(cfg, indent=4, sort_keys=True)

        with open(os.path.join(BUILD_PATH, cname + ".js"), 'w') as bf:
            bf.write('module.exports = {};'.format(jdump))

        if not cname.startswith('_'):
            with open(os.path.join(CONF_PATH, cname + ".json"), 'w') as jf:
                jf.write(jdump)
