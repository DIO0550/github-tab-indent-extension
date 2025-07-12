import { describe, it, expect } from "vitest";
import { createIndentHandler } from "./indentHandler";

describe("indentHandler", () => {
  describe("createIndentHandler", () => {
    it("shiftKeyがfalseの場合、インデント追加ハンドラーを返す", () => {
      const event = new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: false,
      });
      
      const handler = createIndentHandler(event);
      const result = handler("Hello World", 5, 5);
      
      expect(result).toBeDefined();
      expect(result!.newValue).toBe("Hello   World");
      expect(result!.cursorPosition).toBe(7);
    });

    it("shiftKeyがtrueの場合、インデント削除ハンドラーを返す", () => {
      const event = new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
      });
      
      const handler = createIndentHandler(event);
      const result = handler("  Hello World", 2, 2);
      
      expect(result).toBeDefined();
      expect(result!.newValue).toBe("Hello World");
      expect(result!.cursorPosition).toBe(0);
    });

    it("インデント削除ハンドラーでインデントがない場合はundefinedを返す", () => {
      const event = new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
      });
      
      const handler = createIndentHandler(event);
      const result = handler("Hello World", 5, 5);
      
      expect(result).toBeUndefined();
    });
  });
});