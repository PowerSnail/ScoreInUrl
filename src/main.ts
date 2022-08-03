import "./index.css";
import "./music.js";
import "./music.css";
import "abcjs/abcjs-audio.css";
import { loadAudioController, processScore, setAudio } from "./music.js";
import { basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { AbcLanguageSupport } from "./abc_language";
import { lintGutter, setDiagnostics } from "@codemirror/lint";
import { makeDiagnostics } from "./diagnostics";
import { delayed, expect, expectElementById } from "./util";

const MESSAGE_NO_COPY_CONTEXT = `This page is not viewed in a secure context, so copy is unuseable.
Please copy the URL from the browser's address bar manually.`;

const DEFAULT_SCORE = `T: Air on G String
C: J.S. Bach (arr. August Wilhelmj.)
Q: "Lento"
M: 4/4
L: 1/16
K: Cmaj
|: E16- | E2(AF DCB,C) (!trill!B,7/2A,/2) G,4 | G8- G(E_B,A,) (D^C)(GF) | 
F8- F(DA,G,) (CB,)(FE) | (E6 ^FG) (C2C/2D/2E) (ED)(DC) | (B,A,)(A,/2B,/2C) (C2B,A,) G,8 :| 
|: (B,4-B,C/2B,/2A,/2B,/2G,) (G6 _B,2) | (A,2A2- A)(GFE) {/E}F4- F/2(E/2D/2C/2B,A,) | ^G,A,(B,2- B,C)(D2- DE)F2- F2E2 |
(DC)(B,A,) (B,C/2D/2CB,) A,8 | (C4- CEDC) (A6 G^F) | ({/E}DGG,2) (A,3B,/2C/2) (B,7/2A,/2) G,4 | 
C6 (ED) D6 (FE) | E6 (GF) F8 | G,4- G,B,DF FDE2- E2(EF/2G/2) | 
(C4- CEG_B) (B2 A4 C2) | (B,D F4 A,2) (G,2DE/2F/2- F)(E2D | C/2B,/2)(A,2B,) (B,2{/A,}B,C) C8 :|
`;

function decodeScore(): string {
  console.info("decode score: " + window.location.href);
  const params = new URL(window.location.href).searchParams;
  const encoded = params.get("s");
  if (encoded != null) {
    try {
      return window.atob(encoded);
    } catch (e) {
      alert("URL not valid. Redirecting back home...");
    }
  }
  return DEFAULT_SCORE
}

function encodeScore(content: string) {
  const encoded = window.btoa(content);
  const url = new URL(document.location.href);
  url.searchParams.set("s", encoded);
  return url.toString();
}

function init() {
  const score = decodeScore();

  const btnCopy = expectElementById<HTMLButtonElement>("copyUrl");
  const btnDownload = expectElementById<HTMLButtonElement>("btnDownload");
  const btnPrintScore = expectElementById<HTMLButtonElement>("btnPrintScore");
  const helpPanel = expectElementById<HTMLDivElement>("helpPanel");
  const sharePanel = expectElementById<HTMLDivElement>("sharePanel");
  const scoreWrapper = expectElementById<HTMLDivElement>("score");
  const btnHelp = expectElementById<HTMLButtonElement>("btnHelp");
  const btnShare = expectElementById<HTMLButtonElement>("btnShare");
  const btnSaveImage = expectElementById<HTMLButtonElement>("btnSaveImage");
  const synthControl = expect(
    loadAudioController("#audio", "#score"),
    "Cannot load audio controller"
  );

  function updateScore(score: string, state: EditorState) {
    const encoded = encodeScore(score);

    history.replaceState(null, "", encoded);
    const visualObj = processScore(scoreWrapper, score);
    setAudio(synthControl, visualObj);

    editor.dispatch(
      setDiagnostics(
        state,
        Array.from(makeDiagnostics(visualObj[0]["warnings"] ?? [], state))
      )
    );
  }

  const editor = new EditorView({
    doc: score,
    extensions: [
      basicSetup,
      AbcLanguageSupport,
      lintGutter(),
      EditorView.lineWrapping,
      EditorView.updateListener.of(
        delayed(300, (e) => {
          if (!e.docChanged) {
            return;
          }
          const score = e.state.doc.toString();
          updateScore(score, e.state);
        })
      ),
    ],
    parent: expectElementById<HTMLDivElement>("editorWrapper"),
  });

  btnCopy.addEventListener("click", () => {
    if (window.isSecureContext) {
      navigator.clipboard.writeText(window.location.href);
    } else {
      alert(MESSAGE_NO_COPY_CONTEXT);
    }
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

  btnHelp.addEventListener("click", () => {
    helpPanel.classList.remove("invisible");
  });

  btnShare.addEventListener("click", () => {
    sharePanel.classList.remove("invisible");
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

  btnSaveImage.addEventListener("click", () => {
    const invisibleElement = document.createElement("div");
    invisibleElement.style.visibility = "hidden";
    processScore(invisibleElement, editor.state.doc.toString());
    const content = invisibleElement.innerHTML.replace(
      `xmlns:xlink="http://www.w3.org/1999/xlink"`,
      `xmlns="http://www.w3.org/2000/svg"`
    );
    const blob = new Blob([content], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "score.svg";
    downloadLink.click();
    downloadLink.remove();
  });

  updateScore(score, editor.state);
}

init();
