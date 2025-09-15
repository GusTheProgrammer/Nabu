import React from 'react';

import ClipboardList from '@/components/clipboard/clipboard-list';
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from '@/components/ui/resizable';
import ClipboardPreview from '@/components/clipboard/preview-panel';
import ClipboardSearchBar from '@/components/clipboard/clipboard-searchbar';
import {usePanelLayout} from '@/hooks/use-panel-layout';

const Clipboard: React.FC = () => {
    const {layout, isLoaded, updateLeftPanelSize, updateRightPanelSize, setRightPanelCollapsed} = usePanelLayout();
    if (!isLoaded) {
        return <div className="h-screen bg-background"/>;
    }

    return (
        <div className="h-full bg-background">
            <ResizablePanelGroup direction="horizontal" className="h-full">
                <ResizablePanel
                    defaultSize={layout.leftPanelSize}
                    minSize={15}
                    onResize={updateLeftPanelSize}
                    className="flex flex-col"
                >
                    <ClipboardSearchBar/>
                    <ClipboardList/>
                </ResizablePanel>

                <ResizableHandle className="w-1 bg-border"/>

                <ResizablePanel
                    defaultSize={layout.rightPanelSize}
                    minSize={15}
                    maxSize={85}
                    collapsible={true}
                    onResize={updateRightPanelSize}
                    onCollapse={() => setRightPanelCollapsed(true)}
                    onExpand={() => setRightPanelCollapsed(false)}
                    className="flex flex-col"
                >
                    <ClipboardPreview/>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
};

export default Clipboard;