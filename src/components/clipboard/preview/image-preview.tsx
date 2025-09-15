import React from 'react';

import {ClipboardEntry} from '@/types/clipboard';

interface ImagePreviewProps {
  entry: ClipboardEntry;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({entry}) => {
  return (
    <img
      src={`data:image/png;base64,${entry.content}`}
      alt="clipboard full preview"
      className="max-w-full max-h-full object-contain rounded-lg shadow"
    />
  );
};

export default ImagePreview;