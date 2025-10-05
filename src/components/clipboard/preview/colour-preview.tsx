import React from 'react';

import { ClipboardEntry } from '@/types/clipboard';

interface ColourPreviewProps {
  entry: ClipboardEntry;
}

const ColourPreview: React.FC<ColourPreviewProps> = ({ entry }) => {
  return (
    <div className='flex flex-col items-center justify-center gap-4'>
      <div
        className='w-32 h-32 rounded-lg shadow-lg border-4 border-border'
        style={{ backgroundColor: entry.preview }}
      />
      <div className='text-foreground text-lg font-mono break-all leading-relaxed select-all selection:bg-accent selection:text-accent-foreground'>
        {entry.preview}
      </div>
    </div>
  );
};

export default ColourPreview;
