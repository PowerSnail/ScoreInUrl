// Copyright (c) 2022 PowerSnail
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { LanguageSupport, StreamLanguage } from "@codemirror/language";

let re_header = new RegExp('[a-zA-Z]:')
let re_field = new RegExp('%%.+')
let re_operator = new RegExp('[-^=_\.,&\']+')

class AbcParser {
    token(stream, state) {
        if (stream.match(re_header)) {
            return "keyword"
        }
        if (stream.match(re_field)) {
            return "labelName"
        }
        if (stream.match(re_operator)) {
            return "operator"
        }
        if (stream.eat("|")) {
            return "operator"
        }
        stream.next()
        return "string"
    }
}

export const AbcLanguageSupport = new LanguageSupport(StreamLanguage.define(new AbcParser()))