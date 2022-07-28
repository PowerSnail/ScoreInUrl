import "./src/index.css";
import "./src/music.js";
import "./src/music.css";
import "abcjs/abcjs-audio.css";
import { loadAudioController, processScore, setAudio } from "./src/music.js";
import { decode_score, encode_score } from "./src/url";
import { DEFAULT_SCORE } from "./src/default_score";
import { basicSetup } from "codemirror";
import { EditorView } from "@codemirror/view";
import { AbcLanguageSupport } from "./src/abc_language";
import { lintGutter, setDiagnostics } from "@codemirror/lint";
import { makeDiagnostics } from "./src/diagnostics";

var labelUrl = document.getElementById("url");
var btnCopy = document.getElementById("copyUrl");

btnCopy.addEventListener("click", (_) => {
  if (window.isSecureContext) {
    navigator.clipboard.writeText(labelUrl.value);
  } else {
    alert(
      "This page is not viewed in a secure context, so copy is unuseable. Please click the url and press ctrl-C to copy."
    );
  }
});
labelUrl.addEventListener("focus", (_) =>
  labelUrl.setSelectionRange(0, labelUrl.value.length)
);

let score = decode_score();
if (score == null && window.location.search != "") {
  alert("Invalid URL, going back to Home");
  window.location.assign(window.location.origin);
}
score = score || DEFAULT_SCORE;

let renderTask = null;
let synthControl = loadAudioController("#audio", "#score");
if (synthControl == null) {
  console.error("No audio context");
}

let editor = new EditorView({
  extensions: [
    basicSetup,
    AbcLanguageSupport,
    lintGutter(),
    EditorView.lineWrapping,
    EditorView.updateListener.of(function (e) {
      if (renderTask != null) {
        clearTimeout(renderTask);
      }
      renderTask = setTimeout(() => {
        let score = e.state.doc.toString();
        let encoded = encode_score(score);
        if (encoded != labelUrl.value) {
          labelUrl.value = encoded;
          let visualObj = processScore(score);
          if (synthControl) {
            setAudio(synthControl, visualObj);
          }
          let diagnostics = makeDiagnostics(visualObj[0].warnings, e.state);
          editor.dispatch(setDiagnostics(e.state, diagnostics));
        }
      }, 300);
    }),
  ],
  parent: document.getElementById("editorWrapper"),
});
labelUrl.value = "";
editor.dispatch(
  editor.state.update({ changes: { from: 0, to: 0, insert: score } })
);
document.body.classList.remove("invisible");
