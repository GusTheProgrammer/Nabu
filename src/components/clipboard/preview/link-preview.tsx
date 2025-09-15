import {useEffect, useState} from 'react'
import {Globe} from 'lucide-react'

import type React from 'react'
import type {ClipboardEntry} from '@/types/clipboard'

import {Card, CardDescription, CardTitle} from '@/components/ui/card'
import {Skeleton} from '@/components/ui/skeleton'
import {safeInvoke} from '@/lib/utils'
import {detectSpecialTextType} from '@/util/clipboard-parser';

interface LinkPreviewProps {
    entry: ClipboardEntry
}

type UrlPreviewPayload = {
    url: string
    title: string | null
    description: string | null
    image_url: string | null
}

type LinkPreviewData = UrlPreviewPayload & {
    siteName: string
}

const LinkPreview: React.FC<LinkPreviewProps> = ({entry}) => {
    const [preview, setPreview] = useState<{
        loading: boolean
        data: LinkPreviewData | null
    }>({loading: true, data: null})

    const previewCheck = detectSpecialTextType(entry.preview || '')
    const contentCheck = detectSpecialTextType(entry.content || '')
    const url = previewCheck.type === 'link'
        ? previewCheck.value
        : contentCheck.type === 'link'
            ? contentCheck.value
            : null

    useEffect(() => {
        setPreview({loading: true, data: null})

        if (!url) {
            setPreview({loading: false, data: null})
            return
        }

        const fetchLinkPreview = async () => {
            try {
                const result = await safeInvoke<UrlPreviewPayload>('generate_url_preview', {
                    url
                })

                const data: LinkPreviewData = {
                    ...result,
                    siteName: new URL(result.url).hostname,
                }

                setPreview({loading: false, data})
            } catch (err) {
                console.error('An unexpected error occurred while fetching URL preview:', err)
                setPreview({loading: false, data: null})
            }
        }

        fetchLinkPreview()
    }, [url])

    if (preview.loading) {
        return (
            <div className="flex flex-col space-y-3 w-full h-full">
                <Skeleton className="h-64 w-full rounded-t-lg"/>
                <div className="space-y-2 p-4">
                    <Skeleton className="h-5 w-3/4"/>
                    <Skeleton className="h-4 w-full"/>
                    <Skeleton className="h-4 w-2/3"/>
                    <Skeleton className="h-3 w-1/3 mt-3"/>
                </div>
            </div>
        )
    }

    if (!preview.data?.title) {
        return (
            <a
                href={entry.content}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground text-lg font-mono break-all leading-relaxed underline hover:text-primary select-all selection:bg-accent selection:text-accent-foreground"
            >
                {entry.preview || entry.content}
            </a>
        )
    }

    const {data} = preview

    return (
        <a href={data.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full group">
            <Card
                className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.01] border-border/50 hover:border-border group-hover:bg-muted/30 h-full flex flex-col">
                {data.image_url && (
                    <div className="relative overflow-hidden flex-1 min-h-0">
                        <img
                            src={data.image_url || '/placeholder.svg'}
                            alt={data.title || 'Link preview'}
                            className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105 bg-muted/20"
                            onError={(e) => {
                                e.currentTarget.parentElement?.classList.add('hidden')
                            }}
                        />
                        <div
                            className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"/>
                    </div>
                )}

                <div className="p-4 space-y-3 flex-shrink-0">
                    <div className="space-y-2">
                        <CardTitle
                            className="text-base font-semibold line-clamp-2 leading-tight text-balance group-hover:text-primary transition-colors duration-200">
                            {data.title}
                        </CardTitle>

                        {data.description && (
                            <CardDescription className="text-sm line-clamp-2 leading-relaxed text-muted-foreground">
                                {data.description}
                            </CardDescription>
                        )}
                    </div>

                    {data.siteName && (
                        <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                            <Globe className="h-3.5 w-3.5 text-muted-foreground/70"/>
                            <span className="text-xs font-medium text-muted-foreground/90 uppercase tracking-wide">
                {data.siteName}
              </span>
                        </div>
                    )}
                </div>
            </Card>
        </a>
    )
}

export default LinkPreview;