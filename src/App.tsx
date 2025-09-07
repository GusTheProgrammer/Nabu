import '@/App.css';
import {Route, Routes} from 'react-router';

import ClipboardManager from '@/components/clipboard/clipboard-manager';
import SettingsPage from '@/components/settings/settings-page.tsx';
import {ThemeProvider} from '@/components/theme-provider';
import {TitleBar} from '@/components/title-bar';
import {ClipboardProvider} from '@/clipboard-context.tsx';

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <ClipboardProvider>
                <div className="flex flex-col h-screen">
                    <TitleBar/>
                    <main className="flex-1 overflow-auto">
                        <Routes>
                            <Route path="/" element={<ClipboardManager/>}/>
                            <Route path="/settings" element={<SettingsPage/>}/>
                        </Routes>
                    </main>
                </div>
            </ClipboardProvider>
        </ThemeProvider>
    );
}

export default App;