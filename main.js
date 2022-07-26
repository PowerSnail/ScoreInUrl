import './src/index.css'
import './src/music.js'
import './src/music.css'
import 'abcjs/abcjs-audio.css';
import { processScore } from './src/music.js'
import { decode_score, encode_score } from './src/url'
import { default_score } from './src/default_score'
import { basicSetup } from 'codemirror';
import { EditorView } from "@codemirror/view"

var label_url = document.getElementById("url")
var label_warn = document.getElementById("warnings")
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

let editor = new EditorView({
    extensions: [
        basicSetup,
        EditorView.updateListener.of(function (e) {
            let score = e.state.doc.toString()
            let visualObj = processScore(score)
            label_warn.innerHTML = visualObj[0].warnings || ""
            label_url.value = encode_score(score)
        }),
    ],
    parent: document.getElementById("editorWrapper")
})
editor.dispatch(editor.state.update({ changes: { from: 0, to: 0, insert: score } }))
document.body.classList.remove("invisible")