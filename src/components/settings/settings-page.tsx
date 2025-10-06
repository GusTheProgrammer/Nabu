import { ArrowLeft, Keyboard, Settings, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import clipboardDatabase from '@/lib/db';
import { scrollbarStyles } from '@/lib/utils';
import { ThemeModeToggle } from '@/components/settings/general/theme-mode-toggle';
import { SettingSection } from '@/components/settings/setting-section';
import { ThemeColorSetting } from '@/components/settings/general/theme-color-setting';
import { AutoStartToggle } from '@/components/settings/general/auto-start-toggle';
import { KeyboardNavigationShortcuts } from '@/components/settings/shortcuts/keyboard-navigation-shortcuts';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  const handleClearHistory = async () => {
    await clipboardDatabase.clearAllEntries(true);
    setIsConfirmOpen(false);
  };

  return (
    <div className={`h-screen bg-background overflow-y-auto ${scrollbarStyles}`}>
      <div className='container max-w-2xl mx-auto py-6 px-4'>
        <div className='flex items-center gap-4 mb-8'>
          <Button variant='ghost' size='icon' onClick={() => navigate('/')} title='Back'>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h1 className='text-2xl font-bold'>Settings</h1>
            <p className='text-sm text-muted-foreground'>Manage your app preferences</p>
          </div>
        </div>

        <div className='space-y-6'>
          <SettingSection
            icon={Settings}
            title='General'
            description='Basic app settings and preferences'
          >
            <ThemeColorSetting />
            <ThemeModeToggle />
            <AutoStartToggle />
          </SettingSection>

          <SettingSection
            icon={Keyboard}
            title='Shortcuts'
            description='Configure keyboard shortcuts for launch, navigation and actions'
          >
            <KeyboardNavigationShortcuts />
          </SettingSection>

          <SettingSection
            icon={Trash2}
            title='History'
            description='Permanently delete all clipboard history'
            className='mb-20'
          >
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
              <DialogTrigger asChild>
                <Button variant='destructive' className='w-full'>
                  Clear History
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your entire clipboard
                    history.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant='outline'>Cancel</Button>
                  </DialogClose>
                  <Button variant='destructive' onClick={handleClearHistory}>
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </SettingSection>
        </div>
      </div>
    </div>
  );
}
