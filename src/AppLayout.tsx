import { Route, Routes, useNavigate } from 'react-router';

import Clipboard from '@/components/clipboard/clipboard';
import SettingsPage from '@/components/settings/settings-page';
import { TitleBar } from '@/components/title-bar';
import useClipboardInit from '@/hooks/use-clipboard-init';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { useEffect } from 'react';

export default function AppLayout() {
  const navigate = useNavigate();
  useClipboardInit();

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    listen('window-triggered-by-shortcut', () => {
      navigate('/');
    }).then((fn) => {
      unlisten = fn;
    });

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [navigate]);

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
