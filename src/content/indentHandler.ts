import { IndentResult, addIndent, removeIndent } from "./indentProcessor";

export type IndentHandler = (
  value: string,
  selectionStart: number,
  selectionEnd: number
) => IndentResult | undefined;

export function createIndentHandler(event: KeyboardEvent): IndentHandler {
  return event.shiftKey ? removeIndent : addIndent;
}