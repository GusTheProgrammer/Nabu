import '@/App.css';
import Clipboard from '@/components/clipboard/Clipboard';
import {ThemeToggle} from "@/components/theme-toggle.tsx";
import {ThemeProvider} from "@/components/theme-provider.tsx";

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <main
                className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold mb-4">Clipboardy</h1>
                <ThemeToggle/>
                <Clipboard/>
            </main>
        </ThemeProvider>
    );
}

export default App;
