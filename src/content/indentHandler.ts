import { IndentResult, addIndent, removeIndent } from "./indentProcessor";
import { detectIndentAction, IndentActionType } from "./shortcutDetector";

export type IndentHandler = (
  value: string,
  selectionStart: number,
  selectionEnd: number
) => IndentResult | undefined;

/**
 * KeyboardEventからインデントハンドラーを作成
 * @param event キーボードイベント
 * @returns インデントハンドラー関数
 */
export function createIndentHandler(event: KeyboardEvent): IndentHandler | null {
  const actionType = detectIndentAction(event);
  
  switch (actionType) {
    case IndentActionType.ADD:
      return addIndent;
    case IndentActionType.REMOVE:
      return removeIndent;
    case IndentActionType.NONE:
      return null;
  }
}

/**
 * IndentActionTypeからインデントハンドラーを作成
 * @param actionType インデント操作のタイプ
 * @returns インデントハンドラー関数
 */
export function createIndentHandlerFromType(actionType: IndentActionType): IndentHandler | null {
  switch (actionType) {
    case IndentActionType.ADD:
      return addIndent;
    case IndentActionType.REMOVE:
      return removeIndent;
    case IndentActionType.NONE:
      return null;
  }
}