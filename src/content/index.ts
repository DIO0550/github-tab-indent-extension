import { EVENT_TYPES } from "./constants";
import { getTextAreaElement } from "./textareaDetector";
import { detectIndentAction, IndentActionType } from "./shortcutDetector";
import { indentHandlerFor } from "./indentHandler";

function handleKeyDown(event: KeyboardEvent): void {
  const target = getTextAreaElement(event);
  if (!target) {
    return;
  }

  // キーイベントからインデント操作のタイプを判定
  const actionType = detectIndentAction(event);
  if (actionType === IndentActionType.NONE) {
    return;
  }

  event.preventDefault();

  const start = target.selectionStart;
  const end = target.selectionEnd;
  const value = target.value;

  if (start === null || end === null) {
    return;
  }

  // インデント操作タイプから適切なハンドラーを取得
  const indentHandler = indentHandlerFor(actionType);
  if (!indentHandler) {
    return;
  }

  // インデント操作を実行
  const result = indentHandler(value, start, end);
  if (!result) {
    return;
  }
  
  // テキストエリアを更新
  target.value = result.newValue;
  target.selectionStart = target.selectionEnd = result.cursorPosition;
  target.dispatchEvent(new Event(EVENT_TYPES.INPUT, { bubbles: true }));
}

document.addEventListener(EVENT_TYPES.KEYDOWN, handleKeyDown, true);
