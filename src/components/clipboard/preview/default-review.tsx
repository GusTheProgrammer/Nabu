import React from 'react';

import {ClipboardEntry} from '@/types/clipboard';

interface DefaultPreviewProps {
  entry: ClipboardEntry;
}

const DefaultPreview: React.FC<DefaultPreviewProps> = ({entry}) => {
  return (
    <div className="text-foreground text-lg font-mono break-all leading-relaxed w-full h-full select-all selection:bg-accent selection:text-accent-foreground">
      {entry.preview}
    </div>
  );
};

export default DefaultPreview;