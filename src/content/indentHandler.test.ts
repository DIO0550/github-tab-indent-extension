import { describe, it, expect } from "vitest";
import { createIndentHandler, createIndentHandlerFromType } from "./indentHandler";
import { addIndent, removeIndent } from "./indentProcessor";
import { IndentActionType } from "./shortcutDetector";

describe("indentHandler", () => {
  describe("createIndentHandler", () => {
    it("Tab単体でaddIndentハンドラーを返す", () => {
      const event = new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: false,
      });
      
      const handler = createIndentHandler(event);
      expect(handler).toBe(addIndent);
      
      const result = handler?.("Hello World", 5, 5);
      expect(result).toBeDefined();
      expect(result!.newValue).toBe("Hello   World");
      expect(result!.cursorPosition).toBe(7);
    });

    it("Shift+TabでremoveIndentハンドラーを返す", () => {
      const event = new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
      });
      
      const handler = createIndentHandler(event);
      expect(handler).toBe(removeIndent);
      
      const result = handler?.("  Hello World", 2, 2);
      expect(result).toBeDefined();
      expect(result!.newValue).toBe("Hello World");
      expect(result!.cursorPosition).toBe(0);
    });

    it("Cmd/Ctrl + ]でaddIndentハンドラーを返す", () => {
      const event = new KeyboardEvent("keydown", {
        key: "]",
        metaKey: true,
      });
      
      const handler = createIndentHandler(event);
      expect(handler).toBe(addIndent);
    });

    it("Cmd/Ctrl + [でremoveIndentハンドラーを返す", () => {
      const event = new KeyboardEvent("keydown", {
        key: "[",
        ctrlKey: true,
      });
      
      const handler = createIndentHandler(event);
      expect(handler).toBe(removeIndent);
    });

    it("対象外のキーではnullを返す", () => {
      const event = new KeyboardEvent("keydown", {
        key: "Enter",
      });
      
      const handler = createIndentHandler(event);
      expect(handler).toBeNull();
    });

    it("インデント削除ハンドラーでインデントがない場合はundefinedを返す", () => {
      const event = new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
      });
      
      const handler = createIndentHandler(event);
      const result = handler?.("Hello World", 5, 5);
      
      expect(result).toBeUndefined();
    });
  });

  describe("createIndentHandlerFromType", () => {
    it("ADDタイプでaddIndentハンドラーを返す", () => {
      const handler = createIndentHandlerFromType(IndentActionType.ADD);
      expect(handler).toBe(addIndent);
    });

    it("REMOVEタイプでremoveIndentハンドラーを返す", () => {
      const handler = createIndentHandlerFromType(IndentActionType.REMOVE);
      expect(handler).toBe(removeIndent);
    });

    it("NONEタイプでnullを返す", () => {
      const handler = createIndentHandlerFromType(IndentActionType.NONE);
      expect(handler).toBeNull();
    });
  });
});