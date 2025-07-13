import { Settings, DEFAULT_SETTINGS, MESSAGES } from './constants';

const STORAGE_KEY = 'settings';

/**
 * Chrome Storage APIから設定を読み込む
 * @returns 保存されている設定とデフォルト設定をマージした結果
 * @throws 読み込みエラーが発生した場合はコンソールにエラーを出力し、デフォルト設定を返す
 */
export async function loadSettings(): Promise<Settings> {
  try {
    const stored = await chrome.storage.sync.get(STORAGE_KEY);
    return { ...DEFAULT_SETTINGS, ...stored[STORAGE_KEY] };
  } catch (error) {
    console.error(MESSAGES.LOAD_ERROR, error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Chrome Storage APIに設定を保存する
 * @param settings - 保存する設定オブジェクト
 * @throws 保存に失敗した場合はエラーをスローする
 */
export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await chrome.storage.sync.set({ [STORAGE_KEY]: settings });
  } catch (error) {
    console.error(MESSAGES.SAVE_ERROR_LOG, error);
    throw error;
  }
}

/**
 * 設定をデフォルト値にリセットする
 * @throws 保存に失敗した場合はエラーをスローする
 */
export async function resetSettings(): Promise<void> {
  return saveSettings(DEFAULT_SETTINGS);
}