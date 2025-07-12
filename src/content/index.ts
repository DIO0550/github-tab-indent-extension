import { KEY_CODES, EVENT_TYPES } from "./constants";
import { getTextAreaElement } from "./textareaDetector";
import { createIndentHandler } from "./indentHandler";

function handleTabKey(event: KeyboardEvent): void {
  if (event.key !== KEY_CODES.TAB) {
    return;
  }

  const target = getTextAreaElement(event);

  if (!target) {
    return;
  }

  event.preventDefault();

  const start = target.selectionStart;
  const end = target.selectionEnd;
  const value = target.value;

  if (start === null || end === null) {
    return;
  }

  const handler = createIndentHandler(event);
  const result = handler(value, start, end);
  
  if (result) {
    target.value = result.newValue;
    target.selectionStart = target.selectionEnd = result.cursorPosition;
  }

  target.dispatchEvent(new Event(EVENT_TYPES.INPUT, { bubbles: true }));
}

document.addEventListener(EVENT_TYPES.KEYDOWN, handleTabKey, true);

console.log("GitHub Tab Indent Extension loaded");
