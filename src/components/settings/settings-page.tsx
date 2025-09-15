import {ArrowLeft, Keyboard, Power, Settings, Trash2} from 'lucide-react'
import {useNavigate} from 'react-router';
import {useEffect, useState} from 'react';
import {disable, enable, isEnabled} from '@tauri-apps/plugin-autostart';

import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Switch} from '@/components/ui/switch'
import {ThemeToggle} from '@/components/theme-toggle'
import {ToggleShortcut} from '@/components/settings/toggle-shortcut'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog'
import clipboardDatabase from '@/lib/db'
import {DEFAULT_AUTO_START, SETTING_KEYS} from '@/types/settings'
import {scrollbarStyles} from '@/lib/utils';

export default function SettingsPage() {
    const navigate = useNavigate();
    const [autoStart, setAutoStart] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    useEffect(() => {
        const loadAutoStartSetting = async () => {
            const setting = await clipboardDatabase.getSetting(SETTING_KEYS?.AUTO_START, DEFAULT_AUTO_START);
            const systemEnabled = await isEnabled();
            setAutoStart(setting && systemEnabled);
            setIsLoading(false);
        };

        loadAutoStartSetting();
    }, []);

    const handleAutoStartToggle = async (checked: boolean) => {
        try {
            if (checked) {
                await enable();
            } else {
                await disable();
            }

            await clipboardDatabase.setSetting(SETTING_KEYS.AUTO_START, checked);
            setAutoStart(checked);
        } catch (error) {
            console.error('Failed to toggle autostart:', error);
        }
    };

    const handleClearHistory = async () => {
        await clipboardDatabase.clearAllEntries(true);
        setIsConfirmOpen(false);
    }

    return (
        <div className={`h-screen bg-background overflow-y-auto ${scrollbarStyles}`}>
            <div className="container max-w-2xl mx-auto py-6 px-4">
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/')} title="Back">
                        <ArrowLeft className="h-4 w-4"/>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Settings</h1>
                        <p className="text-sm text-muted-foreground">Manage your app preferences</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                                    <Settings className="h-4 w-4 text-primary"/>
                                </div>
                                <div>
                                    <CardTitle className="text-lg">General</CardTitle>
                                    <CardDescription>Basic app settings and preferences</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-4">
                            <ThemeToggle/>

                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                                        <Power className="h-4 w-4 text-muted-foreground"/>
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">Auto Start</div>
                                        <div className="text-xs text-muted-foreground">Start with system on boot</div>
                                    </div>
                                </div>
                                {isLoading ? (
                                    <div className="h-6 w-10 bg-gray-200 rounded-full animate-pulse"/>
                                ) : (
                                    <Switch
                                        checked={autoStart}
                                        onCheckedChange={handleAutoStartToggle}
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                                    <Keyboard className="h-4 w-4 text-primary"/>
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Shortcut</CardTitle>
                                    <CardDescription>Configure default keyboard shortcut for launching
                                        Clipboardy</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <ToggleShortcut/>
                        </CardContent>
                    </Card>

                    <Card className='mb-20'>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                                    <Trash2 className="h-4 w-4 text-primary"/>
                                </div>
                                <div>
                                    <CardTitle className="text-lg">History</CardTitle>
                                    <CardDescription>Permanently delete all clipboard history</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        className="w-full"
                                    >
                                        Clear History
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                                        <DialogDescription>
                                            This action cannot be undone. This will permanently delete your entire clipboard history.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button
                                            variant="destructive"
                                            onClick={handleClearHistory}
                                        >
                                            Confirm
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}