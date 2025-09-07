'use client'

import React from 'react';
import {FileText} from 'lucide-react';

import {useClipboard} from '@/clipboard-context';

const ClipboardPreview: React.FC = () => {
    const {state} = useClipboard();
    const {selectedEntry} = state;

    if (!selectedEntry) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Select an entry to view details</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Selected Entry Content */}
            <div className="flex-[0.65] overflow-y-auto">
                <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                    <div className="text-right text-xs text-gray-400">Preview</div>
                </div>

                <div className="p-6">
                    {selectedEntry.contentType === 'image' ? (
                        <img
                            src={`data:image/png;base64,${selectedEntry.content}`}
                            alt="clipboard full preview"
                            className="rounded-lg shadow"
                        />
                    ) : (
                        <div className="text-gray-200 text-lg font-mono break-all leading-relaxed">
                            {selectedEntry.preview}
                        </div>
                    )}
                </div>
            </div>

            {/* Entry Metadata */}
            <div className="flex-[0.35] p-6 border-t border-gray-700/50 bg-gray-900/40">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Application</span>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                            <span className="text-gray-200 text-sm">{selectedEntry.metadata}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Source URL</span>
                        <span className="text-gray-200 text-sm">
              {selectedEntry.sourceUrl}
            </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Type</span>
                        <span className="text-gray-200 text-sm capitalize">
              {selectedEntry.contentType || 'Text'}
            </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Copy time</span>
                        <span className="text-gray-200 text-sm">
              {new Date(selectedEntry.lastCopiedAt).toLocaleString()}
            </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Characters</span>
                        <span className="text-gray-200 text-sm">
              {selectedEntry.preview?.length || 0}
            </span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ClipboardPreview;