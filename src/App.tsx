import '@/App.css';
import ClipboardManager from "@/components/clipboard/clipboard-manager.tsx";
import {ThemeToggle} from "@/components/theme-toggle.tsx";
import {ThemeProvider} from "@/components/theme-provider.tsx";

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <main>
                <ClipboardManager/>
            </main>
        </ThemeProvider>
    );
}

export default App;
