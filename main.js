import './src/index.css'
import './src/music.js'
import './src/music.css'
import 'abcjs/abcjs-audio.css';
import { processScore } from './src/music.js'
import { decode_score, encode_score } from './src/url'
import { default_score } from './src/default_score'

var editor = document.getElementById("editor")
var label_url = document.getElementById("url")
var label_warn = document.getElementById("warnings")
var btn_copy = document.getElementById("copy_url")

function onScoreChange() {
    var score = editor.value
    label_url.value = encode_score(score)
    var visualObj = processScore(score)
    if (visualObj[0].warnings == undefined) {
        label_warn.innerHTML = ""
    } else {
        label_warn.innerHTML = visualObj[0].warnings
    }
}

function onBtnCopyClicked() {
    if (window.isSecureContext) {
        navigator.clipboard.writeText(label_url.value);
    } else {
        alert("This page is not viewed in a secure context, so copy is unuseable. Please click the url and press ctrl-C to copy.")
    }
}

editor.addEventListener("input", onScoreChange)
btn_copy.addEventListener("click", onBtnCopyClicked)
label_url.addEventListener("focus", _ => label_url.setSelectionRange(0, label_url.value.length))

function init() {
    const score = decode_score()
    if (score != null) {
        editor.value = score
        onScoreChange()
    } else if (window.location.search != "") {
        alert("Invalid URL, going back to Home")
        window.location.assign(window.location.origin)
    } else {
        editor.value = default_score
        onScoreChange()
    }
}

init()
