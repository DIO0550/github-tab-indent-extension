import { Settings, DEFAULT_SETTINGS } from '../options/constants';

/**
 * ストレージから設定を読み込む
 * @returns 設定オブジェクトのPromise
 */
export async function loadSettings(): Promise<Settings> {
  try {
    const result = await chrome.storage.sync.get('settings');
    if (result.settings) {
      // デフォルト設定とマージして、新しい設定項目が追加されても動作するようにする
      return { ...DEFAULT_SETTINGS, ...result.settings };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * 設定変更を監視する
 * @param callback 設定が変更されたときに呼ばれるコールバック
 * @returns リスナーを削除する関数
 */
export function watchSettings(callback: (settings: Settings) => void): () => void {
  const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
    if (changes.settings) {
      const newSettings = changes.settings.newValue || DEFAULT_SETTINGS;
      callback({ ...DEFAULT_SETTINGS, ...newSettings });
    }
  };

  chrome.storage.onChanged.addListener(listener);

  // リスナーを削除する関数を返す
  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
}

// 現在の設定を保持するための変数
let currentSettings: Settings = DEFAULT_SETTINGS;

/**
 * 現在の設定を取得する（同期的）
 * @returns 現在の設定
 */
export function getCurrentSettings(): Settings {
  return currentSettings;
}

/**
 * 設定を初期化して最新の状態に更新する
 */
export async function initializeSettings(): Promise<void> {
  currentSettings = await loadSettings();
  
  // 設定変更を監視して自動的に更新
  watchSettings((newSettings) => {
    currentSettings = newSettings;
  });
}