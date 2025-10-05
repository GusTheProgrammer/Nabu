export type ClipboardContentType =
  | 'text'
  | 'html'
  | 'rtf'
  | 'image'
  | 'file'
  | 'link'
  | 'email'
  | 'color';

export interface ClipboardEntry {
  id: number;
  content: string;
  contentType: ClipboardContentType;
  preview?: string;
  copyCount: number;
  firstCopiedAt: string;
  lastCopiedAt: string;
  isFavorite: boolean;
  metadata?: string;
  sourceUrl?: string;
}

export interface ClipboardCaptureOptions {
  text: boolean;
  html: boolean;
  rtf: boolean;
  image: boolean;
  files: boolean;
}

export type SortDirection = 'ASC' | 'DESC';

export type SortBy = keyof typeof SORT_OPTIONS;

export const SORT_OPTIONS = {
  lastCopiedAt: { label: 'Last Copy Time', dbColumn: 'last_copied_at' },
  firstCopiedAt: { label: 'First Copy Time', dbColumn: 'first_copied_at' },
  copyCount: { label: '# of Copies', dbColumn: 'copy_count' },
} as const;
