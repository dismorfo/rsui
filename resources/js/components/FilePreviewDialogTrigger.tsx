import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

import type { FileItem } from '@/types';

import FilePreviewer from '@/components/FilePreviewer';

import type { FilePreviewDialogTriggerProps } from '@/types';

const FilePreviewDialogTrigger: React.FC<FilePreviewDialogTriggerProps> = ({ item, triggerLabel }) => {

    const [open, setOpen] = useState(false);

    const isDownloadable = (item: FileItem) =>
      item.object_type === 'file' &&
      item.size !== undefined &&
      item.size < 2 * 1024 * 1024 * 1024; // Less than 2GB

    const url = item.preview_url;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button asChild variant="link" className="cursor-pointer hover:underline p-0 h-auto">
                    <a href={url} target="_blank" rel="noopener noreferrer" onClick={(e) => {
                        if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                            e.preventDefault();
                            setOpen(true);
                        }
                    }}>
                        {triggerLabel}
                    </a>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>File Previewer</DialogTitle>
                    <DialogDescription>
                        {isDownloadable(item) && item.download_url ? (
                          <span>Displaying file: <span><a href={item.download_url} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{item.name}</a></span></span>
                        ) : (
                          <span>Displaying file: <span className="font-mono text-sm text-gray-600 break-all">{item.name}</span></span>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <FilePreviewer item={item} />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FilePreviewDialogTrigger;
