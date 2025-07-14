import { describe, it, expect, beforeEach } from 'vitest';
import { detectTextAreaContext, isEnabledInContext, TextAreaContext } from './contextDetector';

describe('contextDetector', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('detectTextAreaContext', () => {
    it('コメントフォームのテキストエリアをCOMMENTSとして検出', () => {
      container.innerHTML = `
        <div class="comment-form-textarea">
          <textarea id="test-textarea"></textarea>
        </div>
      `;
      const textarea = container.querySelector('textarea')!;
      
      expect(detectTextAreaContext(textarea)).toBe(TextAreaContext.COMMENTS);
    });

    it('Issue本文のテキストエリアをCOMMENTSとして検出', () => {
      container.innerHTML = `<textarea id="issue_body"></textarea>`;
      const textarea = container.querySelector('textarea')!;
      
      expect(detectTextAreaContext(textarea)).toBe(TextAreaContext.COMMENTS);
    });

    it('PR本文のテキストエリアをCOMMENTSとして検出', () => {
      container.innerHTML = `<textarea id="pull_request_body"></textarea>`;
      const textarea = container.querySelector('textarea')!;
      
      expect(detectTextAreaContext(textarea)).toBe(TextAreaContext.COMMENTS);
    });

    it('インラインコメントフォームをCOMMENTSとして検出', () => {
      container.innerHTML = `
        <div class="inline-comment-form">
          <textarea></textarea>
        </div>
      `;
      const textarea = container.querySelector('textarea')!;
      
      expect(detectTextAreaContext(textarea)).toBe(TextAreaContext.COMMENTS);
    });

    it('レビューコメントをCOMMENTSとして検出', () => {
      container.innerHTML = `
        <div class="review-comment">
          <textarea></textarea>
        </div>
      `;
      const textarea = container.querySelector('textarea')!;
      
      expect(detectTextAreaContext(textarea)).toBe(TextAreaContext.COMMENTS);
    });

    it('CodeMirrorエディタをCODE_EDITORとして検出', () => {
      container.innerHTML = `
        <div class="CodeMirror">
          <textarea></textarea>
        </div>
      `;
      const textarea = container.querySelector('textarea')!;
      
      expect(detectTextAreaContext(textarea)).toBe(TextAreaContext.CODE_EDITOR);
    });

    it('Monacoエディタ��CODE_EDITORとして検出', () => {
      container.innerHTML = `
        <div class="monaco-editor">
          <textarea></textarea>
        </div>
      `;
      const textarea = container.querySelector('textarea')!;
      
      expect(detectTextAreaContext(textarea)).toBe(TextAreaContext.CODE_EDITOR);
    });

    it('ファイルエディタのテキストエリアをCODE_EDITORとして検出', () => {
      container.innerHTML = `
        <div class="file-editor-textarea">
          <textarea></textarea>
        </div>
      `;
      const textarea = container.querySelector('textarea')!;
      
      expect(detectTextAreaContext(textarea)).toBe(TextAreaContext.CODE_EDITOR);
    });

    it('WikiページのテキストエリアをMARKDOWNとして検出', () => {
      container.innerHTML = `
        <div class="wiki-wrapper">
          <textarea></textarea>
        </div>
      `;
      const textarea = container.querySelector('textarea')!;
      
      expect(detectTextAreaContext(textarea)).toBe(TextAreaContext.MARKDOWN);
    });

    it('Markdownファイル編集時にMARKDOWNとして検出', () => {
      container.innerHTML = `
        <div class="breadcrumb">
          <span class="final-path">README.md</span>
        </div>
        <div class="file-editor-textarea">
          <textarea></textarea>
        </div>
      `;
      const textarea = container.querySelector('textarea')!;
      
      expect(detectTextAreaContext(textarea)).toBe(TextAreaContext.MARKDOWN);
    });

    it('不明なコンテキストをUNKNOWNとして検出', () => {
      container.innerHTML = `<textarea></textarea>`;
      const textarea = container.querySelector('textarea')!;
      
      expect(detectTextAreaContext(textarea)).toBe(TextAreaContext.UNKNOWN);
    });

    it('data-target属性のコメントフォームをCOMMENTSとして検出', () => {
      container.innerHTML = `
        <form>
          <textarea data-target="comment-form.textarea"></textarea>
        </form>
      `;
      const textarea = container.querySelector('textarea')!;
      
      expect(detectTextAreaContext(textarea)).toBe(TextAreaContext.COMMENTS);
    });
  });

  describe('isEnabledInContext', () => {
    const settings = {
      applyToComments: true,
      applyToCodeEditor: false,
      applyToMarkdown: true,
    };

    it('COMMENTSコンテキストで設定に従って有効/無効を判定', () => {
      expect(isEnabledInContext(TextAreaContext.COMMENTS, settings)).toBe(true);
      expect(isEnabledInContext(TextAreaContext.COMMENTS, { ...settings, applyToComments: false })).toBe(false);
    });

    it('CODE_EDITORコンテキストで設定に従って有効/無効を判定', () => {
      expect(isEnabledInContext(TextAreaContext.CODE_EDITOR, settings)).toBe(false);
      expect(isEnabledInContext(TextAreaContext.CODE_EDITOR, { ...settings, applyToCodeEditor: true })).toBe(true);
    });

    it('MARKDOWNコンテキストで設定に従って有効/無効を判定', () => {
      expect(isEnabledInContext(TextAreaContext.MARKDOWN, settings)).toBe(true);
      expect(isEnabledInContext(TextAreaContext.MARKDOWN, { ...settings, applyToMarkdown: false })).toBe(false);
    });

    it('UNKNOWNコンテキストでは常に有効', () => {
      expect(isEnabledInContext(TextAreaContext.UNKNOWN, settings)).toBe(true);
      expect(isEnabledInContext(TextAreaContext.UNKNOWN, {
        applyToComments: false,
        applyToCodeEditor: false,
        applyToMarkdown: false,
      })).toBe(true);
    });
  });
});