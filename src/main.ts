import "./index.css";
import "./music.js";
import "./music.css";
import "abcjs/abcjs-audio.css";
import { loadAudioController, processScore, setAudio } from "./music.js";
import { decodeScore, encodeScore } from "./url";
import { DEFAULT_SCORE } from "./default_score";
import { basicSetup } from "codemirror";
import { EditorView } from "@codemirror/view";
import { AbcLanguageSupport } from "./abc_language";
import { lintGutter, setDiagnostics } from "@codemirror/lint";
import { makeDiagnostics } from "./diagnostics";

const MESSAGE_NO_COPY_CONTEXT =
  "This page is not viewed in a secure context, so copy is unuseable. Please click the url and press ctrl-C to copy.";

function notNull<T>(v: T | null, message: string): T {
  if (v == null) {
    throw new Error(message);
  }
  return v;
}

type Callable<A> = (...args: A[]) => void;

function delayed<A>(time_ms: number, task: Callable<A>): Callable<A> {
  let renderTask: number | null = null;
  return (...args: A[]) => {
    if (renderTask != null) {
      clearTimeout(renderTask);
    }
    renderTask = setTimeout(() => task(...args), time_ms);
  };
}

function init() {
  let score = decodeScore();
  if (score == null && window.location.search != "") {
    alert("Invalid URL, going back to Home");
    window.location.assign(window.location.origin);
  }
  score = score || DEFAULT_SCORE;

  const labelUrl = <HTMLInputElement>(
    notNull(document.getElementById("url"), "labelUrl not found")
  );
  labelUrl.value = "";

  const btnCopy = <HTMLButtonElement>(
    notNull(document.getElementById("copyUrl"), "btnCopy not found")
  );
  const synthControl = notNull(
    loadAudioController("#audio", "#score"),
    "Cannot load audio controller"
  );

  btnCopy.addEventListener("click", () => {
    if (window.isSecureContext) {
      navigator.clipboard.writeText(labelUrl.value);
    } else {
      alert(MESSAGE_NO_COPY_CONTEXT);
    }
  });

  labelUrl.addEventListener("focus", () =>
    labelUrl.setSelectionRange(0, labelUrl.value.length)
  );

  const editor = new EditorView({
    extensions: [
      basicSetup,
      AbcLanguageSupport,
      lintGutter(),
      EditorView.lineWrapping,
      EditorView.updateListener.of(
        delayed(300, (e) => {
          const score = e.state.doc.toString();
          const encoded = encodeScore(score);
          if (encoded == labelUrl.value) {
            // No update to content
            return;
          }
          labelUrl.value = encoded;
          const visualObj = processScore(score);
          setAudio(synthControl, visualObj);
          console.log(JSON.stringify(visualObj[0]["warnings"] ?? []))
          editor.dispatch(
            setDiagnostics(
              e.state,
              Array.from(
                makeDiagnostics(visualObj[0]["warnings"] ?? [], e.state)
              )
            )
          );
        })
      ),
    ],
    parent: notNull(
      document.getElementById("editorWrapper"),
      "editor Wrapper not found"
    ),
  });

  editor.dispatch(
    editor.state.update({ changes: { from: 0, to: 0, insert: score } })
  );
}

init();
