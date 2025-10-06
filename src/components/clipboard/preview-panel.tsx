import { ClipboardPen } from 'lucide-react';

import type { ReactNode } from 'react';

import { useClipboardContext } from '@/clipboard-context';
import { cn, formatDate, scrollbarStyles } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LinkPreview from '@/components/clipboard/preview/link-preview';
import ColourPreview from '@/components/clipboard/preview/colour-preview';
import DefaultPreview from '@/components/clipboard/preview/default-preview';
import ImagePreview from '@/components/clipboard/preview/image-preview';
import EmailPreview from '@/components/clipboard/preview/email-preview';
import ClipboardActions from '@/components/clipboard/clipboard-actions';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

type ValueType = string | number | null | undefined;

type MetadataDetail = {
  label: string;
  value: ValueType;
  render?: (value: ValueType) => ReactNode;
};

const ClipboardPreview = () => {
  const { state } = useClipboardContext();
  const { selectedClipboardEntry } = state;

  if (!selectedClipboardEntry) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <ClipboardPen className='h-12 w-12' />
            </EmptyMedia>
            <EmptyTitle>No Entry Selected</EmptyTitle>
            <EmptyDescription>Select an entry to view details</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const renderPreview = (() => {
    switch (selectedClipboardEntry.contentType) {
      case 'image':
        return <ImagePreview entry={selectedClipboardEntry} />;
      case 'link':
        return <LinkPreview entry={selectedClipboardEntry} />;
      case 'color':
        return <ColourPreview entry={selectedClipboardEntry} />;
      case 'email':
        return <EmailPreview entry={selectedClipboardEntry} />;
      default:
        return <DefaultPreview content={selectedClipboardEntry.preview} />;
    }
  })();

  const showTabs = ['html', 'rtf', 'color', 'email'].includes(
    selectedClipboardEntry.contentType ?? ''
  );
  let appMetadata = selectedClipboardEntry.metadata || '';
  let imageSize: string | null = null;

  if (selectedClipboardEntry.contentType === 'image' && appMetadata) {
    const sizeMatch = appMetadata.match(/(\s*\[[\d.]+\s*KB\])$/);
    if (sizeMatch) {
      imageSize = sizeMatch[1].trim();
      appMetadata = appMetadata.replace(sizeMatch[0], '').trim();
    }
  }
  if (appMetadata === '[] ()') {
    appMetadata = '';
  }

  const allDetails: MetadataDetail[] = [
    {
      label: 'Application',
      value: appMetadata,
      render: (value: ValueType) => (
        <div className='flex items-center justify-end gap-2'>
          <div className='w-4 h-4 bg-primary rounded-sm flex-shrink-0'></div>
          <span className='text-foreground text-sm truncate select-text selection:bg-accent selection:text-accent-foreground'>
            {String(value)}
          </span>
        </div>
      ),
    },
    {
      label: 'Source URL',
      value: selectedClipboardEntry.sourceUrl,
      render: (value: ValueType) => (
        <a
          href={value as string}
          target='_blank'
          rel='noopener noreferrer'
          className='text-foreground text-sm truncate block text-right underline hover:text-primary select-text selection:bg-accent selection:text-accent-foreground'
        >
          {value}
        </a>
      ),
    },
    {
      label: 'Type',
      value: selectedClipboardEntry.contentType || 'Text',
      render: (value: ValueType) => (
        <span className='text-foreground text-sm capitalize select-text selection:bg-accent selection:text-accent-foreground'>
          {String(value)}
        </span>
      ),
    },
    { label: 'Size', value: imageSize },
    ...((selectedClipboardEntry.copyCount ?? 0) > 1
      ? ([
          { label: 'Copy Count', value: selectedClipboardEntry.copyCount },
          {
            label: 'First Copied At',
            value: selectedClipboardEntry.firstCopiedAt,
            render: (value) => <span className='text-foreground text-sm'>{formatDate(value)}</span>,
          },
          {
            label: 'Last Copied At',
            value: selectedClipboardEntry.lastCopiedAt,
            render: (value) => <span className='text-foreground text-sm'>{formatDate(value)}</span>,
          },
        ] as MetadataDetail[])
      : ([
          {
            label: 'Copied At',
            value: selectedClipboardEntry.firstCopiedAt,
            render: (value) => <span className='text-foreground text-sm'>{formatDate(value)}</span>,
          },
        ] as MetadataDetail[])),
    {
      label: 'Characters',
      value:
        selectedClipboardEntry.contentType !== 'image'
          ? selectedClipboardEntry.preview?.length
          : undefined,
    },
  ];

  const details = allDetails.filter((item) => item.value != null && item.value !== '');
  return (
    <div className='flex flex-col h-full overflow-hidden'>
      <div
        className={`flex-1 flex flex-col bg-background overflow-auto min-h-[300px] ${scrollbarStyles}`}
      >
        {showTabs ? (
          <Tabs defaultValue='preview' className='flex flex-col h-full w-full'>
            <div className='py-2 px-4 border-b border-border flex items-center justify-between'>
              <ClipboardActions />
              <TabsList>
                <TabsTrigger value='preview'>Preview</TabsTrigger>
                <TabsTrigger value='raw'>Raw</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent
              value='preview'
              className={cn('flex-1 p-6 flex overflow-auto mt-0', scrollbarStyles)}
            >
              {renderPreview}
            </TabsContent>
            <TabsContent
              value='raw'
              className={cn('flex-1 p-6 overflow-auto mt-0', scrollbarStyles)}
            >
              <DefaultPreview content={selectedClipboardEntry.content} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className='flex flex-col h-full'>
            <div className='py-2 px-4 border-b border-border flex items-center justify-between'>
              <ClipboardActions />
              <div className='text-xs text-muted-foreground'>Preview</div>
            </div>
            <div
              className={`flex-1 p-6 flex items-center justify-center overflow-auto ${scrollbarStyles}`}
            >
              {renderPreview}
            </div>
          </div>
        )}
      </div>

      <div
        className={`flex-shrink-0 p-6 border-t border-border bg-background/90 overflow-auto ${scrollbarStyles}`}
      >
        <div className='space-y-4'>
          {details.map(({ label, value, render }) => (
            <div key={label} className='flex justify-between items-center gap-4'>
              <span className='text-muted-foreground text-sm flex-shrink-0 select-none'>
                {label}
              </span>
              <div className='min-w-0 text-right select-all selection:bg-accent selection:text-accent-foreground'>
                {render ? (
                  render(value)
                ) : (
                  <span className='text-foreground text-sm truncate'>{String(value)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClipboardPreview;
