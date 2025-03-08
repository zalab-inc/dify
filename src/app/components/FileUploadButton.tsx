'use client';

import React, { useRef, useState } from 'react';

interface FileUploadButtonProps {
    onFileContent: (content: string, fileName: string) => void;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({ onFileContent }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);

        try {
            // Check file size (limit to 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size exceeds 5MB limit');
                return;
            }

            // Check file type
            const validTypes = [
                'text/plain',
                'text/markdown',
                'application/json',
                'text/csv',
                'application/pdf',
            ];

            if (!validTypes.includes(file.type) && !file.name.endsWith('.md')) {
                alert('Unsupported file type. Please upload a text, markdown, JSON, CSV, or PDF file.');
                return;
            }

            // Read file content
            const content = await readFileContent(file);
            onFileContent(content, file.name);
        } catch (error) {
            console.error('Error reading file:', error);
            alert('Error reading file. Please try again.');
        } finally {
            setIsLoading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const readFileContent = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                if (event.target?.result) {
                    resolve(event.target.result as string);
                } else {
                    reject(new Error('Failed to read file'));
                }
            };

            reader.onerror = () => {
                reject(new Error('Error reading file'));
            };

            if (file.type === 'application/pdf') {
                // For PDF files, we can't easily extract text on the client side
                // Instead, we'll just provide info about the PDF
                resolve(`[PDF File: ${file.name}, Size: ${(file.size / 1024).toFixed(2)} KB]`);
            } else {
                reader.readAsText(file);
            }
        });
    };

    return (
        <>
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
        </>
    );
};

export default FileUploadButton; 