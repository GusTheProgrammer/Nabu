import { RotateCcw } from 'lucide-react';

import type { ClipboardContentType } from '@/types/clipboard';

import { useClipboardContext } from '@/clipboard-context';
import { cn } from '@/lib/utils';
import { TooltipButton } from '@/components/ui/tooltip-button';
import { CLIPBOARD_CONTENT_ICONS } from '@/util/clipboard-content-icons';

const ClipboardFilterSidebar = () => {
  const { state, dispatch } = useClipboardContext();
  const { searchFilters } = state;

  return (
    <div className='w-12 flex-shrink-0 border-r border-border'>
      <div className='h-full bg-sidebar border-r border-sidebar-border flex flex-col'>
        {/* Header */}
        <div className='p-2 border-b border-sidebar-border'>
          <TooltipButton
            tooltipContent='Reset Filter'
            tooltipSide='right'
            variant='ghost'
            size='sm'
            onClick={() => dispatch({ type: 'RESET_SEARCH_FILTERS' })}
            className='w-8 h-8 p-0 rounded flex items-center justify-center'
          >
            <RotateCcw className='h-4 w-4 text-sidebar-foreground' />
          </TooltipButton>
        </div>

        {/* Filter buttons */}
        <div className='flex-1 p-2 space-y-1'>
          {Object.entries(CLIPBOARD_CONTENT_ICONS).map(([key, config]) => {
            const Icon = config.icon;
            const isActive = searchFilters.includes(key as ClipboardContentType);

            return (
              <TooltipButton
                key={key}
                tooltipContent={config.label}
                tooltipSide='right'
                variant='ghost'
                size='sm'
                onClick={() =>
                  dispatch({
                    type: 'TOGGLE_SEARCH_FILTER',
                    payload: key as ClipboardContentType,
                  })
                }
                className={cn(
                  'w-8 h-8 p-0 rounded-md transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <Icon className='h-4 w-4' />
              </TooltipButton>
            );
          })}
        </div>

        {/* Bottom section */}
        {/* TODO: Add custom filters feature  */}

        {/*<div className="p-2 border-t border-sidebar-border space-y-1">*/}
        {/*    <TooltipButton*/}
        {/*        tooltipContent="Add Tags"*/}
        {/*        tooltipSide="right"*/}
        {/*        variant="ghost"*/}
        {/*        size="sm"*/}
        {/*        className="w-8 h-8 p-0 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"*/}
        {/*    >*/}
        {/*        <Plus className="h-4 w-4"/>*/}
        {/*    </TooltipButton>*/}
        {/*</div>*/}
      </div>
    </div>
  );
};

export default ClipboardFilterSidebar;
