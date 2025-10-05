import {
  hasFiles,
  hasHTML,
  hasImage,
  hasRTF,
  hasText,
  onSomethingUpdate,
  readFiles,
  readHtml,
  readImageBase64,
  readRtf,
  readText,
  startListening,
  writeFiles,
  writeHtmlAndText,
  writeImageBase64,
  writeRtf,
  writeText,
} from 'tauri-plugin-clipboard-api';

import { safeInvoke } from '@/lib/utils';
import clipboardDatabase from '@/lib/db';
import Logger from '@/util/logger';
import { ClipboardCaptureOptions, ClipboardContentType, ClipboardEntry } from '@/types/clipboard';
import { detectSpecialType, getImageMetadata, parseWindowTitle } from '@/util/clipboard-parser';

export const DEFAULT_CAPTURE_OPTIONS: ClipboardCaptureOptions = {
  text: true,
  html: true,
  rtf: true,
  image: true,
  files: true,
};

class ClipboardService {
  private unlistenFn?: () => Promise<void>;
  private captureOptions = DEFAULT_CAPTURE_OPTIONS;
  private lastCapturedContent = { content: '', contentType: '' };
  private eventTarget = new EventTarget();

  constructor() {
    clipboardDatabase.init().catch((err) => {
      Logger.error('Failed to initialize clipboard database', err);
    });
  }

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {
    this.eventTarget.addEventListener(type, listener, options);
  }

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ) {
    this.eventTarget.removeEventListener(type, listener, options);
  }

  async startMonitoring(options: Partial<ClipboardCaptureOptions> = {}) {
    if (this.unlistenFn) {
      await this.stopMonitoring();
    }

    try {
      this.captureOptions = { ...DEFAULT_CAPTURE_OPTIONS, ...options };
      this.unlistenFn = await startListening(this.captureOptions);

      await this.captureCurrentClipboard();
      await onSomethingUpdate(this.handleClipboardUpdate.bind(this));
    } catch (err) {
      Logger.error('Failed to start clipboard monitoring', err);
      throw err;
    }
  }

  async stopMonitoring() {
    if (this.unlistenFn) {
      await this.unlistenFn();
      this.unlistenFn = undefined;
    }
  }

  async captureCurrentClipboard() {
    try {
      const contentTypeChecks = [
        { type: 'image', enabled: this.captureOptions.image, checkFn: hasImage },
        { type: 'html', enabled: this.captureOptions.html, checkFn: hasHTML },
        { type: 'rtf', enabled: this.captureOptions.rtf, checkFn: hasRTF },
        { type: 'file', enabled: this.captureOptions.files, checkFn: hasFiles },
        { type: 'text', enabled: this.captureOptions.text, checkFn: hasText },
      ] as const;

      for (const { type, enabled, checkFn } of contentTypeChecks) {
        if (enabled && (await checkFn())) {
          await this.captureContent(type);
          break;
        }
      }

      this.eventTarget.dispatchEvent(new Event('update'));
    } catch (error) {
      Logger.error('Error capturing clipboard:', error);
      this.eventTarget.dispatchEvent(new Event('error'));
    }
  }

  private async handleClipboardUpdate(types: any) {
    try {
      let updated = false;

      const contentTypeChecks = [
        { type: 'image', enabled: this.captureOptions.image, hasContent: types.image },
        { type: 'html', enabled: this.captureOptions.html, hasContent: types.html },
        { type: 'rtf', enabled: this.captureOptions.rtf, hasContent: types.rtf },
        { type: 'file', enabled: this.captureOptions.files, hasContent: types.files },
        { type: 'text', enabled: this.captureOptions.text, hasContent: types.text },
      ] as const;

      for (const { type, enabled, hasContent } of contentTypeChecks) {
        if (enabled && hasContent) {
          updated = await this.captureContent(type);
          break;
        }
      }

      if (updated) this.eventTarget.dispatchEvent(new Event('update'));
    } catch (error) {
      Logger.error('Error handling clipboard update:', error);
      this.eventTarget.dispatchEvent(new Event('error'));
    }
  }

  private async captureContent(contentType: ClipboardContentType): Promise<boolean> {
    try {
      let currentContentType = contentType;
      let content = '';
      let preview = '';
      let sourceUrl = '';
      let metadata = '';
      let plainTextContent = '';

      switch (currentContentType) {
        case 'image':
          content = (await readImageBase64()) || '';
          if (content) {
            const { width, height, sizeKB } = await getImageMetadata(content);
            preview = `Image [${width}x${height}]`;
            metadata = `[${sizeKB} KB]`;
          }
          break;
        case 'html':
          content = (await readHtml()) || '';
          plainTextContent = (await readText()) || '';
          preview = plainTextContent;
          sourceUrl = (await safeInvoke('get_clipboard_source_url')) || '';
          break;
        case 'rtf':
          content = (await readRtf()) || '';
          plainTextContent = (await readText()) || '';
          preview = plainTextContent;
          break;
        case 'file':
          const files = await readFiles();
          content = files.join('\n');
          preview = content;
          break;
        case 'text':
          content = (await readText()) || '';
          plainTextContent = content;
          preview = content;
          break;
      }

      if (['text', 'html', 'rtf'].includes(currentContentType) && plainTextContent) {
        const specialType = detectSpecialType(plainTextContent);
        if (specialType.type !== 'text') {
          currentContentType = specialType.type;
        }
      }

      if (
        !content ||
        (this.lastCapturedContent.content === content &&
          this.lastCapturedContent.contentType === currentContentType)
      ) {
        return false;
      }

      this.lastCapturedContent = { content, contentType: currentContentType };
      let windowTitle = '';
      let windowSource = '';
      try {
        const windowInfo = parseWindowTitle(
          (await safeInvoke('get_foreground_window_title')) || ''
        );
        windowTitle = windowInfo.title;
        windowSource = windowInfo.source;
      } catch (e) {
        windowTitle = '';
        windowSource = '';
      }

      const appMetadata = `[${windowTitle}] (${windowSource})`;
      if (contentType === 'image') {
        metadata = `${appMetadata} ${metadata}`;
      } else {
        metadata = appMetadata;
      }

      return await clipboardDatabase.saveClipboardEntry(
        content,
        currentContentType,
        preview,
        metadata,
        sourceUrl
      );
    } catch (error) {
      Logger.error(`Error capturing ${contentType}:`, error);
      return false;
    }
  }

  async copyToClipboard(entry: ClipboardEntry) {
    try {
      switch (entry.contentType) {
        case 'image':
          await writeImageBase64(entry.content);
          break;
        case 'html':
          const plainText = entry.preview || '';
          await writeHtmlAndText(entry.content, plainText).catch(() =>
            writeText(entry.preview || '')
          );
          break;
        case 'rtf':
          await writeRtf(entry.content).catch(() => writeText(entry.content));
          break;
        case 'file':
          const files = entry.content.split(/[\n\r]+/).filter((f) => f.trim());
          await (files.length > 0 ? writeFiles(files) : writeText(entry.content));
          break;
        default:
          await writeText(entry.content);
          break;
      }
      Logger.debug('Copied item to clipboard');
    } catch (error) {
      Logger.error('Error copying to clipboard:', error);
      await writeText(entry.preview || '');
    }
  }

  async pasteEntry(entry: ClipboardEntry) {
    await this.copyToClipboard(entry);
    await safeInvoke('paste');
    Logger.debug('Pasted item in previous application');
  }
}

const clipboardService = new ClipboardService();
export default clipboardService;
