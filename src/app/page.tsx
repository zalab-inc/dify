'use client';

import { useState, useEffect } from 'react';
import { useChat } from 'ai/react';
import { useSession, signOut } from 'next-auth/react';
import ChatDisplay from './components/ChatDisplay';
import ChatInput from './components/ChatInput';
import ChatSettings from './components/ChatSettings';
import { ThemeToggle } from './components/ThemeToggle';
import ConversationManager from './components/ConversationManager';
import ExportButton from './components/ExportButton';
import FileUploadButton from './components/FileUploadButton';
import Sidebar from './components/Sidebar';
import { UserRole } from './api/auth/[...nextauth]/route';

interface FileReference {
  name: string;
  content: string;
  uploadedAt: string;
}

export default function Home() {
  // Get session data
  const { data: session } = useSession();
  const userRole = session?.user?.role as UserRole;

  // Chat settings state
  const [temperature, setTemperature] = useState(0.7);
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConversationsOpen, setIsConversationsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileReference[]>([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Initialize chat with localStorage history if available
  const localStorageKey = 'chat-history';
  const [storedMessages, setStoredMessages] = useState<any[]>([]);

  // Load chat history from localStorage on component mount
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(localStorageKey);
      if (savedMessages) {
        setStoredMessages(JSON.parse(savedMessages));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
    setIsFirstLoad(false);
  }, []);

  // Determine API endpoint based on selected model
  const getApiEndpoint = () => {
    if (model.startsWith('claude')) {
      return '/api/claude';
    }
    return '/api/chat';
  };

  // Initialize chat with Vercel AI SDK
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    setInput,
    stop,
    reload,
  } = useChat({
    initialMessages: storedMessages,
    body: {
      temperature,
      model,
      systemPrompt,
    },
    onFinish: () => {
      // Save messages to localStorage when a response is received
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(messages));
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
      // Reset system prompt after completion
      setSystemPrompt('');
    },
    // Enable streaming for more responsive UI
    api: getApiEndpoint(),
    id: 'chat',
  });

  // Update stored messages when messages change
  useEffect(() => {
    if (!isFirstLoad && messages.length > 0) {
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(messages));
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
    }
  }, [messages, isFirstLoad]);

  // Update API endpoint when model changes
  useEffect(() => {
    // This will trigger a reload of the chat with the new API endpoint
    if (!isFirstLoad) {
      reload();
    }
  }, [model, isFirstLoad, reload]);

  // Clear chat history
  const handleClearChat = () => {
    setMessages([]);
    setUploadedFiles([]);
    localStorage.removeItem(localStorageKey);
  };

  // Handle file upload
  const handleFileContent = (content: string, fileName: string) => {
    // Add file to uploaded files
    const newFile: FileReference = {
      name: fileName,
      content,
      uploadedAt: new Date().toISOString(),
    };
    setUploadedFiles((prev) => [...prev, newFile]);

    // Create message with file content
    const fileMessage = `I've uploaded a file named "${fileName}" with the following content:\n\n${content}`;
    setInput(fileMessage);
  };

  // Load conversation with files
  const handleLoadConversation = (messages: any[], files?: FileReference[]) => {
    setMessages(messages);
    setUploadedFiles(files || []);
  };

  // Stop generating response
  const handleStopGenerating = () => {
    stop();
  };

  // Regenerate response with optional variation
  const handleRegenerateResponse = (variation?: string) => {
    if (variation) {
      setSystemPrompt(variation);
    }
    reload();
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Toggle user menu
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Handle sign out
  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = document.getElementById('export-menu');
      if (menu && !menu.contains(event.target as Node)) {
        menu.classList.add('hidden');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close regenerate variations menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if the click is outside any regenerate button or dropdown
      if (!target.closest('[data-regenerate-menu]')) {
        const regenerateButtons = document.querySelectorAll('[data-regenerate-menu]');
        regenerateButtons.forEach(button => {
          const dropdown = button.querySelector('[data-regenerate-dropdown]');
          if (dropdown) {
            dropdown.classList.add('hidden');
          }
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-user-menu]') && isUserMenuOpen) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Get model provider for display
  const getModelProvider = () => {
    if (model.startsWith('claude')) {
      return 'Anthropic';
    }
    return 'OpenAI';
  };

  // Get role display name
  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrator';
      case UserRole.ANALYST:
        return 'Analyst';
      case UserRole.USER:
      default:
        return 'User';
    }
  };

  return (
    <main className="flex h-screen flex-col bg-background text-foreground">
      <Sidebar
        currentMessages={messages}
        currentFiles={uploadedFiles}
        onLoadConversation={handleLoadConversation}
        onNewConversation={handleClearChat}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="mr-3 rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">AI Chatbot</h1>
          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            {getModelProvider()}
          </span>
        </div>
        <div className="flex space-x-2 items-center">
          <ThemeToggle />
          <FileUploadButton onFileContent={handleFileContent} />
          <ExportButton messages={messages} />
          <button
            onClick={() => setIsConversationsOpen(true)}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Conversations"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" />
              <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
            </svg>
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            onClick={handleClearChat}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Clear chat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* User menu */}
          <div className="relative" data-user-menu>
            <button
              onClick={toggleUserMenu}
              className="flex items-center rounded-full bg-primary/10 px-3 py-1.5 text-sm text-primary hover:bg-primary/20"
            >
              <span className="mr-2">{session?.user?.name}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-background shadow-lg">
                <div className="p-2">
                  <div className="mb-2 border-b border-border pb-2 text-xs text-muted-foreground">
                    Signed in as <span className="font-medium">{session?.user?.email}</span>
                  </div>
                  <div className="mb-2 text-xs text-muted-foreground">
                    Role: <span className="font-medium">{getRoleDisplayName(userRole)}</span>
                  </div>
                </div>
                <div className="border-t border-border">
                  {userRole === UserRole.ADMIN && (
                    <a
                      href="/admin"
                      className="block px-4 py-2 text-sm hover:bg-secondary"
                    >
                      Admin Dashboard
                    </a>
                  )}
                  {(userRole === UserRole.ADMIN || userRole === UserRole.ANALYST) && (
                    <a
                      href="/analytics"
                      className="block px-4 py-2 text-sm hover:bg-secondary"
                    >
                      Analytics
                    </a>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-secondary"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ChatDisplay
          messages={messages}
          isLoading={isLoading}
          onStopGenerating={handleStopGenerating}
          onRegenerateResponse={handleRegenerateResponse}
          uploadedFiles={uploadedFiles}
        />
      </div>

      <div className="border-t border-border p-4">
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>

      {isSettingsOpen && (
        <ChatSettings
          temperature={temperature}
          setTemperature={setTemperature}
          model={model}
          setModel={setModel}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isConversationsOpen && (
        <ConversationManager
          currentMessages={messages}
          currentFiles={uploadedFiles}
          onLoadConversation={handleLoadConversation}
          onNewConversation={handleClearChat}
          isOpen={isConversationsOpen}
          onClose={() => setIsConversationsOpen(false)}
        />
      )}
    </main>
  );
}
