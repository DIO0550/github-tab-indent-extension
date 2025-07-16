import { describe, it, expect, vi, beforeEach } from "vitest";
import { addIndent, removeIndent } from "./indentProcessor";
import { DEFAULT_SETTINGS } from "../options/constants";
import { initializeSettings } from "./settings";

// chrome.storage APIをモック
global.chrome = {
  storage: {
    sync: {
      get: vi.fn()
    },
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn()
    }
  }
} as any;

describe("indentProcessor", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // デフォルト設定でchrome.storageをモック
    chrome.storage.sync.get.mockResolvedValue({ settings: DEFAULT_SETTINGS });
    // settingsServiceを初期化
    await initializeSettings();
  });

  describe("addIndent", () => {
    it("カーソル位置にインデントを追加する", () => {
      const value = "Hello World";
      const result = addIndent(value, 5, 5);
      
      expect(result.newValue).toBe("Hello   World");
      expect(result.cursorPosition).toBe(7);
    });

    it("選択範囲がある場合でも選択開始位置にインデントを追加する", () => {
      const value = "Hello World";
      const result = addIndent(value, 5, 11);
      
      expect(result.newValue).toBe("Hello   World");
      expect(result.cursorPosition).toBe(7);
    });

    it("行頭でインデントを追加する", () => {
      const value = "Hello World";
      const result = addIndent(value, 0, 0);
      
      expect(result.newValue).toBe("  Hello World");
      expect(result.cursorPosition).toBe(2);
    });

    it("複数行のテキストでインデントを追加する", () => {
      const value = "Line 1\nLine 2";
      const result = addIndent(value, 7, 7);
      
      expect(result.newValue).toBe("Line 1\n  Line 2");
      expect(result.cursorPosition).toBe(9);
    });

    it("選択範囲が複数文字の場合でも選択開始位置にインデントを追加する", () => {
      const value = "function test() {}";
      const result = addIndent(value, 9, 13);
      
      expect(result.newValue).toBe("function   test() {}");
      expect(result.cursorPosition).toBe(11);
    });

    it("選択範囲が行全体の場合でも選択開始位置にインデントを追加する", () => {
      const value = "Line 1\nLine 2\nLine 3";
      const result = addIndent(value, 7, 13);
      
      expect(result.newValue).toBe("Line 1\n  Line 2\nLine 3");
      expect(result.cursorPosition).toBe(9);
    });
  });

  describe("removeIndent", () => {
    it("行頭のインデントを削除する", () => {
      const value = "  Hello World";
      const result = removeIndent(value, 2, 2);
      
      expect(result).toBeDefined();
      expect(result!.newValue).toBe("Hello World");
      expect(result!.cursorPosition).toBe(0);
    });

    it("インデントがない場合はundefinedを返す", () => {
      const value = "Hello World";
      const result = removeIndent(value, 5, 5);
      
      expect(result).toBeUndefined();
    });

    it("行の途中でインデントがある場合は削除する", () => {
      const value = "Line 1\n  Line 2";
      const result = removeIndent(value, 9, 9);
      
      expect(result).toBeDefined();
      expect(result!.newValue).toBe("Line 1\nLine 2");
      expect(result!.cursorPosition).toBe(7);
    });

    it("部分的なインデントの場合はundefinedを返す", () => {
      const value = " Hello World";
      const result = removeIndent(value, 1, 1);
      
      expect(result).toBeUndefined();
    });

    it("選択範囲がある場合でも選択開始位置を基準にインデントを削除する", () => {
      const value = "  Hello World";
      const result = removeIndent(value, 2, 7);
      
      expect(result).toBeDefined();
      expect(result!.newValue).toBe("Hello World");
      expect(result!.cursorPosition).toBe(0);
    });
  });

  describe("設定に基づく動作", () => {
    it("タブ文字を使用する設定の場合、タブ文字でインデントする", async () => {
      chrome.storage.sync.get.mockResolvedValue({
        settings: {
          ...DEFAULT_SETTINGS,
          indentType: 'tab',
        }
      });
      
      await initializeSettings();

      const value = "Hello World";
      const result = addIndent(value, 5, 5);
      
      expect(result.newValue).toBe("Hello\t World");
      expect(result.cursorPosition).toBe(6);
    });

    it("インデントサイズが4の場合、4スペースでインデントする", async () => {
      chrome.storage.sync.get.mockResolvedValue({
        settings: {
          ...DEFAULT_SETTINGS,
          indentSize: 4,
        }
      });
      
      await initializeSettings();

      const value = "Hello World";
      const result = addIndent(value, 5, 5);
      
      expect(result.newValue).toBe("Hello     World");
      expect(result.cursorPosition).toBe(9);
    });

    it("タブ文字設定の場合、タブ文字を削除する", async () => {
      chrome.storage.sync.get.mockResolvedValue({
        settings: {
          ...DEFAULT_SETTINGS,
          indentType: 'tab',
        }
      });
      
      await initializeSettings();

      const value = "\tHello World";
      const result = removeIndent(value, 1, 1);
      
      expect(result).toBeDefined();
      expect(result!.newValue).toBe("Hello World");
      expect(result!.cursorPosition).toBe(0);
    });
  });
});