export type ClipboardContentType = 'text' | 'html' | 'rtf' | 'image' | 'file';

export interface ClipboardEntry {
    id: number;
    content: string;
    contentType: ClipboardContentType;
    preview?: string;
    copyCount: number;
    firstCopiedAt: string;
    lastCopiedAt: string;
    isFavorite: boolean;
}

export interface ClipboardCaptureOptions {
    text: boolean;
    html: boolean;
    rtf: boolean;
    image: boolean;
    files: boolean;
}