import React from 'react';

import ClipboardItems from '@/components/clipboard/clipboard-items';
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from '@/components/ui/resizable';
import ClipboardPreview from '@/components/clipboard/preview-panel';
import {usePanelLayout} from '@/hooks/use-panel-layout';

const ClipboardManager: React.FC = () => {
    const {layout, isLoaded, updateLeftPanelSize, updateRightPanelSize, setRightPanelCollapsed} = usePanelLayout();
    if (!isLoaded) {
        return <div className="h-[560px] bg-black" />;
    }

    return (
        <div>
            <div className="h-[560px] bg-black">
                <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel
                        defaultSize={layout.leftPanelSize}
                        minSize={20}
                        onResize={updateLeftPanelSize}
                        className="bg-gray-900/50 border-r border-gray-700/50 flex flex-col"
                    >
                        <ClipboardItems/>
                    </ResizablePanel>

                    <ResizableHandle className="w-1 bg-gray-700/50 hover:bg-gray-600 transition-colors"/>

                    <ResizablePanel
                        defaultSize={layout.rightPanelSize}
                        minSize={25}
                        maxSize={50}
                        collapsible={true}
                        onResize={updateRightPanelSize}
                        onCollapse={() => setRightPanelCollapsed(true)}
                        onExpand={() => setRightPanelCollapsed(false)}
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