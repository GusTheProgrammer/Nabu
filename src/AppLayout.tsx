import { Route, Routes } from 'react-router';

import Clipboard from '@/components/clipboard/clipboard';
import SettingsPage from '@/components/settings/settings-page';
import { TitleBar } from '@/components/title-bar';
import useClipboardInit from '@/hooks/use-clipboard-init';

export default function AppLayout() {
  useClipboardInit();

  return (
    <div className='flex flex-col h-screen'>
      <TitleBar />
      <main className='flex-1 overflow-hidden'>
        <Routes>
          <Route path='/' element={<Clipboard />} />
          <Route path='/settings' element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
