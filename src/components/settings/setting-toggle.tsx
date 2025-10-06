import { LucideIcon } from 'lucide-react';

import { Switch } from '@/components/ui/switch';

interface SettingToggleProps {
  icon: LucideIcon;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function SettingToggle({
  icon: Icon,
  title,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}: SettingToggleProps) {
  return (
    <div className='flex items-center justify-between py-2'>
      <div className='flex items-center gap-3'>
        <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-muted'>
          <Icon className='h-4 w-4 text-muted-foreground' />
        </div>
        <div>
          <div className='font-medium text-sm'>{title}</div>
          <div className='text-xs text-muted-foreground'>{description}</div>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}
