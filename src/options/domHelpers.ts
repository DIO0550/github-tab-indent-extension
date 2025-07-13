import { Settings, DOM_IDS, STATUS_MESSAGE_TIMEOUT } from './constants';

/**
 * 指定されたIDのHTML要素を取得する
 * @param id - 要素のID
 * @returns 要素が存在する場合はその要素、存在しない場合はnull
 */
function getElement<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

/**
 * 指定されたIDのinput要素から数値を取得する
 * @param id - input要素のID
 * @returns パースされた数値。要素が存在しない場合は0
 */
function getNumberValue(id: string): number {
  const element = getElement<HTMLInputElement>(id);
  return element ? parseInt(element.value, 10) : 0;
}

/**
 * 指定されたIDのselect要素から選択値を取得する
 * @param id - select要素のID
 * @returns 選択されている値。要素が存在しない場合は空文字列
 */
function getSelectValue(id: string): string {
  const element = getElement<HTMLSelectElement>(id);
  return element?.value || '';
}

/**
 * 指定されたIDのcheckbox要素からチェック状態を取得する
 * @param id - checkbox要素のID
 * @returns チェックされている場合はtrue、それ以外はfalse
 */
function getCheckboxValue(id: string): boolean {
  const element = getElement<HTMLInputElement>(id);
  return element?.checked || false;
}

/**
 * 指定されたIDのinput要素に値を設定する
 * @param id - input要素のID
 * @param value - 設定する値
 */
function setInputValue(id: string, value: string): void {
  const element = getElement<HTMLInputElement>(id);
  if (element) {
    element.value = value;
  }
}

/**
 * 指定されたIDのselect要素に値を設定する
 * @param id - select要素のID
 * @param value - 設定する値
 */
function setSelectValue(id: string, value: string): void {
  const element = getElement<HTMLSelectElement>(id);
  if (element) {
    element.value = value;
  }
}

/**
 * 指定されたIDのcheckbox要素にチェック状態を設定する
 * @param id - checkbox要素のID
 * @param checked - チェック状態
 */
function setCheckboxValue(id: string, checked: boolean): void {
  const element = getElement<HTMLInputElement>(id);
  if (element) {
    element.checked = checked;
  }
}

/**
 * フォームから全ての設定値を取得する
 * @returns 現在のフォーム上の設定値
 */
export function getFormValues(): Settings {
  return {
    indentSize: getNumberValue(DOM_IDS.INDENT_SIZE),
    indentType: getSelectValue(DOM_IDS.INDENT_TYPE) as 'space' | 'tab',
    enableTab: getCheckboxValue(DOM_IDS.ENABLE_TAB),
    enableBracket: getCheckboxValue(DOM_IDS.ENABLE_BRACKET),
    applyToComments: getCheckboxValue(DOM_IDS.APPLY_TO_COMMENTS),
    applyToCodeEditor: getCheckboxValue(DOM_IDS.APPLY_TO_CODE_EDITOR),
    applyToMarkdown: getCheckboxValue(DOM_IDS.APPLY_TO_MARKDOWN),
  };
}

/**
 * フォームに設定値を反映する
 * @param settings - フォームに設定する値
 */
export function setFormValues(settings: Settings): void {
  setInputValue(DOM_IDS.INDENT_SIZE, settings.indentSize.toString());
  setSelectValue(DOM_IDS.INDENT_TYPE, settings.indentType);
  setCheckboxValue(DOM_IDS.ENABLE_TAB, settings.enableTab);
  setCheckboxValue(DOM_IDS.ENABLE_BRACKET, settings.enableBracket);
  setCheckboxValue(DOM_IDS.APPLY_TO_COMMENTS, settings.applyToComments);
  setCheckboxValue(DOM_IDS.APPLY_TO_CODE_EDITOR, settings.applyToCodeEditor);
  setCheckboxValue(DOM_IDS.APPLY_TO_MARKDOWN, settings.applyToMarkdown);
}

// ステータスメッセージ管理
let statusTimeoutId: NodeJS.Timeout | null = null;

/**
 * ステータスメッセージを表示する
 * メッセージは3秒後に自動的に非表示になる
 * @param message - 表示するメッセージ
 * @param type - メッセージのタイプ（'success' または 'error'）
 */
export function showStatusMessage(message: string, type: 'success' | 'error'): void {
  const statusElement = getElement<HTMLElement>(DOM_IDS.STATUS_MESSAGE);
  if (!statusElement) {
    return;
  }

  // 既存のタイムアウトをクリア
  if (statusTimeoutId) {
    clearTimeout(statusTimeoutId);
    statusTimeoutId = null;
  }

  statusElement.textContent = message;
  statusElement.className = `status-message ${type}`;
  statusElement.hidden = false;

  statusTimeoutId = setTimeout(() => {
    statusElement.hidden = true;
    statusTimeoutId = null;
  }, STATUS_MESSAGE_TIMEOUT);
}

/**
 * 保存・リセットボタンにイベントリスナーを設定する
 * @param handlers - イベントハンドラーオブジェクト
 * @param handlers.onSave - 保存ボタンクリック時の処理
 * @param handlers.onReset - リセットボタンクリック時の処理
 */
export function attachEventListeners(handlers: {
  onSave: () => void;
  onReset: () => void;
}): void {
  const saveButton = getElement<HTMLElement>(DOM_IDS.SAVE_BUTTON);
  const resetButton = getElement<HTMLElement>(DOM_IDS.RESET_BUTTON);

  saveButton?.addEventListener('click', handlers.onSave);
  resetButton?.addEventListener('click', handlers.onReset);
}