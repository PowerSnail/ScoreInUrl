import abcjs from "abcjs"

var options = {
  responsive: "resize",
};

var editor = document.getElementById("editor")

function onScoreChange() {
  var visualObj = abcjs.renderAbc("score", editor.value, options)
  setupAudio(visualObj)
}

editor.addEventListener("input", onScoreChange)

function setupAudio(visualObj) {
  if (abcjs.synth.supportsAudio()) {
    var controlOptions = {
      displayRestart: true,
      displayPlay: true,
      displayProgress: true,
      displayClock: true
    };
    var synthControl = new abcjs.synth.SynthController();
    synthControl.load("#audio", cursorControl, controlOptions);
    synthControl.disable(true);
    var midiBuffer = new abcjs.synth.CreateSynth();
    midiBuffer.init({
      visualObj: visualObj[0],
      options: {

      }
    }).then(function () {
      synthControl.setTune(visualObj[0], true).then(function (response) {
        document.querySelector(".abcjs-inline-audio").classList.remove("disabled");
      })
    });
  } else {
    console.log("audio is not supported on this browser");
  };
}


function CursorControl(rootSelector) {
  var self = this;

  // This demonstrates two methods of indicating where the music is.
  // 1) An element is created that is moved along for each note.
  // 2) The currently being played note is given a class so that it can be transformed.
  self.cursor = null; // This is the svg element that will move with the music.
  self.rootSelector = rootSelector; // This is the same selector as the renderAbc call uses.

  self.onStart = function () {
    // This is called when the timer starts so we know the svg has been drawn by now.
    // Create the cursor and add it to the sheet music's svg.
    var svg = document.querySelector(self.rootSelector + " svg");
    self.cursor = document.createElementNS("http://www.w3.org/2000/svg", "line");
    self.cursor.setAttribute("class", "abcjs-cursor");
    self.cursor.setAttributeNS(null, 'x1', 0);
    self.cursor.setAttributeNS(null, 'y1', 0);
    self.cursor.setAttributeNS(null, 'x2', 0);
    self.cursor.setAttributeNS(null, 'y2', 0);
    svg.appendChild(self.cursor);
  };

  self.removeSelection = function () {
    // Unselect any previously selected notes.
    var lastSelection = document.querySelectorAll(self.rootSelector + " .abcjs-highlight");
    for (var k = 0; k < lastSelection.length; k++)
      lastSelection[k].classList.remove("abcjs-highlight");
  };


  self.onEvent = function (ev) {

    // This is called every time a note or a rest is reached and contains the coordinates of it.
    if (ev.measureStart && ev.left === null)
      return; // this was the second part of a tie across a measure line. Just ignore it.

    self.removeSelection();

    // Select the currently selected notes.
    for (var i = 0; i < ev.elements.length; i++) {
      var note = ev.elements[i];
      for (var j = 0; j < note.length; j++) {
        note[j].classList.add("abcjs-highlight");
      }
    }

    // Move the cursor to the location of the current note.
    if (self.cursor) {
      self.cursor.setAttribute("x1", ev.left - 2);
      self.cursor.setAttribute("x2", ev.left - 2);
      self.cursor.setAttribute("y1", ev.top);
      self.cursor.setAttribute("y2", ev.top + ev.height);
    }



  };
  self.onFinished = function () {
    self.removeSelection();

    if (self.cursor) {
      self.cursor.setAttribute("x1", 0);
      self.cursor.setAttribute("x2", 0);
      self.cursor.setAttribute("y1", 0);
      self.cursor.setAttribute("y2", 0);
    }


  };
}

var cursorControl = new CursorControl("#score");

// document.querySelector(".start").addEventListener("click", startTimer);

function onEvent(ev) {
  if (ev)
    cursorControl.onEvent(ev);
  else
    cursorControl.onFinished();
}

function startTimer() {
  cursorControl.onStart();

  var timingCallbacks = new abcjs.TimingCallbacks(visualObj[0], {
    eventCallback: onEvent
  });
  timingCallbacks.start();
}


var default_score = `X: 1
T: Cooley's
M: 4/4
L: 1/8
K: Emin
|:D2|EB{c}BA B2 EB|~B2 AB dBAG|FDAD BDAD|FDAD dAFD|
EBBA B2 EB|B2 AB defg|afe^c dBAF|DEFD E2:|
|:gf|eB B2 efge|eB B2 gedB|A2 FA DAFA|A2 FA defg|
eB B2 eBgB|eB B2 defg|afe^c dBAF|DEFD E2:|
|:D2|EB{c}BA B2 EB|~B2 AB dBAG|FDAD BDAD|FDAD dAFD|
EBBA B2 EB|B2 AB defg|afe^c dBAF|DEFD E2:|
|:gf|eB B2 efge|eB B2 gedB|A2 FA DAFA|A2 FA defg|
eB B2 eBgB|eB B2 defg|afe^c dBAF|DEFD E2:|
|:D2|EB{c}BA B2 EB|~B2 AB dBAG|FDAD BDAD|FDAD dAFD|
EBBA B2 EB|B2 AB defg|afe^c dBAF|DEFD E2:|
|:gf|eB B2 efge|eB B2 gedB|A2 FA DAFA|A2 FA defg|
eB B2 eBgB|eB B2 defg|afe^c dBAF|DEFD E2:|`

var editor = document.getElementById("editor")
editor.value = default_score
onScoreChange()