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
  /** 処理後の選択開始位置 */
  selectionStart?: CursorPosition;
  /** 処理後の選択終了位置 */
  selectionEnd?: CursorPosition;
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
 * @param selectionStart 処理後の選択開始位置
 * @param selectionEnd 処理後の選択終了位置
 * @returns インデント処理結果
 */
function createIndentResult(
  newValue: TextValue,
  cursorPosition: CursorPosition,
  selectionStart?: CursorPosition,
  selectionEnd?: CursorPosition
): IndentResult {
  return { newValue, cursorPosition, selectionStart, selectionEnd };
}

/**
 * 選択範囲内の各行の先頭を見つける
 * @param value 全体のテキスト
 * @param start 選択範囲の開始位置
 * @param end 選択範囲の終了位置
 * @returns 各行の開始位置の配列
 */
function findLineStarts(value: TextValue, start: CursorPosition, end: CursorPosition): CursorPosition[] {
  const lineStarts: CursorPosition[] = [];
  let currentPos = 0;
  let inSelection = false;
  
  // 最初の行を含める
  if (start === 0) {
    lineStarts.push(0);
    inSelection = true;
  }
  
  for (let i = 0; i < value.length; i++) {
    if (i === start) {
      // 選択開始位置が行の途中の場合、その行の先頭を見つける
      const lineStart = value.lastIndexOf('\n', i - 1) + 1;
      if (lineStarts.indexOf(lineStart) === -1) {
        lineStarts.push(lineStart);
      }
      inSelection = true;
    }
    
    if (value[i] === '\n' && i < end - 1 && inSelection) {
      // 改行の次の位置（次の行の先頭）
      lineStarts.push(i + 1);
    }
    
    if (i === end) {
      inSelection = false;
      break;
    }
  }
  
  return lineStarts;
}

/**
 * テキストの指定位置にインデントを追加する
 * 複数行が選択されている場合は、選択範囲内の各行にインデントを追加する
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
  const indentString = getIndentString();
  const indentSize = getIndentSize();
  
  // 選択範囲がない場合（カーソルのみ）
  if (selectionStart === selectionEnd) {
    const before = value.substring(0, selectionStart);
    const after = value.substring(selectionStart);
    const newValue = before + indentString + after;
    return createIndentResult(newValue, selectionStart + indentSize);
  }
  
  // 選択範囲内に改行が含まれているかチェック
  const selectedText = value.substring(selectionStart, selectionEnd);
  const hasNewline = selectedText.includes('\n');
  
  // 単一行選択の場合は、従来通りカーソル位置にインデントを挿入
  if (!hasNewline) {
    const before = value.substring(0, selectionStart);
    const after = value.substring(selectionStart);
    const newValue = before + indentString + after;
    return createIndentResult(newValue, selectionStart + indentSize);
  }
  
  // 複数行選択の場合
  const lineStarts = findLineStarts(value, selectionStart, selectionEnd);
  
  // 各行にインデントを追加
  let newValue = value;
  let offset = 0;
  let newSelectionStart = selectionStart;
  let newSelectionEnd = selectionEnd;
  let firstLineAdjusted = false;
  
  for (let i = 0; i < lineStarts.length; i++) {
    const lineStart = lineStarts[i];
    const insertPos = lineStart + offset;
    newValue = newValue.substring(0, insertPos) + indentString + newValue.substring(insertPos);
    offset += indentSize;
    
    // 選択開始位置の調整
    if (i === 0) {
      if (lineStart === 0 && selectionStart === 0) {
        // 最初の行の先頭から選択している場合
        newSelectionStart = 0;
      } else if (lineStart < selectionStart) {
        // 最初の行の途中から選択している場合
        newSelectionStart = selectionStart + indentSize;
      }
    }
    
    // 選択終了位置の調整
    if (lineStart < selectionEnd) {
      newSelectionEnd += indentSize;
    }
  }
  
  // カーソル位置の計算（最初の行のインデント後の位置）
  const firstLineIndentEnd = lineStarts[0] === 0 ? indentSize : selectionStart + indentSize;
  
  return createIndentResult(newValue, firstLineIndentEnd, newSelectionStart, newSelectionEnd);
}

/**
 * 現在の行の先頭からインデントを削除する
 * 複数行が選択されている場合は、選択範囲内の各行からインデントを削除する
 * @param value 処理対象のテキスト
 * @param selectionStart 選択範囲の開始位置
 * @param selectionEnd 選択範囲の終了位置
 * @returns インデント削除後の結果。すべての行にインデントがない場合はundefined
 */
export function removeIndent(
  value: TextValue,
  selectionStart: CursorPosition,
  selectionEnd: CursorPosition
): IndentResult | undefined {
  const indentString = getIndentString();
  const indentSize = getIndentSize();
  
  // 選択範囲がない場合（カーソルのみ）
  if (selectionStart === selectionEnd) {
    const before = value.substring(0, selectionStart);
    const after = value.substring(selectionStart);
    const currentLine = getCurrentLine(before);
    
    if (!currentLine.startsWith(indentString)) {
      return undefined;
    }
    
    const newValue = before.substring(0, selectionStart - indentSize) + after;
    const newCursorPosition = selectionStart - indentSize;
    
    return createIndentResult(newValue, newCursorPosition);
  }
  
  // 選択範囲内に改行が含まれているかチェック
  const selectedText = value.substring(selectionStart, selectionEnd);
  const hasNewline = selectedText.includes('\n');
  
  // 単一行選択の場合は、従来通り選択開始位置を基準にインデントを削除
  if (!hasNewline) {
    const before = value.substring(0, selectionStart);
    const after = value.substring(selectionStart);
    const currentLine = getCurrentLine(before);
    
    if (!currentLine.startsWith(indentString)) {
      return undefined;
    }
    
    const newValue = before.substring(0, selectionStart - indentSize) + after;
    const newCursorPosition = selectionStart - indentSize;
    
    return createIndentResult(newValue, newCursorPosition);
  }
  
  // 複数行選択の場合
  const lineStarts = findLineStarts(value, selectionStart, selectionEnd);
  
  // 各行からインデントを削除できるかチェック
  let hasAnyIndent = false;
  for (const lineStart of lineStarts) {
    const lineEnd = value.indexOf('\n', lineStart);
    const line = lineEnd === -1 ? value.substring(lineStart) : value.substring(lineStart, lineEnd);
    if (line.startsWith(indentString)) {
      hasAnyIndent = true;
    }
  }
  
  // インデントがある行が一つもない場合
  if (!hasAnyIndent) {
    return undefined;
  }
  
  // 各行からインデントを削除
  let newValue = value;
  let offset = 0;
  let newSelectionStart = selectionStart;
  let newSelectionEnd = selectionEnd;
  
  for (let i = 0; i < lineStarts.length; i++) {
    const lineStart = lineStarts[i];
    const checkPos = lineStart + offset;
    if (newValue.substring(checkPos).startsWith(indentString)) {
      newValue = newValue.substring(0, checkPos) + newValue.substring(checkPos + indentSize);
      offset -= indentSize;
      
      // 選択開始位置の調整
      if (i === 0) {
        // 最初の行の場合
        if (lineStart === 0 && selectionStart <= indentSize) {
          // 行頭から選択していて、インデント内にカーソルがある場合
          newSelectionStart = 0;
        } else if (lineStart < selectionStart) {
          // 選択開始位置がインデント削除の影響を受ける場合
          newSelectionStart = Math.max(lineStart, selectionStart - indentSize);
        }
      }
      
      // 選択終了位置の調整
      if (lineStart < selectionEnd) {
        newSelectionEnd -= indentSize;
      }
    }
  }
  
  // カーソル位置は選択開始位置に合わせる
  return createIndentResult(newValue, newSelectionStart, newSelectionStart, newSelectionEnd);
}