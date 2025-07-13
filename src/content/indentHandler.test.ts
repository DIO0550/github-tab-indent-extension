import { describe, it, expect } from "vitest";
import { indentHandlerFor } from "./indentHandler";
import { addIndent, removeIndent } from "./indentProcessor";
import { IndentActionType } from "./shortcutDetector";

describe("indentHandler", () => {
  describe("indentHandlerFor", () => {
    it("ADDタイプでaddIndentハンドラーを返す", () => {
      const handler = indentHandlerFor(IndentActionType.ADD);
      expect(handler).toBe(addIndent);
    });

    it("REMOVEタイプでremoveIndentハンドラーを返す", () => {
      const handler = indentHandlerFor(IndentActionType.REMOVE);
      expect(handler).toBe(removeIndent);
    });

    it("NONEタイプでnullを返す", () => {
      const handler = indentHandlerFor(IndentActionType.NONE);
      expect(handler).toBeNull();
    });

    it("ADDハンドラーが正しく動作する", () => {
      const handler = indentHandlerFor(IndentActionType.ADD);
      const result = handler?.("Hello World", 5, 5);
      
      expect(result).toBeDefined();
      expect(result!.newValue).toBe("Hello   World");
      expect(result!.cursorPosition).toBe(7);
    });

    it("REMOVEハンドラーが正しく動作する", () => {
      const handler = indentHandlerFor(IndentActionType.REMOVE);
      const result = handler?.("  Hello World", 2, 2);
      
      expect(result).toBeDefined();
      expect(result!.newValue).toBe("Hello World");
      expect(result!.cursorPosition).toBe(0);
    });

    it("REMOVEハンドラーでインデントがない場合はundefinedを返す", () => {
      const handler = indentHandlerFor(IndentActionType.REMOVE);
      const result = handler?.("Hello World", 5, 5);
      
      expect(result).toBeUndefined();
    });
  });
});