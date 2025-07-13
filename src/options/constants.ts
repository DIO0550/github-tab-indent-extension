export interface Settings {
  indentSize: number;
  indentType: 'space' | 'tab';
  enableTab: boolean;
  enableBracket: boolean;
  applyToComments: boolean;
  applyToCodeEditor: boolean;
  applyToMarkdown: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  indentSize: 2,
  indentType: 'space',
  enableTab: true,
  enableBracket: true,
  applyToComments: true,
  applyToCodeEditor: true,
  applyToMarkdown: true,
};

export const DOM_IDS = {
  INDENT_SIZE: 'indent-size',
  INDENT_TYPE: 'indent-type',
  ENABLE_TAB: 'enable-tab',
  ENABLE_BRACKET: 'enable-bracket',
  APPLY_TO_COMMENTS: 'apply-to-comments',
  APPLY_TO_CODE_EDITOR: 'apply-to-code-editor',
  APPLY_TO_MARKDOWN: 'apply-to-markdown',
  STATUS_MESSAGE: 'status-message',
  SAVE_BUTTON: 'save-button',
  RESET_BUTTON: 'reset-button',
} as const;

export const MESSAGES = {
  SAVE_SUCCESS: '設定を保存しました',
  SAVE_ERROR: '設定の保存に失敗しました',
  RESET_SUCCESS: '設定をリセットしました',
  RESET_ERROR: '設定のリセットに失敗しました',
  LOAD_ERROR: 'Failed to load settings:',
  SAVE_ERROR_LOG: 'Failed to save settings:',
} as const;

export const STATUS_MESSAGE_TIMEOUT = 3000;