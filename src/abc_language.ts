import {
  LanguageSupport,
  StreamLanguage,
  StreamParser,
  StringStream,
} from "@codemirror/language";

const RE_HEADER = /[a-zA-Z]:/;
const RE_FIELD = /%%.+/;
const RE_OPERATOR = /[-^=_.,&']+/;

class AbcParser implements StreamParser<null> {
  token(stream: StringStream) {
    if (stream.match(RE_HEADER)) {
      return "keyword";
    }
    if (stream.match(RE_FIELD)) {
      return "labelName";
    }
    if (stream.match(RE_OPERATOR)) {
      return "operator";
    }
    if (stream.eat("|")) {
      return "operator";
    }
    stream.next();
    return "string";
  }
}

export const AbcLanguageSupport = new LanguageSupport(
  StreamLanguage.define(new AbcParser())
);
