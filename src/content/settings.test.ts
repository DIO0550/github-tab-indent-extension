import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadSettings, watchSettings, getCurrentSettings, initializeSettings } from './settings';
import { Settings, DEFAULT_SETTINGS } from '../options/constants';

// Chrome API モック
const mockChrome = {
  storage: {
    sync: {
      get: vi.fn(),
    },
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
};

// グローバルオブジェクトのモック
vi.stubGlobal('chrome', mockChrome);

describe('settingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadSettings', () => {
    it('ストレージから設定を読み込む', async () => {
      const customSettings: Settings = { ...DEFAULT_SETTINGS, indentSize: 4 };
      mockChrome.storage.sync.get.mockResolvedValue({ settings: customSettings });

      const result = await loadSettings();

      expect(mockChrome.storage.sync.get).toHaveBeenCalledWith('settings');
      expect(result).toEqual(customSettings);
    });

    it('設定が存在しない場合はデフォルト設定を返す', async () => {
      mockChrome.storage.sync.get.mockResolvedValue({});

      const result = await loadSettings();

      expect(result).toEqual(DEFAULT_SETTINGS);
    });

    it('新しい設定項目が追加されてもデフォルト値とマージされる', async () => {
      const partialSettings = { indentSize: 4, indentType: 'tab' as const };
      mockChrome.storage.sync.get.mockResolvedValue({ settings: partialSettings });

      const result = await loadSettings();

      expect(result).toEqual({ ...DEFAULT_SETTINGS, ...partialSettings });
    });

    it('エラーが発生した場合はデフォルト設定を返す', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockChrome.storage.sync.get.mockRejectedValue(new Error('Storage error'));

      const result = await loadSettings();

      expect(result).toEqual(DEFAULT_SETTINGS);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load settings:', expect.any(Error));
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('watchSettings', () => {
    it('設定変更を監視してコールバックを呼ぶ', () => {
      const callback = vi.fn();
      const unwatch = watchSettings(callback);

      expect(mockChrome.storage.onChanged.addListener).toHaveBeenCalled();

      // リスナー関数を取得
      const listener = mockChrome.storage.onChanged.addListener.mock.calls[0][0];

      // 設定変更をシミュレート
      const newSettings: Settings = { ...DEFAULT_SETTINGS, indentSize: 8 };
      listener({ settings: { newValue: newSettings, oldValue: DEFAULT_SETTINGS } });

      expect(callback).toHaveBeenCalledWith(newSettings);

      // リスナーを削除
      unwatch();
      expect(mockChrome.storage.onChanged.removeListener).toHaveBeenCalledWith(listener);
    });

    it('settings以外の変更は無視する', () => {
      const callback = vi.fn();
      watchSettings(callback);

      const listener = mockChrome.storage.onChanged.addListener.mock.calls[0][0];
      listener({ otherKey: { newValue: 'value' } });

      expect(callback).not.toHaveBeenCalled();
    });

    it('newValueがない場合はデフォルト設定を使用', () => {
      const callback = vi.fn();
      watchSettings(callback);

      const listener = mockChrome.storage.onChanged.addListener.mock.calls[0][0];
      listener({ settings: { oldValue: DEFAULT_SETTINGS } });

      expect(callback).toHaveBeenCalledWith(DEFAULT_SETTINGS);
    });
  });

  describe('getCurrentSettings', () => {
    it('現在の設定を同期的に取得できる', () => {
      const settings = getCurrentSettings();
      expect(settings).toBeDefined();
      expect(settings).toHaveProperty('indentSize');
    });
  });

  describe('initializeSettings', () => {
    it('設定を初期化して監視を開始する', async () => {
      const customSettings: Settings = { ...DEFAULT_SETTINGS, indentSize: 4 };
      mockChrome.storage.sync.get.mockResolvedValue({ settings: customSettings });

      await initializeSettings();

      expect(mockChrome.storage.sync.get).toHaveBeenCalledWith('settings');
      expect(mockChrome.storage.onChanged.addListener).toHaveBeenCalled();
      expect(getCurrentSettings()).toEqual(customSettings);
    });

    it('設定変更が自動的に反映される', async () => {
      await initializeSettings();

      const listener = mockChrome.storage.onChanged.addListener.mock.calls[0][0];
      const newSettings: Settings = { ...DEFAULT_SETTINGS, indentSize: 8 };
      
      listener({ settings: { newValue: newSettings } });

      expect(getCurrentSettings()).toEqual(newSettings);
    });
  });
});