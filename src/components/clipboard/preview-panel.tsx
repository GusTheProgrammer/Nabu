import {FileText} from 'lucide-react'

import type React from 'react'
import type {ReactNode} from 'react'

import {useClipboard} from '@/clipboard-context'
import {cn, formatDate, scrollbarStyles} from '@/lib/utils'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import LinkPreview from '@/components/clipboard/preview/link-preview'
import ColourPreview from '@/components/clipboard/preview/colour-preview'
import DefaultPreview from '@/components/clipboard/preview/default-review'
import ImagePreview from '@/components/clipboard/preview/image-preview'

type ValueType = string | number | null | undefined

type MetadataDetail = {
    label: string
    value: ValueType
    render?: (value: ValueType) => ReactNode
}

const ClipboardPreview: React.FC = () => {
    const {state} = useClipboard()
    const {selectedClipboardEntry} = state

    if (!selectedClipboardEntry) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select an entry to view details</p>
                </div>
            </div>
        )
    }

    const renderPreview = (() => {
        switch (selectedClipboardEntry.contentType) {
            case 'image':
                return <ImagePreview entry={selectedClipboardEntry} />
            case 'link':
                return <LinkPreview entry={selectedClipboardEntry} />
            case 'color':
                return <ColourPreview entry={selectedClipboardEntry} />
            case 'email':
                return (
                    <a
                        href={`mailto:${selectedClipboardEntry.content}`}
                        className="text-foreground text-lg font-mono break-all leading-relaxed underline hover:text-primary select-all selection:bg-accent selection:text-accent-foreground"
                    >
                        {selectedClipboardEntry.preview}
                    </a>
                )
            default:
                return <DefaultPreview entry={selectedClipboardEntry} />
        }
    })()

    const showTabs = ['html', 'rtf', 'color', 'email'].includes(selectedClipboardEntry.contentType ?? '')
    let appMetadata = selectedClipboardEntry.metadata || ''
    let imageSize: string | null = null

    if (selectedClipboardEntry.contentType === 'image' && appMetadata) {
        const sizeMatch = appMetadata.match(/(\s*\[[\d.]+\s*KB\])$/)
        if (sizeMatch) {
            imageSize = sizeMatch[1].trim()
            appMetadata = appMetadata.replace(sizeMatch[0], '').trim()
        }
    }
    if (appMetadata === '[] ()') {
        appMetadata = ''
    }

    const allDetails: MetadataDetail[] = [
        {
            label: 'Application',
            value: appMetadata,
            render: (value: ValueType) => (
                <div className="flex items-center justify-end gap-2">
                    <div className="w-4 h-4 bg-primary rounded-sm flex-shrink-0"></div>
                    <span className="text-foreground text-sm truncate select-text selection:bg-accent selection:text-accent-foreground">
                        {String(value)}
                    </span>
                </div>
            ),
        },
        {
            label: 'Source URL',
            value: selectedClipboardEntry.sourceUrl,
            render: (value: ValueType) => (
                <a
                    href={value as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground text-sm truncate block text-right underline hover:text-primary select-text selection:bg-accent selection:text-accent-foreground"
                >
                    {value}
                </a>
            ),
        },
        {
            label: 'Type',
            value: selectedClipboardEntry.contentType || 'Text',
            render: (value: ValueType) => (
                <span className="text-foreground text-sm capitalize select-text selection:bg-accent selection:text-accent-foreground">
                    {String(value)}
                </span>
            ),
        },
        {label: 'Size', value: imageSize},
        ...((selectedClipboardEntry.copyCount ?? 0) > 1
            ? ([
                {label: 'Copy Count', value: selectedClipboardEntry.copyCount},
                {
                    label: 'First Copied At',
                    value: selectedClipboardEntry.firstCopiedAt,
                    render: (value) => <span className="text-foreground text-sm">{formatDate(value)}</span>,
                },
                {
                    label: 'Last Copied At',
                    value: selectedClipboardEntry.lastCopiedAt,
                    render: (value) => <span className="text-foreground text-sm">{formatDate(value)}</span>,
                },
            ] as MetadataDetail[])
            : ([
                {
                    label: 'Copied At',
                    value: selectedClipboardEntry.firstCopiedAt,
                    render: (value) => <span className="text-foreground text-sm">{formatDate(value)}</span>,
                },
            ] as MetadataDetail[])),
        {
            label: 'Characters',
            value: selectedClipboardEntry.contentType !== 'image' ? selectedClipboardEntry.preview?.length : undefined,
        },
    ]

    const details = allDetails.filter((item) => item.value != null && item.value !== '')
    return (
        <>
            <div className={`flex-[0.65] ${scrollbarStyles} flex flex-col bg-background`}>
                {showTabs ? (
                    <Tabs defaultValue="preview" className="flex flex-col h-full w-full">
                        <div className="px-4 pt-3 border-b border-border">
                            <TabsList>
                                <TabsTrigger value="preview">Preview</TabsTrigger>
                                <TabsTrigger value="raw">Raw</TabsTrigger>
                            </TabsList>
                        </div>
                        <TabsContent
                            value="preview"
                            className={cn('flex-1 p-6 flex items-center justify-center overflow-auto mt-0', scrollbarStyles)}
                        >
                            {renderPreview}
                        </TabsContent>
                        <TabsContent value="raw" className={cn('flex-1 p-6 overflow-auto mt-0', scrollbarStyles)}>
                            <pre className="text-xs font-mono break-all whitespace-pre-wrap w-full h-full select-all selection:bg-accent selection:text-accent-foreground">
                                <code>{selectedClipboardEntry.content}</code>
                            </pre>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <>
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <div className="text-right text-xs text-muted-foreground">Preview</div>
                        </div>
                        <div className={`flex-1 p-6 flex items-center justify-center overflow-auto ${scrollbarStyles}`}>
                            {renderPreview}
                        </div>
                    </>
                )}
            </div>

            <div className={`flex-[0.35] p-6 border-t border-border bg-background/90 ${scrollbarStyles}`}>
                <div className="space-y-4">
                    {details.map(({label, value, render}) => (
                        <div key={label} className="flex justify-between items-center gap-4">
                            <span className="text-muted-foreground text-sm flex-shrink-0 select-none">{label}</span>
                            <div className="min-w-0 text-right select-all selection:bg-accent selection:text-accent-foreground">
                                {render ? (
                                    render(value)
                                ) : (
                                    <span className="text-foreground text-sm truncate">{String(value)}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default ClipboardPreview;