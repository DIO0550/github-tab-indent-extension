import { EVENT_TYPES } from "./constants";
import { getTextAreaElement } from "./textareaDetector";
import { detectIndentAction, IndentActionType } from "./shortcutDetector";
import { getIndentHandler } from "./indentHandler";
import { IndentResult } from "./indentProcessor";
import { EditableElement } from "./textareaDetector";
import { initializeSettings, getCurrentSettings } from "./settings";
import { detectTextAreaContext, isEnabledInContext } from "./contextDetector";

/**
 * テキストエリアの内容とカーソル位置を更新する
 * @param target 更新対象の要素
 * @param result インデント処理の結果
 */
function updateTextArea(target: EditableElement, result: IndentResult): void {
  target.value = result.newValue;
  
  // 選択範囲の情報がある場合は選択範囲を維持
  if (result.selectionStart !== undefined && result.selectionEnd !== undefined) {
    target.selectionStart = result.selectionStart;
    target.selectionEnd = result.selectionEnd;
  } else {
    // 選択範囲の情報がない場合は、カーソル位置のみ設定
    target.selectionStart = target.selectionEnd = result.cursorPosition;
  }
  
  target.dispatchEvent(new Event(EVENT_TYPES.INPUT, { bubbles: true }));
}

function handleKeyDown(event: KeyboardEvent): void {
  const target = getTextAreaElement(event);
  if (!target) {
    return;
  }

  // コンテキストを検出して、機能が有効かチェック
  const context = detectTextAreaContext(target);
  const settings = getCurrentSettings();
  if (!isEnabledInContext(context, settings)) {
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
  const indentHandler = getIndentHandler(actionType);
  if (!indentHandler) {
    return;
  }

  // インデント操作を実行
  const result = indentHandler(value, start, end);
  if (!result) {
    return;
  }
  
  // テキストエリアを更新
  updateTextArea(target, result);
}

// 設定を初期化してからイベントリスナーを登録
async function initialize(): Promise<void> {
  await initializeSettings();
  document.addEventListener(EVENT_TYPES.KEYDOWN, handleKeyDown, true);
}

// 初期化を実行
initialize();
