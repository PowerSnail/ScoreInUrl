import './src/index.css'
import './src/music.js'
import './src/music.css'
import { processScore } from './src/music.js'
import { decode_score, encode_score } from './src/url'
import { default_score } from './src/default_score'

var editor = document.getElementById("editor")
var label_url = document.getElementById("url")
var btn_copy = document.getElementById("copy_url")

function onScoreChange() {
    var score = editor.value
    label_url.value = encode_score(score)
    processScore(score)
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
    editor.value = decode_score() || default_score
    onScoreChange()
}

init()
