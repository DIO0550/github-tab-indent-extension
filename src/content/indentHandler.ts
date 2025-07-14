import { IndentResult, addIndent, removeIndent } from "./indentProcessor";
import { IndentActionType } from "./shortcutDetector";

export type IndentHandler = (
  value: string,
  selectionStart: number,
  selectionEnd: number
) => IndentResult | undefined;

/**
 * IndentActionTypeに対応するインデントハンドラーを取得する
 * @param actionType インデント操作のタイプ
 * @returns インデントハンドラー関数
 */
export function getIndentHandler(actionType: IndentActionType): IndentHandler | null {
  switch (actionType) {
    case IndentActionType.ADD:
      return addIndent;
    case IndentActionType.REMOVE:
      return removeIndent;
    case IndentActionType.NONE:
      return null;
  }
}