import React from 'react';
import {
  AtSign,
  Files,
  FileText,
  Image,
  Link2,
  NotepadText,
  Palette,
  SquareCode,
} from 'lucide-react';

import type { ClipboardContentType, ClipboardEntry } from '@/types/clipboard';

export const CLIPBOARD_CONTENT_ICONS = {
  link: {
    label: 'Links',
    icon: Link2,
    className: 'text-blue-400',
  },
  email: {
    label: 'Emails',
    icon: AtSign,
    className: 'text-red-400',
  },
  text: {
    label: 'Text',
    icon: NotepadText,
    className: 'text-muted-foreground',
  },
  rtf: {
    label: 'RTF',
    icon: FileText,
    className: 'text-muted-foreground',
  },
  html: {
    label: 'HTML',
    icon: SquareCode,
    className: 'text-muted-foreground',
  },
  image: {
    label: 'Images',
    icon: Image,
    className: '',
  },
  color: {
    label: 'Colors',
    icon: Palette,
    className: '',
  },
  file: {
    label: 'Files',
    icon: Files,
    className: 'text-green-400',
  },
};

export const ClipboardEntryIcon: React.FC<{ entry: ClipboardEntry }> = ({ entry }) => {
  if (entry.contentType === 'image') {
    return (
      <img
        src={`data:image/png;base64,${entry.content}`}
        alt='clipboard preview'
        className='h-6 w-6 rounded object-cover'
      />
    );
  }

  if (entry.contentType === 'color') {
    return (
      <div
        className='h-4 w-4 rounded-full border border-border'
        style={{ backgroundColor: entry.preview }}
      />
    );
  }

  const config =
    CLIPBOARD_CONTENT_ICONS[entry.contentType as ClipboardContentType] ??
    CLIPBOARD_CONTENT_ICONS.text;
  const Icon = config.icon;

  return <Icon className={`h-4 w-4 ${config.className}`} />;
};
