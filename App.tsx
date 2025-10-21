import { useState, useEffect, useRef } from 'react';
import ChatInput from './components/ChatInput';
import ChatMessage from './components/ChatMessage';
import WelcomeScreen from './components/WelcomeScreen';
import Sidebar from './components/Sidebar';
import { generateResponseStream } from './services/geminiService';
import { saveChat, getChat, downloadChat } from './services/storageService';
import { Message } from './types';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // حفظ المحادثة تلقائياً بعد كل رسالة
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      const chatId = saveChat(messages);
      if (!currentChatId) {
        setCurrentChatId(chatId);
      }
    }
  }, [messages, isLoading]);

  // اختصارات لوحة المفاتيح
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl+S: حفظ المحادثة
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (messages.length > 0) {
          downloadChat(messages);
        }
      }
      // Ctrl+N: محادثة جديدة
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        handleNewChat();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [messages]);

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
  };

  const handleLoadChat = (chatId: string) => {
    const chat = getChat(chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chatId);
    }
  };

  const handleSendMessage = async (
    text: string,
    image?: { mimeType: string; data: string; preview: string }
  ) => {
    if (isLoading || (!text.trim() && !image)) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      imagePreview: image?.preview,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: aiMessageId, sender: 'ai', text: '' }]);

    try {
      await generateResponseStream(
        text,
        image ? { mimeType: image.mimeType, data: image.data } : undefined,
        (chunk) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId ? { ...msg, text: msg.text + chunk } : msg
            )
          );
        }
      );
    } catch (error) {
        setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId ? { ...msg, text: (error as Error).message, isError: true } : msg
            )
          );
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex h-screen w-screen bg-[#303136] text-white overflow-hidden" dir="rtl" style={{ maxWidth: '100vw', maxHeight: '100vh', margin: 0, padding: 0 }}>
      {/* Toggle sidebar button - visible on all screens */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`
          fixed top-4 z-50 
          bg-gradient-to-r from-blue-600 to-purple-600 text-white 
          p-3 rounded-xl shadow-lg hover:shadow-xl 
          transform hover:scale-105 transition-all duration-200
          ${isSidebarOpen ? 'right-[280px] sm:right-[320px] lg:right-[260px] xl:right-[280px]' : 'right-4'}
        `}
        aria-label={isSidebarOpen ? "إخفاء القائمة" : "إظهار القائمة"}
        title={isSidebarOpen ? "إخفاء القائمة" : "إظهار القائمة"}
      >
        {isSidebarOpen ? (
          // X icon for close
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          // Menu icon for open
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        )}
      </button>

      {/* Overlay for mobile and tablet */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:bg-black/30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar with responsive behavior */}
      <div className={`
        fixed inset-y-0 right-0 z-40
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <Sidebar 
          onClose={() => setIsSidebarOpen(false)}
          onLoadChat={handleLoadChat}
        />
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {messages.length === 0 ? (
          <WelcomeScreen onSendMessage={handleSendMessage} isLoading={isLoading} />
        ) : (
          <>
            {/* Action buttons */}
            <div className="flex items-center justify-between p-3 sm:p-4">
              <div className="flex gap-2">
                <button
                  onClick={handleNewChat}
                  className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                  title="محادثة جديدة (Ctrl+N)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  <span className="hidden sm:inline">جديد</span>
                </button>
                <button
                  onClick={() => downloadChat(messages)}
                  className="px-3 py-2 text-sm bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
                  title="تصدير المحادثة (Ctrl+S)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span className="hidden sm:inline">تصدير</span>
                </button>
              </div>
              <div className="text-xs text-gray-400">
                {messages.length} رسالة
              </div>
            </div>

            <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
              <div className="max-w-4xl mx-auto">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </main>
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} variant="chat" />
          </>
        )}
      </div>
    </div>
  );
}

export default App;