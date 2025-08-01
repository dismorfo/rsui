import React, { useState, useEffect, useMemo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Toaster, toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { FilePreviewerProps } from '@/types';
import formatContent from '@/lib/formatContent';
import BasicAudioPlayer from '@/components/BasicAudioPlayer';
import BasicVideoPlayer from '@/components/BasicVideoPlayer';

const FilePreviewer: React.FC<FilePreviewerProps> = ({ item }) => {

    const [fileContent, setFileContent] = useState<string>('');
    const [fileType, setFileType] = useState<string>(''); // 'json', 'xml', 'text', 'audio', 'video', or empty
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Get the file URL, which will be the PHP stream endpoint.
    const fileUrl = useMemo(() => item?.download_url, [item]);

    useEffect(() => {
        const fetchFileContent = async () => {
            if (!fileUrl) {
                setError('A download URL was not provided.');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setFileContent('');
            setFileType('');
            setError(null);

            try {
                // Determine file type first based on mime_type
                if (item.mime_type === 'application/json') {
                    setFileType('json');
                } else if (item.mime_type === 'application/xml') {
                    setFileType('xml');
                } else if (item.mime_type?.startsWith('audio/')) {
                    setFileType('audio');
                    setIsLoading(false);
                    return;
                } else if (item.mime_type?.startsWith('video/')) {
                    setFileType('video');
                    setIsLoading(false);
                    return;
                } else {
                    // Default to 'text' for any other unknown text-like types
                    setFileType('text');
                }

                // Only fetch content for text-based files (JSON, XML, plain text)
                const response = await fetch(fileUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const content = await response.text();
                setFileContent(content);

            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : String(e);
                setError(`Failed to load file: ${message}`);
                toast.error("Failed to load file.", {
                    description: message,
                });
                setFileContent('');
                setFileType('');
            } finally {
                if (fileType !== 'audio' && fileType !== 'video') {
                    setIsLoading(false);
                }
            }
        };

        fetchFileContent();
    }, [item, fileUrl, fileType]);

    return (
        <div>
            <Card className="rounded-lg shadow-lg">
                <CardContent className="p-6">
                    {isLoading && (
                        <div className="flex items-center justify-center min-h-[200px] text-gray-500">
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                            Loading file content...
                        </div>
                    )}
                    {error && (
                        <div className="text-red-600 text-center py-4">
                            Error: {error}
                        </div>
                    )}
                    {!isLoading && !error && (
                        <>
                            {fileType === 'audio' && fileUrl ? (
                                <BasicAudioPlayer src={fileUrl} type={item?.mime_type || 'audio/mpeg'} />
                            ) : fileType === 'video' && fileUrl ? (
                                <BasicVideoPlayer src={fileUrl} type={item?.mime_type || 'video/mp4'} />
                            ) : fileContent ? (
                                <div className="relative border border-gray-300 rounded-md overflow-hidden">
                                    <Textarea
                                        value={formatContent(fileContent, fileType)}
                                        readOnly
                                        className="w-full font-mono text-sm resize-none min-h-[400px] p-4 bg-gray-50 text-gray-900 border-none focus-visible:ring-0"
                                        aria-label="File content preview"
                                        spellCheck="false"
                                    />
                                </div>
                            ) : item?.download_url && (
                                <div className="text-gray-500 text-center py-4">
                                    No content found at the provided URL or content is empty.
                                    {(fileType === 'audio' || fileType === 'video') && " (Media will attempt to stream directly.)"}
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
            <Toaster />
        </div>
    );
};

export default FilePreviewer;
