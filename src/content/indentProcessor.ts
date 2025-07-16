import { getCurrentSettings } from "./settings";

type TextValue = string;
type CursorPosition = number;

/**
 * インデント処理の結果を表すインターフェース
 */
export interface IndentResult {
  /** 処理後のテキスト値 */
  newValue: TextValue;
  /** 処理後のカーソル位置 */
  cursorPosition: CursorPosition;
}

/**
 * 現在の設定に基づいてインデント文字列を生成する
 * @returns インデント文字列
 */
function getIndentString(): string {
  const settings = getCurrentSettings();
  const char = settings.indentType === 'tab' ? '\t' : ' ';
  return settings.indentType === 'tab' ? char : char.repeat(settings.indentSize);
}

/**
 * 現在の設定に基づいてインデントサイズを取得する
 * @returns インデントサイズ
 */
function getIndentSize(): number {
  const settings = getCurrentSettings();
  return settings.indentType === 'tab' ? 1 : settings.indentSize;
}


/**
 * カーソル位置より前のテキストから現在の行を取得する
 * @param textBeforeCursor カーソル位置より前のテキスト
 * @returns 現在の行のテキスト
 */
function getCurrentLine(textBeforeCursor: TextValue): TextValue {
  const lines = textBeforeCursor.split("\n");
  return lines[lines.length - 1];
}

/**
 * インデント処理結果のオブジェクトを作成する
 * @param newValue 処理後のテキスト値
 * @param cursorPosition 処理後のカーソル位置
 * @returns インデント処理結果
 */
function createIndentResult(
  newValue: TextValue,
  cursorPosition: CursorPosition
): IndentResult {
  return { newValue, cursorPosition };
}

/**
 * テキストの指定位置にインデントを追加する
 * 選択範囲に関わらず、常にカーソル位置（選択開始位置）にインデントを挿入する
 * @param value 処理対象のテキスト
 * @param selectionStart 選択範囲の開始位置
 * @param selectionEnd 選択範囲の終了位置
 * @returns インデント追加後の結果
 */
export function addIndent(
  value: TextValue,
  selectionStart: CursorPosition,
  selectionEnd: CursorPosition
): IndentResult {
  const before = value.substring(0, selectionStart);
  const after = value.substring(selectionStart);
  const indentString = getIndentString();
  const indentSize = getIndentSize();
  const newValue = before + indentString + after;
  
  return createIndentResult(newValue, selectionStart + indentSize);
}

/**
 * 現在の行の先頭からインデントを削除する
 * 選択範囲に関わらず、選択開始位置を基準にインデントを削除する
 * @param value 処理対象のテキスト
 * @param selectionStart 選択範囲の開始位置
 * @param selectionEnd 選択範囲の終了位置
 * @returns インデント削除後の結果。インデントがない場合はundefined
 */
export function removeIndent(
  value: TextValue,
  selectionStart: CursorPosition,
  selectionEnd: CursorPosition
): IndentResult | undefined {
  const before = value.substring(0, selectionStart);
  const after = value.substring(selectionStart);
  const currentLine = getCurrentLine(before);
  const indentString = getIndentString();
  const indentSize = getIndentSize();

  if (!currentLine.startsWith(indentString)) {
    return undefined;
  }

  const newValue = before.substring(0, selectionStart - indentSize) + after;
  const newCursorPosition = selectionStart - indentSize;
  
  return createIndentResult(newValue, newCursorPosition);
}