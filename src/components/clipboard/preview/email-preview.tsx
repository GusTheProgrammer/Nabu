type EmailPreviewProps = {
  entry: {
    content: string;
    preview?: string;
  };
};

const EmailPreview = ({ entry }: EmailPreviewProps) => (
  <a
    href={`mailto:${entry.content}`}
    className='text-foreground text-lg font-mono break-all leading-relaxed underline hover:text-primary select-all selection:bg-accent selection:text-accent-foreground'
  >
    {entry.preview}
  </a>
);

export default EmailPreview;
