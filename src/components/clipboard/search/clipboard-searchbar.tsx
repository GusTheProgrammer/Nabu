import { Filter, Star, X } from 'lucide-react';
import { useMemo } from 'react';

import { Input } from '@/components/ui/input';
import { useClipboardContext } from '@/clipboard-context';
import { TooltipButton } from '@/components/ui/tooltip-button';
import { useClipboardActions } from '@/hooks/use-clipboard-actions';
import { cn } from '@/lib/utils';
import SortDropdown from '@/components/clipboard/search/sort-dropdown';

const ClipboardSearchBar = ({
  toggleFilterSidebar,
  isFilterSidebarCollapsed,
}: {
  toggleFilterSidebar: () => void;
  isFilterSidebarCollapsed: boolean | undefined;
}) => {
  const { toggleFavoritesFilter } = useClipboardActions();
  const { state, dispatch } = useClipboardContext();
  const { searchQuery, showFavoritesOnly, searchFilters } = state;
  const placeholderText = useMemo(() => {
    if (!searchFilters || searchFilters.length === 0) {
      return 'Search Clipboard...';
    }
    const filterNames = searchFilters.map(
      (filter) => filter.charAt(0).toUpperCase() + filter.slice(1)
    );
    return `Search ${filterNames.join(', ')}...`;
  }, [searchFilters]);

  return (
    <div className='p-2'>
      <div className='relative mb-1'>
        <div className='absolute left-3 top-1/2 transform -translate-y-1/2 z-10'>
          <TooltipButton
            variant='ghost'
            size='sm'
            onClick={toggleFilterSidebar}
            className={cn(
              'h-6 w-6 p-0 transition-all duration-200',
              !isFilterSidebarCollapsed && 'bg-accent text-accent-foreground'
            )}
            tooltipContent='Filter by Type'
            tooltipSide='bottom'
          >
            <Filter className='h-4 w-4' />
          </TooltipButton>
        </div>

        <Input
          placeholder={placeholderText}
          value={searchQuery}
          onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
          className='pl-10 pr-24 h-10'
        />
        <div className='absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1'>
          {searchQuery && (
            <TooltipButton
              variant='ghost'
              size='sm'
              onClick={() => dispatch({ type: 'SET_SEARCH_QUERY', payload: '' })}
              className='h-6 w-6 p-0'
              tooltipContent='Clear search'
              tooltipSide='bottom'
            >
              <X className='h-4 w-4' />
            </TooltipButton>
          )}

          <SortDropdown />

          <TooltipButton
            variant='ghost'
            size='sm'
            onClick={toggleFavoritesFilter}
            className='h-6 w-6 p-0 transition-all duration-200'
            tooltipContent='Toggle favorites'
            tooltipSide='bottom'
          >
            <Star className={cn('h-4 w-4', showFavoritesOnly ? 'fill-yellow-400' : '')} />
          </TooltipButton>
        </div>
      </div>
    </div>
  );
};

export default ClipboardSearchBar;
