import {getCurrentWindow} from '@tauri-apps/api/window';
import {Minus, X} from 'lucide-react';

import {ThemeToggle} from '@/components/theme-toggle';
import {Button} from "@/components/ui/button.tsx";
import Logger from "@/util/logger.ts";

export function TitleBar() {
    const minimizeWindow = async () => {
        try {
            await getCurrentWindow().minimize()
        } catch (error) {
            Logger.error("Failed to minimize window:", error);
        }
    };

    const hideWindow = async () => {
        try {
            await getCurrentWindow().hide();
        } catch (error) {
            Logger.error("Failed to hide window:", error);
        }
    };

    return (
        <div
            data-tauri-drag-region
            className="h-10 bg-background border-b flex items-center justify-between px-4 select-none"
        >
            <span className="font-medium">Clipboardy</span>

            <div className="flex-1" data-tauri-drag-region/>

            <div className="flex items-center gap-1">
                <ThemeToggle/>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-md hover:bg-muted"
                    onClick={minimizeWindow}
                    title="Minimize"
                >
                    <Minus size={16}/>
                </Button>

                <Button
                    size="icon"
                    className="h-8 w-8 rounded-md bg-transparent text-accent-foreground hover:bg-destructive hover:text-destructive-foreground"
                    onClick={hideWindow}
                    title="Close to tray"
                >
                    <X size={16}/>
                </Button>
            </div>
        </div>
    );
}