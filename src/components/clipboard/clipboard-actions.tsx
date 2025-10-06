import { ClipboardPaste, Copy } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useClipboardActions } from '@/hooks/use-clipboard-actions';
import { useClipboardContext } from '@/clipboard-context';
import { TooltipButton } from '@/components/ui/tooltip-button';
import { useSetting } from '@/hooks/use-setting';
import { DEFAULT_KEYBOARD_NAVIGATION, SETTING_KEYS } from '@/types/settings';
import { formatShortcut } from '@/util/clipboard-parser';

const ClipboardActions = () => {
  const { copyEntry, pasteEntry } = useClipboardActions();
  const { state } = useClipboardContext();

  const { value: navSettings } = useSetting(
    SETTING_KEYS.KEYBOARD_NAVIGATION,
    DEFAULT_KEYBOARD_NAVIGATION
  );

  const pasteKeybind = formatShortcut(
    navSettings.shortcuts.pasteEntry.modifiers,
    navSettings.shortcuts.pasteEntry.key
  );
  const copyKeybind = formatShortcut(
    navSettings.shortcuts.copyEntry.modifiers,
    navSettings.shortcuts.copyEntry.key
  );

  return (
    <div className='flex items-center gap-2'>
      <TooltipButton
        tooltipContent='Paste'
        kbd={pasteKeybind.join(' + ')}
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
        kbd={copyKeybind.join(' + ')}
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
