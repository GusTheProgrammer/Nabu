import React from 'react';

import ClipboardItems from '@/components/clipboard/clipboard-items';
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from '@/components/ui/resizable';
import {useClipboard} from '@/clipboard-context';
import ClipboardPreview from '@/components/clipboard/preview-panel.tsx';

const ClipboardManager: React.FC = () => {
    const {dispatch} = useClipboard();

    return (
        <div>
            <div className="h-[560px] bg-black">
                <ResizablePanelGroup direction="horizontal">
                    {/* Left Panel - Clipboard List */}
                    <ResizablePanel
                        defaultSize={40}
                        minSize={20}
                        className="bg-gray-900/50 border-r border-gray-700/50 flex flex-col"
                    >
                        <ClipboardItems/>
                    </ResizablePanel>

                    <ResizableHandle className="w-1 bg-gray-700/50 hover:bg-gray-600 transition-colors"/>

                    {/* Right Panel - Entry Details */}
                    <ResizablePanel
                        defaultSize={30}
                        minSize={25}
                        maxSize={50}
                        collapsible={true}
                        onCollapse={() => dispatch({type: 'SET_RIGHT_PANEL_COLLAPSED', payload: true})}
                        onExpand={() => dispatch({type: 'SET_RIGHT_PANEL_COLLAPSED', payload: false})}
                        className="bg-gray-900/30 flex flex-col"
                    >
                        <ClipboardPreview/>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
};

export default ClipboardManager;