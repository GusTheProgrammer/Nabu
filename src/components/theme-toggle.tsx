import {Moon, Sun} from 'lucide-react';

import {Switch} from '@/components/ui/switch';
import {useTheme} from '@/components/theme-provider';

export function ThemeToggle() {
    const {theme, setTheme} = useTheme();
    return (
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                    <Sun className="h-4 w-4 text-muted-foreground dark:hidden"/>
                    <Moon className="hidden h-4 w-4 text-muted-foreground dark:block"/>
                </div>
                <div>
                    <div className="font-medium text-sm">Dark Mode</div>
                    <div className="text-xs text-muted-foreground">Switch between light and dark themes</div>
                </div>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}/>
        </div>
    )
}
