import '@/App.css';
import {Route, Routes} from 'react-router';

import Clipboard from '@/components/clipboard/clipboard';
import SettingsPage from '@/components/settings/settings-page';
import {ThemeProvider} from '@/components/theme-provider';
import {TitleBar} from '@/components/title-bar';
import {ClipboardProvider} from '@/clipboard-context';

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <ClipboardProvider>
                <div className="flex flex-col h-screen">
                    <TitleBar/>
                    <main className="flex-1 overflow-hidden">
                        <Routes>
                            <Route path="/" element={<Clipboard/>}/>
                            <Route path="/settings" element={<SettingsPage/>}/>
                        </Routes>
                    </main>
                </div>
            </ClipboardProvider>
        </ThemeProvider>
    );
}

export default App;