const re_diagnostics = /Music Line:(\d+):(\d+): (.*)/;

function parseMessage(message) {
  let match = message.match(re_diagnostics);
  if (match == null) {
    return null;
  }
  let node = document.createElement("div");
  node.innerHTML = match[3];

  return {
    lineNumber: parseInt(match[1]),
    column: parseInt(match[2]),
    message: node.textContent,
    node: node,
  };
}

function makeDiagnosticBody(data, body) {
  let line = body.line(data.lineNumber);
  return {
    from: line.from + data.column - 1,
    to: line.from + data.column,
    severity: "error",
    message: data.message,
    renderMessage: () => data.node,
  };
}

export function makeDiagnostics(warnings, state) {
  warnings = warnings || [];
  warnings.forEach((line) => console.log("warning: " + line));
  return warnings
    .map(parseMessage)
    .filter((v) => v)
    .map((v) => makeDiagnosticBody(v, state.doc));
}
