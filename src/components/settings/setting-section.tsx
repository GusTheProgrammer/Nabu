import { ComponentType, ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SettingSectionProps {
  icon: ComponentType<{ className?: string }>;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function SettingSection({
  icon: Icon,
  title,
  description,
  children,
  className,
}: SettingSectionProps) {
  return (
    <Card className={className}>
      <CardHeader className='pb-3'>
        <div className='flex items-center gap-2'>
          <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10'>
            <Icon className='h-4 w-4 text-primary' />
          </div>
          <div>
            <CardTitle className='text-lg'>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='pt-0 space-y-4'>{children}</CardContent>
    </Card>
  );
}
