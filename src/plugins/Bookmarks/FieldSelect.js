// Wiki Monkey - MediaWiki bot and editor-assistant user script
// Copyright (C) 2011 Dario Giovannetti <dev@dariogiovannetti.net>
//
// This file is part of Wiki Monkey.
//
// Wiki Monkey is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Wiki Monkey is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Wiki Monkey.  If not, see <http://www.gnu.org/licenses/>.

const {Vue, Vuex} = require('../../modules/libs')


module.exports.FieldSelect = {
  name: 'FieldSelect',

  computed: {
    ...Vuex.mapState('plugins/bookmarks', [
      'shownFields',
    ]),
  },

  methods: {
    ...Vuex.mapMutations('plugins/bookmarks', [
      'updateShownFields',
    ]),
  },

  render(h) { // eslint-disable-line max-lines-per-function
    return h('div', [h('ElSelect', {
      attrs: {title: "Select which fields to show in the table (the \
remaining ones will be listed in each row's expanded panel)"},
      props: {
        size: 'mini',
        multiple: true,
        collapseTags: true,
        value: this.shownFields,
      },
      on: {
        change: (values) => {
          this.updateShownFields(values)
        },
      },
    }, [
      ['id', 'id'],
      ['url', 'url'],
      ['section_id', 'section_id'],
      ['section_number', 'section_number'],
      ['section_title', 'section_title'],
      ['wgPageName', 'wgPageName'],
      ['wgRelevantPageName', 'wgRelevantPageName'],
      ['wgCanonicalSpecialPageName', 'wgCanonicalSpecialPageName'],
      ['wgCanonicalNamespace', 'wgCanonicalNamespace'],
      ['wgTitle', 'wgTitle'],
      ['wgAction', 'wgAction'],
      ['wgIsArticle', 'wgIsArticle'],
      ['wgIsProbablyEditable', 'wgIsProbablyEditable'],
      ['wgRelevantPageIsProbablyEditable', 'wgRelevantPageIsProbablyEditable'],
      ['wgPageContentLanguage', 'wgPageContentLanguage'],
      ['wgPageContentModel', 'wgPageContentModel'],
      ['wgArticleId', 'wgArticleId'],
      ['wgNamespaceNumber', 'wgNamespaceNumber'],
      ['wgRevisionId', 'wgRevisionId'],
      ['wgCurRevisionId', 'wgCurRevisionId'],
      ['wgDiffOldId', 'wgDiffOldId'],
      ['wgDiffNewId', 'wgDiffNewId'],
      ['time_created', 'time_created'],
      ['time_updated', 'time_updated'],
    ].map(([key, label]) => {
      return h('ElOption', {
        props: {
          key,
          label,
          value: key,
        },
      })
    }))])
  },
}
