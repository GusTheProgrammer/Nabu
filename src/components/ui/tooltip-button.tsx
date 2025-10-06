import { type VariantProps } from 'class-variance-authority';
import { ComponentProps, ReactNode } from 'react';

import { Button, buttonVariants } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Kbd } from '@/components/ui/kbd';

interface TooltipButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  tooltipContent: ReactNode;
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
  tooltipAlign?: 'start' | 'center' | 'end';
  tooltipSideOffset?: number;
  asChild?: boolean;
  kbd?: string;
}

export function TooltipButton({
  tooltipContent,
  tooltipSide = 'top',
  tooltipAlign = 'center',
  tooltipSideOffset = 4,
  children,
  kbd,
  ...buttonProps
}: TooltipButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button {...buttonProps}>{children}</Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide} align={tooltipAlign} sideOffset={tooltipSideOffset}>
        <div className='flex items-center gap-2'>
          <span>{tooltipContent}</span>
          {kbd && <Kbd>{kbd}</Kbd>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

TooltipButton.displayName = 'TooltipButton';
