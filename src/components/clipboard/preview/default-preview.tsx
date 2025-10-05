import React from 'react';

interface DefaultPreviewProps {
  content: string | null | undefined;
}

const DefaultPreview: React.FC<DefaultPreviewProps> = ({ content }) => {
  return (
    <div className='text-foreground text-lg font-mono break-all leading-relaxed w-full h-full selection:bg-accent selection:text-accent-foreground'>
      {content}
    </div>
  );
};

export default DefaultPreview;
