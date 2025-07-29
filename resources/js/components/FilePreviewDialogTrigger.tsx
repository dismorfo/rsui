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

import FilePreviewer from '@/components/FilePreviewer';

import type { FilePreviewDialogTriggerProps } from '@/types';

const FilePreviewDialogTrigger: React.FC<FilePreviewDialogTriggerProps> = ({ item, triggerLabel }) => {

    const [open, setOpen] = useState(false);

    const displayFileUrl = item.download_url?.replace('?download=true', '').replace('/download', '');

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="link" className="text-blue-600 hover:underline p-0 h-auto">
                    {triggerLabel}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>File Previewer</DialogTitle>
                    <DialogDescription>
                        Displaying file: <span className="font-mono text-sm text-gray-600 break-all">{displayFileUrl}</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <FilePreviewer item={item} fileUrl={item.download_url} />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FilePreviewDialogTrigger;
