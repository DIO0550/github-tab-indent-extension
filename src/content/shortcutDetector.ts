import { getCurrentSettings } from "./settings";

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
 * インデント追加操作かどうかを判定（Tab単体）
 * @param event キーボードイベント
 * @returns 該当する場合true
 */
export function isAddIndentWithTab(event: KeyboardEvent): boolean {
  return isTabKey(event) && 
         !event.shiftKey && 
         !event.ctrlKey && 
         !event.altKey && 
         !event.metaKey;
}

/**
 * インデント削除操作かどうかを判定（Shift+Tab）
 * @param event キーボードイベント
 * @returns 該当する場合true
 */
export function isRemoveIndentWithTab(event: KeyboardEvent): boolean {
  return isTabKey(event) && 
         event.shiftKey && 
         !event.ctrlKey && 
         !event.altKey && 
         !event.metaKey;
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
 * インデント追加操作かどうかを判定（すべてのパターン）
 * @param event キーボードイベント
 * @returns 該当する場合true
 */
export function isAddIndent(event: KeyboardEvent): boolean {
  const settings = getCurrentSettings();
  const tabEnabled = settings.enableTab && isAddIndentWithTab(event);
  const bracketEnabled = settings.enableBracket && isAddIndentShortcut(event);
  return tabEnabled || bracketEnabled;
}

/**
 * インデント削除操作かどうかを判定（すべてのパターン）
 * @param event キーボードイベント
 * @returns 該当する場合true
 */
export function isRemoveIndent(event: KeyboardEvent): boolean {
  const settings = getCurrentSettings();
  const tabEnabled = settings.enableTab && isRemoveIndentWithTab(event);
  const bracketEnabled = settings.enableBracket && isRemoveIndentShortcut(event);
  return tabEnabled || bracketEnabled;
}

/**
 * キーイベントからインデント操作のタイプを判定
 * @param event キーボードイベント
 * @returns インデント操作のタイプ
 */
export function detectIndentAction(event: KeyboardEvent): IndentActionType {
  if (isAddIndent(event)) {
    return IndentActionType.ADD;
  }
  
  if (isRemoveIndent(event)) {
    return IndentActionType.REMOVE;
  }
  
  return IndentActionType.NONE;
}