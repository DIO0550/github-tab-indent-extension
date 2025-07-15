/**
 * テキストエリアのコンテキストタイプ
 */
export enum TextAreaContext {
  /** コメント欄（Issue、PR、コミットコメント） */
  COMMENTS = 'COMMENTS',
  /** コードエディタ（ファイル編集） */
  CODE_EDITOR = 'CODE_EDITOR',
  /** Markdownエディタ（Wiki、READMEなど） */
  MARKDOWN = 'MARKDOWN',
  /** 不明なコンテキスト */
  UNKNOWN = 'UNKNOWN'
}

/**
 * 要素がコードエディタかどうかを判定
 * @param element 判定対象の要素
 * @returns コードエディタの場合true
 */
function isCodeEditor(element: HTMLElement): boolean {
  // GitHubのコードエディタは通常、CodeMirrorまたはMonacoエディタを使用
  const parent = element.closest('.CodeMirror, .monaco-editor');
  if (parent) return true;
  
  // ファイル編集ページのテキストエリア
  if (element.closest('.file-editor-textarea')) return true;
  
  // Webエディタのテキストエリア
  if (element.closest('.commit-create')) return true;
  
  return false;
}

/**
 * 要素がMarkdownエディタかどうかを判定
 * @param element 判定対象の要素
 * @returns Markdownエディタの場合true
 */
function isMarkdownEditor(element: HTMLElement): boolean {
  // Wikiページ
  if (element.closest('.wiki-wrapper')) return true;
  
  // READMEやMarkdownファイルの編集
  if (element.closest('.file-editor-textarea')) {
    const pathElement = document.querySelector('.breadcrumb .final-path');
    if (pathElement?.textContent?.match(/\.(md|markdown)$/i)) {
      return true;
    }
  }
  
  return false;
}

/**
 * 要素がコメント欄かどうかを判定
 * @param element 判定対象の要素
 * @returns コメント欄の場合true
 */
function isCommentArea(element: HTMLElement): boolean {
  // Issue/PRのコメント欄
  if (element.closest('.comment-form-textarea')) return true;
  
  // インラインコメント
  if (element.closest('.inline-comment-form')) return true;
  
  // レビューコメント
  if (element.closest('.review-comment')) return true;
  
  // 新規Issue/PR作成フォーム
  if (element.id === 'issue_body' || element.id === 'pull_request_body') return true;
  
  // 一般的なコメントフォーム
  if (element.closest('[data-target="comment-form.textarea"]')) return true;
  
  return false;
}

/**
 * テキストエリアのコンテキストを検出する
 * @param element 検出対象のテキストエリア要素
 * @returns テキストエリアのコンテキスト
 */
export function detectTextAreaContext(element: HTMLElement): TextAreaContext {
  // Markdownエディタの判定を最初に行う（コードエディタの特殊ケースのため）
  if (isMarkdownEditor(element)) {
    return TextAreaContext.MARKDOWN;
  }
  
  // コードエディタの判定
  if (isCodeEditor(element)) {
    return TextAreaContext.CODE_EDITOR;
  }
  
  // コメント欄の判定
  if (isCommentArea(element)) {
    return TextAreaContext.COMMENTS;
  }
  
  // どれにも該当しない場合
  return TextAreaContext.UNKNOWN;
}

/**
 * 現在のコンテキストで機能が有効かどうかを判定
 * @param context テキストエリアのコンテキスト
 * @param settings アプリケーション設定
 * @returns 機能が有効な場合true
 */
export function isEnabledInContext(
  context: TextAreaContext,
  settings: { applyToComments: boolean; applyToCodeEditor: boolean; applyToMarkdown: boolean }
): boolean {
  switch (context) {
    case TextAreaContext.COMMENTS:
      return settings.applyToComments;
    case TextAreaContext.CODE_EDITOR:
      return settings.applyToCodeEditor;
    case TextAreaContext.MARKDOWN:
      return settings.applyToMarkdown;
    case TextAreaContext.UNKNOWN:
      // 不明なコンテキストの場合は、デフォルトで有効にする
      return true;
  }
}