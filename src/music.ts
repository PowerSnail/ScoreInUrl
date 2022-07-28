import abcjs from "abcjs";

const options: abcjs.AbcVisualParams = {
  responsive: "resize",
};

const controlOptions = {
  displayRestart: true,
  displayPlay: true,
  displayProgress: true,
  displayClock: true,
};

export function processScore(content: string) {
  return abcjs.renderAbc("score", content, options);
}

export function loadAudioController(audioElement: string, visualElement: string) {
  if (abcjs.synth.supportsAudio()) {
    const synthControl = new abcjs.synth.SynthController();
    synthControl.load(
      audioElement,
      new CursorControl(visualElement),
      controlOptions
    );
    synthControl.disable(true);
    return synthControl;
  } else {
    return null;
  }
}

export function setAudio(synthControl: abcjs.SynthObjectController, visualObj: abcjs.TuneObjectArray) {
  synthControl
    .setTune(visualObj[0], true)
    .then(() =>
      document.querySelector(".abcjs-inline-audio")?.classList.remove("disabled")
    );
}

class CursorControl {
  cursor: SVGLineElement | null
  rootSelector: string

  constructor(rootSelector: string) {
    this.cursor = null;
    this.rootSelector = rootSelector;
  }

  onStart() {
    // This is called when the timer starts so we know the svg has been drawn by now.
    // Create the cursor and add it to the sheet music's svg.
    const svg = document.querySelector(this.rootSelector + " svg");
    this.cursor = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    this.cursor.setAttribute("class", "abcjs-cursor");
    this.cursor.setAttributeNS(null, "x1", "0");
    this.cursor.setAttributeNS(null, "y1", "0");
    this.cursor.setAttributeNS(null, "x2", "0");
    this.cursor.setAttributeNS(null, "y2", "0");
    svg?.appendChild(this.cursor);
  }

  removeSelection() {
    // Unselect any previously selected notes.
    const lastSelection = document.querySelectorAll(
      this.rootSelector + " .abcjs-highlight"
    );
    for (let k = 0; k < lastSelection.length; k++)
      lastSelection[k].classList.remove("abcjs-highlight");
  }

  onEvent(ev) {
    // This is called every time a note or a rest is reached and contains the coordinates of it.
    if (ev.measureStart && ev.left === null) return; // this was the second part of a tie across a measure line. Just ignore it.

    this.removeSelection();

    // Select the currently selected notes.
    for (let i = 0; i < ev.elements.length; i++) {
      const note = ev.elements[i];
      for (let j = 0; j < note.length; j++) {
        note[j].classList.add("abcjs-highlight");
      }
    }

    // Move the cursor to the location of the current note.
    if (this.cursor) {
      this.cursor.setAttribute("x1", (ev.left - 2).toString());
      this.cursor.setAttribute("x2", (ev.left - 2).toString());
      this.cursor.setAttribute("y1", ev.top);
      this.cursor.setAttribute("y2", ev.top + ev.height);
    }
  }

  onFinished() {
    this.removeSelection();

    if (this.cursor) {
      this.cursor.setAttribute("x1", "0");
      this.cursor.setAttribute("x2", "0");
      this.cursor.setAttribute("y1", "0");
      this.cursor.setAttribute("y2", "0");
    }
  }
}
