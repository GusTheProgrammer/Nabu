import {ArrowLeft, Keyboard, Palette} from 'lucide-react'
import {useNavigate} from 'react-router';

import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {ThemeToggle} from '@/components/theme-toggle'
import {ToggleShortcut} from '@/components/settings/toggle-shortcut'

export default function SettingsPage() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-background">
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
                                    <Palette className="h-4 w-4 text-primary"/>
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Appearance</CardTitle>
                                    <CardDescription>Customize the look and feel</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <ThemeToggle/>
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
                </div>
            </div>
        </div>
    )
}
