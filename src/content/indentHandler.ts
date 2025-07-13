import { IndentResult, addIndent, removeIndent } from "./indentProcessor";
import { IndentActionType } from "./shortcutDetector";

export type IndentHandler = (
  value: string,
  selectionStart: number,
  selectionEnd: number
) => IndentResult | undefined;

/**
 * IndentActionTypeに対応するインデントハンドラーを返す
 * @param actionType インデント操作のタイプ
 * @returns インデントハンドラー関数
 */
export function indentHandlerFor(actionType: IndentActionType): IndentHandler | null {
  switch (actionType) {
    case IndentActionType.ADD:
      return addIndent;
    case IndentActionType.REMOVE:
      return removeIndent;
    case IndentActionType.NONE:
      return null;
  }
}