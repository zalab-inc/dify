'use client';

import React, { useRef, useState } from 'react';

interface FileUploadButtonProps {
    onFileContent: (content: string, fileName: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CONTENT_LENGTH = 100000; // ~100KB of text for context window
const VALID_FILE_TYPES = [
    'text/plain',
    'text/markdown',
    'application/json',
    'text/csv',
    'application/pdf',
];

const FileUploadButton: React.FC<FileUploadButtonProps> = ({ onFileContent }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showProgress, setShowProgress] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const [warning, setWarning] = useState<string | null>(null);

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const simulateProgress = () => {
        setShowProgress(true);
        setUploadProgress(0);

        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                const newProgress = prev + Math.random() * 10;
                if (newProgress >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return newProgress;
            });
        }, 100);

        return () => clearInterval(interval);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);
        setWarning(null);
        const stopSimulation = simulateProgress();

        try {
            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                setError(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit. Please upload a smaller file or split your content into multiple files.`);
                return;
            }

            // Check file type
            const isValidType = VALID_FILE_TYPES.includes(file.type) || file.name.endsWith('.md');
            if (!isValidType) {
                setError(`Unsupported file type: ${file.type || file.name.split('.').pop()}. Please upload a text, markdown, JSON, CSV, or PDF file.`);
                return;
            }

            // Read file content
            const content = await readFileContent(file);

            // Check content length for context window limitations
            if (content.length > MAX_CONTENT_LENGTH) {
                setWarning(`The file content is quite large (${(content.length / 1024).toFixed(1)}KB) and may exceed the AI's context window. The AI might not be able to process all content. Consider uploading a smaller file or asking specific questions about parts of the content.`);
            }

            // Complete the progress simulation
            setUploadProgress(100);
            setTimeout(() => {
                setShowProgress(false);
                onFileContent(content, file.name);
            }, 500);
        } catch (error) {
            console.error('Error reading file:', error);
            setError('Error reading file. Please try again with a different file or format.');
        } finally {
            setIsLoading(false);
            stopSimulation();
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const readFileContent = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                if (event.target?.result) {
                    const content = event.target.result as string;

                    try {
                        // Process based on file type
                        if (file.type === 'application/json' || file.name.endsWith('.json')) {
                            // Parse JSON and format it nicely
                            const jsonData = JSON.parse(content);
                            resolve(processJsonData(jsonData, file.name));
                        } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                            // Process CSV data
                            resolve(processCsvData(content, file.name));
                        } else if (file.type === 'application/pdf') {
                            // For PDF files, we can't easily extract text on the client side
                            // Instead, we'll just provide info about the PDF
                            resolve(`[PDF File: ${file.name}, Size: ${(file.size / 1024).toFixed(2)} KB]`);
                        } else {
                            // For text and markdown files, return as is
                            resolve(content);
                        }
                    } catch (error) {
                        console.error('Error processing file:', error);
                        reject(new Error('Error processing file content. The file may be corrupted or in an unsupported format.'));
                    }
                } else {
                    reject(new Error('Failed to read file. The file may be empty or inaccessible.'));
                }
            };

            reader.onerror = () => {
                reject(new Error('Error reading file. Please check if the file is accessible and not corrupted.'));
            };

            reader.readAsText(file);
        });
    };

    const processJsonData = (jsonData: any, fileName: string): string => {
        try {
            // Check if it's an array
            if (Array.isArray(jsonData)) {
                const itemCount = jsonData.length;

                // For large arrays, limit the sample and full content
                if (itemCount > 100) {
                    const sampleSize = Math.min(5, itemCount);
                    const sample = jsonData.slice(0, sampleSize);

                    return `JSON File: ${fileName} (Large array with ${itemCount} items)\n\nSample of first ${sampleSize} items:\n${JSON.stringify(sample, null, 2)}\n\nNote: This is a large JSON array. Only a sample is shown to avoid exceeding the AI's context window.`;
                }

                const sampleSize = Math.min(3, itemCount);
                const sample = jsonData.slice(0, sampleSize);

                return `JSON File: ${fileName} (Array with ${itemCount} items)\n\nSample of first ${sampleSize} items:\n${JSON.stringify(sample, null, 2)}\n\nFull content:\n${JSON.stringify(jsonData, null, 2)}`;
            }

            // If it's an object
            const keys = Object.keys(jsonData);

            // For large objects, limit the content
            if (JSON.stringify(jsonData).length > MAX_CONTENT_LENGTH / 2) {
                return `JSON File: ${fileName} (Large object with ${keys.length} keys: ${keys.join(', ')})\n\nThis JSON object is too large to display in full. Here are the top-level keys:\n${keys.join('\n')}\n\nPlease ask specific questions about parts of this JSON data.`;
            }

            return `JSON File: ${fileName} (Object with ${keys.length} keys: ${keys.join(', ')})\n\nContent:\n${JSON.stringify(jsonData, null, 2)}`;
        } catch (error) {
            console.error('Error processing JSON:', error);
            return JSON.stringify(jsonData, null, 2);
        }
    };

    const processCsvData = (csvContent: string, fileName: string): string => {
        try {
            // Simple CSV parsing (this could be enhanced with a CSV parsing library)
            const lines = csvContent.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(header => header.trim());

            // For large CSV files, limit the sample and content
            if (lines.length > 100 || csvContent.length > MAX_CONTENT_LENGTH / 2) {
                const sampleSize = Math.min(5, lines.length - 1);
                const sampleRows = lines.slice(1, sampleSize + 1);

                let result = `CSV File: ${fileName} (Large dataset with ${lines.length - 1} rows, ${headers.length} columns)\n\n`;
                result += `Headers: ${headers.join(', ')}\n\n`;

                if (sampleRows.length > 0) {
                    result += `Sample of first ${sampleRows.length} rows:\n`;
                    sampleRows.forEach((row, index) => {
                        const cells = row.split(',').map(cell => cell.trim());
                        result += `Row ${index + 1}: ${cells.join(', ')}\n`;
                    });
                }

                result += `\nNote: This is a large CSV file. Only a sample is shown to avoid exceeding the AI's context window. Please ask specific questions about this data.`;

                return result;
            }

            // Get a sample of rows
            const sampleSize = Math.min(5, lines.length - 1);
            const sampleRows = lines.slice(1, sampleSize + 1);

            let result = `CSV File: ${fileName} (${lines.length - 1} rows, ${headers.length} columns)\n\n`;
            result += `Headers: ${headers.join(', ')}\n\n`;

            if (sampleRows.length > 0) {
                result += `Sample of first ${sampleRows.length} rows:\n`;
                sampleRows.forEach((row, index) => {
                    const cells = row.split(',').map(cell => cell.trim());
                    result += `Row ${index + 1}: ${cells.join(', ')}\n`;
                });
            }

            result += `\nFull content:\n${csvContent}`;

            return result;
        } catch (error) {
            console.error('Error processing CSV:', error);
            return csvContent;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={handleButtonClick}
                disabled={isLoading}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Upload file"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z"
                            clipRule="evenodd"
                        />
                    </svg>
                )}
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".txt,.md,.json,.csv,.pdf"
            />

            {/* Tooltip */}
            {showTooltip && (
                <div className="absolute right-full mr-2 top-0 w-64 bg-background border border-border rounded-md p-2 shadow-md z-50">
                    <h4 className="font-medium text-sm mb-1">Upload File</h4>
                    <p className="text-xs text-muted-foreground mb-1">
                        Upload a file to analyze or reference in your conversation.
                    </p>
                    <div className="text-xs text-muted-foreground">
                        <p className="mb-1"><strong>Supported formats:</strong> TXT, MD, JSON, CSV, PDF</p>
                        <p className="mb-1"><strong>Max size:</strong> 5MB</p>
                        <p className="mb-1"><strong>Example prompts:</strong></p>
                        <ul className="list-disc pl-4 text-xs">
                            <li>Summarize this document</li>
                            <li>Extract key information from this CSV</li>
                            <li>Explain this JSON data</li>
                            <li>Answer questions based on this content</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Progress Indicator */}
            {showProgress && (
                <div className="absolute right-full mr-2 top-0 w-48 bg-background border border-border rounded-md p-2 shadow-md">
                    <div className="text-xs mb-1 flex justify-between">
                        <span>Uploading file...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                        <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Warning Message */}
            {warning && (
                <div className="absolute right-full mr-2 top-0 w-64 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-md p-2 shadow-md">
                    <p className="text-xs text-yellow-700 dark:text-yellow-500">{warning}</p>
                    <button
                        onClick={() => setWarning(null)}
                        className="absolute top-1 right-1 text-yellow-700 dark:text-yellow-500"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="absolute right-full mr-2 top-0 w-64 bg-destructive/10 border border-destructive rounded-md p-2 shadow-md">
                    <p className="text-xs text-destructive">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="absolute top-1 right-1 text-destructive"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};

export default FileUploadButton; 