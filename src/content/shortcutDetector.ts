/**
 * インデント操作のタイプ
 */
export enum IndentActionType {
  /** インデント追加 */
  ADD = 'ADD',
  /** インデント削除 */
  REMOVE = 'REMOVE',
  /** 対象外のキー */
  NONE = 'NONE'
}

/**
 * Tabキーかどうかを判定
 * @param event キーボードイベント
 * @returns Tabキーの場合true
 */
export function isTabKey(event: KeyboardEvent): boolean {
  return event.key === 'Tab';
}

/**
 * インデント追加のショートカット（Cmd/Ctrl + ]）かどうかを判定
 * @param event キーボードイベント
 * @returns 該当する場合true
 */
export function isAddIndentShortcut(event: KeyboardEvent): boolean {
  return event.key === ']' && 
         (event.metaKey || event.ctrlKey) && 
         !event.shiftKey && 
         !event.altKey;
}

/**
 * インデント削除のショートカット（Cmd/Ctrl + [）かどうかを判定
 * @param event キーボードイベント
 * @returns 該当する場合true
 */
export function isRemoveIndentShortcut(event: KeyboardEvent): boolean {
  return event.key === '[' && 
         (event.metaKey || event.ctrlKey) && 
         !event.shiftKey && 
         !event.altKey;
}

/**
 * キーイベントからインデント操作のタイプを判定
 * @param event キーボードイベント
 * @returns インデント操作のタイプ
 */
export function detectIndentAction(event: KeyboardEvent): IndentActionType {
  // Tabキーの場合
  if (isTabKey(event)) {
    return event.shiftKey ? IndentActionType.REMOVE : IndentActionType.ADD;
  }
  
  // Cmd/Ctrl + ] の場合
  if (isAddIndentShortcut(event)) {
    return IndentActionType.ADD;
  }
  
  // Cmd/Ctrl + [ の場合
  if (isRemoveIndentShortcut(event)) {
    return IndentActionType.REMOVE;
  }
  
  return IndentActionType.NONE;
}