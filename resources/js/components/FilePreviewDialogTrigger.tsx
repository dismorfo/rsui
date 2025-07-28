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

const FilePreviewDialogTrigger: React.FC<FilePreviewDialogTriggerProps> = ({ fileUrl, triggerLabel }) => {
    const [open, setOpen] = useState(false);

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
                        Displaying content from: <span className="font-mono text-sm text-gray-600 break-all">{fileUrl}</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <FilePreviewer fileUrl={fileUrl} />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FilePreviewDialogTrigger;
