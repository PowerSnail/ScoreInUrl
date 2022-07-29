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

function expect<T>(v: T | null, message: string): T {
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

  const linkUrl = <HTMLAnchorElement>(
    expect(document.getElementById("url"), "labelUrl not found")
  );
  linkUrl.removeAttribute("href");

  const btnCopy = <HTMLButtonElement>(
    expect(document.getElementById("copyUrl"), "btnCopy not found")
  );

  const btnDownload = <HTMLButtonElement>(
    expect(document.getElementById("btnDownload"), "btnDownload not found")
  );

  const btnPrintScore = <HTMLButtonElement>(
    expect(document.getElementById("btnPrintScore"), "btnPrintScore not found")
  );

  const synthControl = expect(
    loadAudioController("#audio", "#score"),
    "Cannot load audio controller"
  );

  const helpPanel = expect(
    document.getElementById("helpPanel"),
    "Cannot find helpPanel"
  );

  const sharePanel = expect(
    document.getElementById("sharePanel"),
    "Cannot find sharePanel"
  );

  const scoreWrapper = expect(
    document.getElementById("score"),
    "Cannot find score wrapper"
  );

  const btnHelp = <HTMLButtonElement>(
    expect(document.getElementById("btnHelp"), "btnHelp not found")
  );

  const btnShare = <HTMLButtonElement>(
    expect(document.getElementById("btnShare"), "btnShare not found")
  );

  const btnSaveImage = <HTMLButtonElement>(
    expect(document.getElementById("btnSaveImage"), "btnSaveImage not found")
  );

  btnHelp.addEventListener("click", () => {
    helpPanel.classList.remove("invisible");
  });

  btnShare.addEventListener("click", () => {
    sharePanel.classList.remove("invisible");
  });

  const btnCloseHelp = <HTMLButtonElement>(
    expect(document.getElementById("btnCloseHelp"), "btnCloseHelp not found")
  );

  btnCloseHelp.addEventListener("click", () => {
    helpPanel.classList.add("invisible");
  });

  helpPanel.addEventListener("click", (e) => {
    if (e.target == helpPanel) {
      helpPanel.classList.add("invisible");
    }
  });

  sharePanel.addEventListener("click", (e) => {
    if (e.target == sharePanel) {
      sharePanel.classList.add("invisible");
    }
  });

  btnCopy.addEventListener("click", () => {
    if (window.isSecureContext) {
      navigator.clipboard.writeText(linkUrl.href);
    } else {
      alert(MESSAGE_NO_COPY_CONTEXT);
    }
  });

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

          if (encoded == linkUrl.href) {
            // No update to content
            return;
          }
          linkUrl.href = encoded;
          expect(document.getElementById("urlSpan"), "No urlSpan").innerText =
            encoded;
          const visualObj = processScore(scoreWrapper, score);
          setAudio(synthControl, visualObj);

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
    parent: expect(
      document.getElementById("editorWrapper"),
      "editor Wrapper not found"
    ),
  });

  btnDownload.addEventListener("click", () => {
    synthControl.download("audio.wav");
  });

  btnPrintScore.addEventListener("click", () => {
    const w = expect(
      window.open("", "PRINT", "height=400,width=600"),
      "Cannot open window"
    );
    const d = w.document.body.parentElement;
    if (d == null) {
      return;
    }
    processScore(d, editor.state.doc.toString());
    w.print();
    w.close();
  });

  btnSaveImage.addEventListener("click", () => {
    const invisibleElement = document.createElement("div");
    invisibleElement.style.visibility = "hidden";
    processScore(invisibleElement, editor.state.doc.toString());
    const content = invisibleElement.innerHTML.replace(`xmlns:xlink="http://www.w3.org/1999/xlink"`, `xmlns="http://www.w3.org/2000/svg"`)
    const blob = new Blob([content], {type: "image/svg+xml"});
    const url = URL.createObjectURL(blob)
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "score.svg";
    downloadLink.click()
    downloadLink.remove()
  });

  editor.dispatch(
    editor.state.update({ changes: { from: 0, to: 0, insert: score } })
  );
}

init();
