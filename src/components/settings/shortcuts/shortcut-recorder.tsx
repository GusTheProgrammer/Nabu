import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { useShortcutRecorder } from '@/hooks/use-shortcut-recorder';
import { formatShortcut } from '@/util/clipboard-parser';

interface ShortcutRecorderProps {
  modifiers: string[];
  keyCode: string;
  onShortcutChange: (modifiers: string[], key: string) => Promise<void> | void;
  label?: string;
  className?: string;
}

export function ShortcutRecorder({
  modifiers,
  keyCode,
  onShortcutChange,
  label,
  className = '',
}: ShortcutRecorderProps) {
  const { isCapturing, error, startCapture } = useShortcutRecorder(onShortcutChange);

  const shortcutParts = formatShortcut(modifiers, keyCode);

  return (
    <div className={`space-y-1 ${className}`}>
      <div className='flex items-center justify-between gap-4'>
        {label && (
          <Label className='text-sm font-medium text-foreground flex-shrink-0'>{label}</Label>
        )}
        <Button
          variant='outline'
          className={`justify-center h-auto py-2 px-3 font-normal ml-auto min-w-52 ${
            isCapturing
              ? 'border-primary bg-primary/5 text-primary hover:bg-primary/10'
              : 'bg-muted/30 hover:bg-muted/50'
          }`}
          onClick={startCapture}
          type='button'
        >
          {isCapturing ? (
            <span className='text-sm text-muted-foreground whitespace-nowrap'>
              Press keys now... (ESC to cancel)
            </span>
          ) : (
            <KbdGroup>
              {shortcutParts.map((part, index) => (
                <div key={index}>
                  <Kbd>{part}</Kbd>
                  {index < shortcutParts.length - 1 && (
                    <span className='text-muted-foreground mx-1'>+</span>
                  )}
                </div>
              ))}
            </KbdGroup>
          )}
        </Button>
      </div>
      {error && <p className='text-sm text-destructive pl-0'>{error}</p>}
    </div>
  );
}
