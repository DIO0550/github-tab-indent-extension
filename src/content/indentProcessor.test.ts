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

    it("複数行を選択してインデントを追加する", () => {
      const value = "Line 1\nLine 2\nLine 3";
      const result = addIndent(value, 0, 20); // 全体を選択
      
      expect(result.newValue).toBe("  Line 1\n  Line 2\n  Line 3");
      expect(result.cursorPosition).toBe(2);
      expect(result.selectionStart).toBe(0);
      expect(result.selectionEnd).toBe(26); // 新しい長さに合わせて調整
    });

    it("複数行の途中から選択してインデントを追加する", () => {
      const value = "Line 1\nLine 2\nLine 3";
      const result = addIndent(value, 7, 20); // 2行目から最後まで選択
      
      expect(result.newValue).toBe("Line 1\n  Line 2\n  Line 3");
      expect(result.cursorPosition).toBe(9);
      expect(result.selectionStart).toBe(7);
      expect(result.selectionEnd).toBe(24);
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

    it("複数行を選択してインデントを削除する", () => {
      const value = "  Line 1\n  Line 2\n  Line 3";
      const result = removeIndent(value, 0, 26); // 全体を選択
      
      expect(result).toBeDefined();
      expect(result!.newValue).toBe("Line 1\nLine 2\nLine 3");
      expect(result!.cursorPosition).toBe(0);
      expect(result!.selectionStart).toBe(0);
      expect(result!.selectionEnd).toBe(20);
    });

    it("複数行の途中から選択してインデントを削除する", () => {
      const value = "  Line 1\n  Line 2\n  Line 3";
      const result = removeIndent(value, 9, 26); // 2行目から最後まで選択
      
      expect(result).toBeDefined();
      expect(result!.newValue).toBe("  Line 1\nLine 2\nLine 3");
      expect(result!.cursorPosition).toBe(9);
      expect(result!.selectionStart).toBe(9);
      expect(result!.selectionEnd).toBe(22);
    });

    it("インデントがない行を含む複数行選択でインデント削除", () => {
      const value = "  Line 1\nLine 2\n  Line 3";
      const result = removeIndent(value, 0, 24); // 全体を選択
      
      expect(result).toBeDefined();
      expect(result!.newValue).toBe("Line 1\nLine 2\nLine 3");
      expect(result!.cursorPosition).toBe(0);
      expect(result!.selectionStart).toBe(0);
      expect(result!.selectionEnd).toBe(20);
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