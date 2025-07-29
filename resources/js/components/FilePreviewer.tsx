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
    const [fileName, setFileName] = useState<string>('');
    const [fileType, setFileType] = useState<string>(''); // 'json', 'xml', 'text', 'audio', or empty
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Get the file URL, which will be the PHP stream endpoint for audio
    const fileUrl = useMemo(() => item?.download_url || item?.url, [item]);

    useEffect(() => {
        const fetchFileContent = async () => {
            if (!fileUrl) {
                setFileContent('');
                setFileName('');
                setFileType('');
                setError(null);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setFileContent('');
            setFileName(item.name || fileUrl.substring(fileUrl.lastIndexOf('/') + 1));
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
                    // For audio streams, we don't fetch content into a string.
                    // The <audio> tag will directly consume the stream from fileUrl.
                    setIsLoading(false); // Stop loading as we're ready to render the player
                    return; // Exit early
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

            } catch (e: any) {
                setError(`Failed to load file: ${e.message}`);
                toast.error("Failed to load file.", {
                    description: e.message,
                });
                setFileContent('');
                setFileName('');
                setFileType('');
            } finally {
                // Ensure loading state is reset for text/json/xml,
                // for audio it was already set to false earlier.
                if (fileType !== 'audio') { // Only set false if not already handled by audio branch
                    setIsLoading(false);
                }
            }
        };

        fetchFileContent();
    }, [item, fileUrl, fileType]); // Added fileType to dependencies to ensure `finally` block works as expected

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
                            ) : fileContent ? ( // Only render Textarea if there's fileContent (for text/json/xml)
                                <div className="relative border border-gray-300 rounded-md overflow-hidden">
                                    <Textarea
                                        value={formatContent(fileContent, fileType)}
                                        readOnly
                                        className="w-full font-mono text-sm resize-none min-h-[400px] p-4 bg-gray-50 text-gray-900 border-none focus-visible:ring-0"
                                        aria-label="File content preview"
                                        spellCheck="false"
                                    />
                                </div>
                            ) : item?.download_url && ( // Message for empty content, but only if there's a URL
                                <div className="text-gray-500 text-center py-4">
                                    No content found at the provided URL or content is empty.
                                    {fileType === 'audio' && " (Audio will attempt to stream directly.)"}
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
