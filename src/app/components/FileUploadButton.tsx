'use client';

import React, { useRef, useState } from 'react';

interface FileUploadButtonProps {
    onFileContent: (content: string, fileName: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
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
        const stopSimulation = simulateProgress();

        try {
            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                setError(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
                return;
            }

            // Check file type
            const isValidType = VALID_FILE_TYPES.includes(file.type) || file.name.endsWith('.md');
            if (!isValidType) {
                setError('Unsupported file type. Please upload a text, markdown, JSON, CSV, or PDF file.');
                return;
            }

            // Read file content
            const content = await readFileContent(file);

            // Complete the progress simulation
            setUploadProgress(100);
            setTimeout(() => {
                setShowProgress(false);
                onFileContent(content, file.name);
            }, 500);
        } catch (error) {
            console.error('Error reading file:', error);
            setError('Error reading file. Please try again.');
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
                        reject(new Error('Error processing file content'));
                    }
                } else {
                    reject(new Error('Failed to read file'));
                }
            };

            reader.onerror = () => {
                reject(new Error('Error reading file'));
            };

            reader.readAsText(file);
        });
    };

    const processJsonData = (jsonData: any, fileName: string): string => {
        try {
            // Check if it's an array
            if (Array.isArray(jsonData)) {
                const itemCount = jsonData.length;
                const sampleSize = Math.min(3, itemCount);
                const sample = jsonData.slice(0, sampleSize);

                return `JSON File: ${fileName} (Array with ${itemCount} items)\n\nSample of first ${sampleSize} items:\n${JSON.stringify(sample, null, 2)}\n\nFull content:\n${JSON.stringify(jsonData, null, 2)}`;
            }

            // If it's an object
            const keys = Object.keys(jsonData);
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

            {/* Error Message */}
            {error && (
                <div className="absolute right-full mr-2 top-0 w-48 bg-destructive/10 border border-destructive rounded-md p-2 shadow-md">
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