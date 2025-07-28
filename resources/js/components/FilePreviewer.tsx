import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Toaster, toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { FilePreviewerProps } from '@/types';

const FilePreviewer: React.FC<FilePreviewerProps> = ({ fileUrl }) => {
    const [fileContent, setFileContent] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');
    // we need to add mime/type to RSBE so that we can determine the file type and stream it accordingly
    const [fileType, setFileType] = useState<string>(''); // Can be 'json', 'xml', 'text', or empty
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);


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
            setFileName(fileUrl.substring(fileUrl.lastIndexOf('/') + 1) || 'Streamed File'); // Derive file name from URL
            setFileType('');
            setError(null);

            try {
                const response = await fetch(fileUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const content = await response.text();
                setFileContent(content);

                // Attempt to determine file type based on content
                if (fileUrl.endsWith('.json') || isJson(content)) {
                    setFileType('json');
                } else if (fileUrl.endsWith('.xml') || isXml(content)) {
                    setFileType('xml');
                } else {
                    setFileType('text'); // Default to plain text if not clearly JSON or XML
                    toast.info("Unknown File Type", {
                        description: "Content displayed as plain text.",
                    });
                }
            } catch (e: any) {
                setError(`Failed to load file: ${e.message}`);
                toast.error("Failed to load file.", {
                    description: e.message,
                });
                setFileContent('');
                setFileName('');
                setFileType('');
            } finally {
                setIsLoading(false);
            }
        };

        fetchFileContent();
    }, [fileUrl]); // Re-run effect when fileUrl changes

    /**
     * Checks if a given string is valid JSON.
     * @param str The string to check.
     * @returns True if the string is valid JSON, false otherwise.
     */
    const isJson = (str: string): boolean => {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    };

    /**
     * Checks if a given string appears to be XML.
     * This is a basic check and might not cover all valid XML cases or differentiate from HTML.
     * @param str The string to check.
     * @returns True if the string appears to be XML, false otherwise.
     */
    const isXml = (str: string): boolean => {
        const trimmedStr = str.trim();
        // Basic check for XML declaration or root element start/end tags
        return trimmedStr.startsWith('<') && trimmedStr.endsWith('>') && (trimmedStr.includes('<?xml') || trimmedStr.includes('<root') || trimmedStr.includes('<data'));
    };

    /**
     * Formats the content based on its detected type (JSON or XML) for better readability.
     * @param content The raw string content of the file.
     * @param type The detected type of the file ('json', 'xml', or 'text').
     * @returns The formatted string content, or the original content if formatting fails.
     */
    const formatContent = (content: string, type: string): string => {
        if (!content) return '';

        try {
            if (type === 'json') {
                // Pretty-print JSON with 2-space indentation
                return JSON.stringify(JSON.parse(content), null, 2);
            } else if (type === 'xml') {
                const parser = new DOMParser();
                // Parse the XML string into a DOM document
                const xmlDoc = parser.parseFromString(content, 'application/xml');

                // Check for parsing errors in the XML document
                const errorNode = xmlDoc.querySelector('parsererror');
                if (errorNode) {
                    // If a parser error is found, throw an error with its content
                    throw new Error(`XML Parsing Error: ${errorNode.textContent}`);
                }

                const serializer = new XMLSerializer();

                // Serialize the XML DOM back to a string
                const formattedXml = serializer.serializeToString(xmlDoc);

                // Simple indentation logic for XML (can be improved with a dedicated formatter)
                let indent = '';
                let result = '';
                formattedXml.split(/>\s*</).forEach((node: string) => {
                    if (node.match(/^\/\w/)) { // If it's a closing tag (e.g., /tag)
                        indent = indent.substring(2); // Decrease indent
                    }
                    result += indent + '<' + node + '>\r\n'; // Add indented tag
                    if (node.match(/^<?\w[^>]*[^\/]$/) && !node.endsWith('/>')) { // If it's an opening tag and not self-closing
                        indent += '  '; // Increase indent
                    }
                });
                return result.trim(); // Return the trimmed formatted XML

            }
        } catch (e: any) { // Catch any errors during parsing or formatting
            toast.error(`Error formatting ${type}.`, {
                description: e.message, // Display the error message
            });
            return content; // Return original content if formatting fails
        }
        return content; // Return original content for 'text' type or if no specific formatting is applied
    };

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
                    {!isLoading && !error && fileContent && (
                            <div className="relative border border-gray-300 rounded-md overflow-hidden">
                                <Textarea
                                    value={formatContent(fileContent, fileType)}
                                    readOnly
                                    className="w-full font-mono text-sm resize-none min-h-[400px] p-4 bg-gray-50 text-gray-900 border-none focus-visible:ring-0"
                                    aria-label="File content preview"
                                    spellCheck="false" // Disable spell check for code/structured text
                                />
                            </div>
                    )}
                    {!isLoading && !error && !fileContent && fileUrl && (
                        <div className="text-gray-500 text-center py-4">
                            No content found at the provided URL or content is empty.
                        </div>
                    )}
                </CardContent>
            </Card>
            <Toaster />
        </div>
    );
};

export default FilePreviewer;
