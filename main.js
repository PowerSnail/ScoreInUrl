import './src/index.css'
import './src/music.js'
import './src/music.css'
import 'abcjs/abcjs-audio.css';
import { loadAudioController, processScore, setAudio } from './src/music.js'
import { decode_score, encode_score } from './src/url'
import { default_score } from './src/default_score'
import { basicSetup } from 'codemirror';
import { EditorView } from "@codemirror/view"
import { AbcLanguageSupport } from './src/abc_language';
import { lintGutter, setDiagnostics } from '@codemirror/lint';
import { makeDiagnostics } from './src/diagnostics';


var label_url = document.getElementById("url")
var btn_copy = document.getElementById("copyUrl")

btn_copy.addEventListener("click", _ => {
    if (window.isSecureContext) {
        navigator.clipboard.writeText(label_url.value);
    } else {
        alert("This page is not viewed in a secure context, so copy is unuseable. Please click the url and press ctrl-C to copy.")
    }
})
label_url.addEventListener("focus", _ => label_url.setSelectionRange(0, label_url.value.length))

let score = decode_score()
if (score == null && window.location.search != "") {
    alert("Invalid URL, going back to Home")
    window.location.assign(window.location.origin)
}
score = score || default_score

let renderTask = null;
let synthControl = loadAudioController("#audio", "#score")
if (synthControl == null) {
    console.error("No audio context")
}

let editor = new EditorView({
    extensions: [
        basicSetup,
        AbcLanguageSupport,
        lintGutter(),
        EditorView.lineWrapping,
        EditorView.updateListener.of(function (e) {
            if (renderTask != null) {
                clearTimeout(renderTask)
            }
            renderTask = setTimeout(() => {
                let score = e.state.doc.toString()
                let encoded = encode_score(score)
                if (encoded != label_url.value) {
                    label_url.value = encoded
                    let visualObj = processScore(score)
                    if (synthControl) {
                        setAudio(synthControl, visualObj)
                    }
                    let diagnostics = makeDiagnostics(visualObj[0].warnings, e.state)
                    editor.dispatch(setDiagnostics(e.state, diagnostics))
                }
            }, 300)
        }),
    ],
    parent: document.getElementById("editorWrapper")
})
label_url.value = ""
editor.dispatch(editor.state.update({ changes: { from: 0, to: 0, insert: score } }))
document.body.classList.remove("invisible")