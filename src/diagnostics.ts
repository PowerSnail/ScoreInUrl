import { Diagnostic } from "@codemirror/lint";
import { EditorState, Text } from "@codemirror/state";

const RE_DIAGNOSTICS = /Music Line:(\d+):(\d+): (.*)/;

interface ErrorMessage {
  lineNumber: number;
  column: number;
  message: string;
  node: HTMLElement;
}

function parseMessage(message: string): ErrorMessage | null {
  const match = message.match(RE_DIAGNOSTICS);
  if (match == null) {
    console.warn("Cannot parse error message: " + message);
    return null;
  }
  const node = document.createElement("div");
  node.innerHTML = match[3];

  return {
    lineNumber: parseInt(match[1]),
    column: parseInt(match[2]),
    message: node.textContent || "",
    node: node,
  };
}

function makeDiagnosticBody(data: ErrorMessage, body: Text): Diagnostic {
  const line = body.line(data.lineNumber);
  return {
    from: line.from + data.column - 1,
    to: line.from + data.column,
    severity: "error",
    message: data.message,
    renderMessage: () => data.node,
  };
}

function notNull<T>(v: T | null): v is T {
  return v != null;
}

export function makeDiagnostics(
  warnings: string[],
  state: EditorState
): Diagnostic[] {
  return warnings
    .map(parseMessage)
    .filter(notNull)
    .map((data) => makeDiagnosticBody(data, state.doc));
}
