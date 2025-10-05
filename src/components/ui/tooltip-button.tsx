import { type VariantProps } from 'class-variance-authority';
import React from 'react';

import { Button, buttonVariants } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TooltipButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  tooltipContent: React.ReactNode;
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
  tooltipAlign?: 'start' | 'center' | 'end';
  tooltipSideOffset?: number;
  asChild?: boolean;
}

export function TooltipButton({
  tooltipContent,
  tooltipSide = 'top',
  tooltipAlign = 'center',
  tooltipSideOffset = 4,
  children,
  ...buttonProps
}: TooltipButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button {...buttonProps}>{children}</Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide} align={tooltipAlign} sideOffset={tooltipSideOffset}>
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  );
}

TooltipButton.displayName = 'TooltipButton';
