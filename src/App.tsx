import '@/App.css';
import ClipboardManager from "@/components/clipboard/clipboard-manager";
import {ThemeProvider} from "@/components/theme-provider";
import {TitleBar} from "@/components/title-bar";

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div className="flex flex-col h-screen">
                <TitleBar/>
                <main className="flex-1 overflow-auto">
                    <ClipboardManager/>
                </main>
            </div>
        </ThemeProvider>
    );
}

export default App;