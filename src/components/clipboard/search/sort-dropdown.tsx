import { ArrowUpDown } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TooltipButton } from '@/components/ui/tooltip-button';
import { useClipboardContext } from '@/clipboard-context';
import { SORT_OPTIONS, SortBy, SortDirection } from '@/types/clipboard';

export default function SortDropdown() {
  const { state, dispatch } = useClipboardContext();

  const handleSortByChange = (value: string) => {
    dispatch({
      type: 'SET_SEARCH_SORT',
      payload: { sortBy: value as SortBy, sortDirection: state.sortDirection },
    });
  };

  const handleSortDirectionChange = (checked: boolean) => {
    const newDirection: SortDirection = checked ? 'ASC' : 'DESC';
    dispatch({
      type: 'SET_SEARCH_SORT',
      payload: { sortBy: state.sortBy, sortDirection: newDirection },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <TooltipButton
          variant='ghost'
          size='sm'
          className='h-6 w-6 p-0 transition-all duration-200'
          tooltipContent='Sort options'
          tooltipSide='bottom'
        >
          <ArrowUpDown className='h-4 w-4' />
        </TooltipButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={state.sortBy} onValueChange={handleSortByChange}>
          {(Object.keys(SORT_OPTIONS) as SortBy[]).map((key) => (
            <DropdownMenuRadioItem key={key} value={key}>
              {SORT_OPTIONS[key].label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={state.sortDirection === 'ASC'}
          onCheckedChange={handleSortDirectionChange}
        >
          Reverse Order
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
