import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EVENT_TYPES } from "./constants";
import { IndentActionType } from "./shortcutDetector";
import { TextAreaContext } from "./contextDetector";

// モック
vi.mock("./textareaDetector", () => ({
  getTextAreaElement: vi.fn(),
}));

vi.mock("./shortcutDetector", () => ({
  detectIndentAction: vi.fn(),
  IndentActionType: {
    ADD: 'ADD',
    REMOVE: 'REMOVE',
    NONE: 'NONE'
  }
}));

vi.mock("./indentHandler", () => ({
  getIndentHandler: vi.fn(),
}));

vi.mock("./settings", () => ({
  initializeSettings: vi.fn().mockResolvedValue(undefined),
  getCurrentSettings: vi.fn(),
}));

vi.mock("./contextDetector", () => ({
  detectTextAreaContext: vi.fn(),
  isEnabledInContext: vi.fn(),
  TextAreaContext: {
    COMMENTS: 'COMMENTS',
    CODE_EDITOR: 'CODE_EDITOR',
    MARKDOWN: 'MARKDOWN',
    UNKNOWN: 'UNKNOWN'
  }
}));

describe("content/index.ts", () => {
  let addEventListenerSpy: any;
  let mockTextArea: HTMLTextAreaElement;
  let dispatchEventSpy: any;
  let eventHandler: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // モックテキストエリアの作成
    mockTextArea = document.createElement('textarea');
    mockTextArea.value = 'Hello World';
    mockTextArea.selectionStart = 5;
    mockTextArea.selectionEnd = 5;
    dispatchEventSpy = vi.spyOn(mockTextArea, 'dispatchEvent');
    
    // デフォルトのモック設定
    const { getTextAreaElement } = await import("./textareaDetector");
    (getTextAreaElement as any).mockReturnValue(mockTextArea);
    
    const { getCurrentSettings } = await import("./settings");
    (getCurrentSettings as any).mockReturnValue({
      enableTab: true,
      enableBracket: true,
      applyToComments: true,
      applyToCodeEditor: true,
      applyToMarkdown: true,
    });
    
    const { detectTextAreaContext } = await import("./contextDetector");
    (detectTextAreaContext as any).mockReturnValue(TextAreaContext.COMMENTS);
    
    const { isEnabledInContext } = await import("./contextDetector");
    (isEnabledInContext as any).mockReturnValue(true);
    
    const { detectIndentAction } = await import("./shortcutDetector");
    (detectIndentAction as any).mockReturnValue(IndentActionType.ADD);
    
    const { getIndentHandler } = await import("./indentHandler");
    (getIndentHandler as any).mockReturnValue(() => ({
      newValue: 'Hello  World',
      cursorPosition: 7
    }));
    
    // イベントリスナーのスパイを設定
    addEventListenerSpy = vi.spyOn(document, 'addEventListener').mockImplementation((event, handler) => {
      if (event === EVENT_TYPES.KEYDOWN) {
        eventHandler = handler;
      }
    });
    
    // モジュールキャッシュをクリアして再インポート
    vi.resetModules();
    await import("./index");
    
    // 初期化が完了するまで待つ
    await new Promise(resolve => setTimeout(resolve, 10));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("初期化時にイベントリスナーが登録される", async () => {
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      EVENT_TYPES.KEYDOWN,
      expect.any(Function),
      true
    );
  });

  it("初期化時に設定が読み込まれる", async () => {
    const { initializeSettings } = await import("./settings");
    expect(initializeSettings).toHaveBeenCalled();
  });

  it("Tabキーが押されたときインデント処理が実行される", async () => {
    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    
    // イベントハンドラーを実行
    eventHandler(event);
    
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(mockTextArea.value).toBe('Hello  World');
    expect(mockTextArea.selectionStart).toBe(7);
    expect(mockTextArea.selectionEnd).toBe(7);
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: EVENT_TYPES.INPUT,
        bubbles: true
      })
    );
  });

  it("テキストエリア以外の要素では処理されない", async () => {
    const { getTextAreaElement } = await import("./textareaDetector");
    (getTextAreaElement as any).mockReturnValue(null);
    
    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    
    eventHandler(event);
    
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it("無効なコンテキストでは処理されない", async () => {
    const { isEnabledInContext } = await import("./contextDetector");
    (isEnabledInContext as any).mockReturnValue(false);
    
    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    
    eventHandler(event);
    
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it("インデント操作以外のキーでは処理されない", async () => {
    const { detectIndentAction } = await import("./shortcutDetector");
    (detectIndentAction as any).mockReturnValue(IndentActionType.NONE);
    
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    
    eventHandler(event);
    
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it("インデントハンドラーが結果を返さない場合は処理されない", async () => {
    const { getIndentHandler } = await import("./indentHandler");
    (getIndentHandler as any).mockReturnValue(() => undefined);
    
    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    const originalValue = mockTextArea.value;
    
    eventHandler(event);
    
    expect(mockTextArea.value).toBe(originalValue);
    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });

  it("選択範囲がnullの場合は処理されない", async () => {
    // インデントハンドラーがnullを返すように設定
    const { getIndentHandler } = await import("./indentHandler");
    (getIndentHandler as any).mockReturnValue(() => null);
    
    mockTextArea.selectionStart = null as any;
    mockTextArea.selectionEnd = null as any;
    
    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    const originalValue = mockTextArea.value;
    
    eventHandler(event);
    
    expect(preventDefaultSpy).toHaveBeenCalled();
    // 値が変更されていないことを確認
    expect(mockTextArea.value).toBe(originalValue);
  });
});