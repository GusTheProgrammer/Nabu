import { ClipboardPaste, Copy } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useClipboardActions } from '@/hooks/use-clipboard-actions';
import { useClipboardContext } from '@/clipboard-context';
import { TooltipButton } from '@/components/ui/tooltip-button';

const ClipboardActions = () => {
  const { copyEntry, pasteEntry } = useClipboardActions();
  const { state } = useClipboardContext();

  return (
    <div className='flex items-center gap-2'>
      <TooltipButton
        tooltipContent='Paste'
        tooltipSide='bottom'
        variant='ghost'
        size='sm'
        onClick={() => state.selectedClipboardEntry && pasteEntry(state.selectedClipboardEntry)}
        disabled={!state.selectedClipboardEntry}
        className={cn(
          'h-8 w-8 p-0 transition-colors',
          state.selectedClipboardEntry && 'text-primary hover:bg-accent hover:text-primary/90'
        )}
      >
        <ClipboardPaste className='h-4 w-4' />
      </TooltipButton>

      <TooltipButton
        tooltipContent='Copy to clipboard'
        tooltipSide='bottom'
        variant='ghost'
        size='sm'
        onClick={() => state.selectedClipboardEntry && copyEntry(state.selectedClipboardEntry)}
        disabled={!state.selectedClipboardEntry}
        className={cn(
          'h-8 w-8 p-0 transition-colors',
          state.selectedClipboardEntry && 'text-primary hover:bg-accent hover:text-primary/90'
        )}
      >
        <Copy className='h-4 w-4' />
      </TooltipButton>
    </div>
  );
};

export default ClipboardActions;
