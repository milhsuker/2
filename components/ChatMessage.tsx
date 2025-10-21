import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, PresentationData } from '../types';
import { UserIcon, AiIcon } from './icons';
import PresentationView from './PresentationView';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const bubbleClasses = isUser
    ? 'bg-gradient-to-br from-[#373a41] to-[#2b2d31] rounded-br-none border border-gray-700/50'
    : `bg-gradient-to-br from-[#2b2d31] to-[#1f2023] rounded-bl-none border border-gray-700/50 ${message.isError ? 'text-red-400 border-red-500/30' : 'text-right'}`;
  const containerClasses = isUser ? 'justify-end' : 'justify-start';
  const isLoading = message.sender === 'ai' && message.text === '';

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2 py-2">
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0ms'}}></span>
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '150ms'}}></span>
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '300ms'}}></span>
          <span className="text-xs sm:text-sm text-gray-400 mr-2">جاري التفكير...</span>
        </div>
      );
    }
    
    if(isUser) {
        return (
             <>
                {message.imagePreview && (
                  <img 
                    src={message.imagePreview} 
                    alt="Attachment" 
                    className="max-w-[200px] sm:max-w-xs md:max-w-sm rounded-xl mb-2 shadow-lg transition-all duration-300 cursor-pointer hover:scale-105" 
                  />
                )}
                <p className="text-white whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{message.text}</p>
             </>
        )
    }

    if (message.isError) {
        return <p>{message.text}</p>
    }

    // Try to parse the message text as JSON for presentation view
    try {
      // Clean the text from markdown code blocks if Gemini wraps the JSON
      const cleanedText = message.text.replace(/^```json\n|```$/g, '');
      const presentationData: PresentationData = JSON.parse(cleanedText);
      if (presentationData && presentationData.slides && presentationData.title) {
        return <PresentationView data={presentationData} />;
      }
    } catch (error) {
      // Not a valid JSON, so render as Markdown
    }
    
    // Fallback to Markdown rendering
    return (
       <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-xl sm:text-2xl md:text-3xl font-bold my-3 sm:my-4 border-b-2 pb-2 border-blue-500/50" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-lg sm:text-xl md:text-2xl font-bold my-2 sm:my-3 border-b pb-1 border-purple-500/50" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-base sm:text-lg md:text-xl font-bold my-2" {...props} />,
          p: ({node, ...props}) => <p className="my-2 leading-relaxed text-sm sm:text-base" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-inside my-2 pr-4 space-y-1 text-sm sm:text-base" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-inside my-2 pr-4 space-y-1 text-sm sm:text-base" {...props} />,
          li: ({node, ...props}) => <li className="my-1 leading-relaxed" {...props} />,
          code: ({node, inline, className, children, ...props}) => {
            const match = /language-(\w+)/.exec(className || '')
            return !inline ? (
              <div className="bg-[#1e1f22] rounded-xl my-3 text-left shadow-lg border border-gray-700/50 overflow-hidden">
                <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-900 to-gray-800">
                   <span className="text-xs sm:text-sm text-blue-400 font-mono">{match ? match[1] : 'code'}</span>
                   <button 
                     onClick={() => navigator.clipboard.writeText(String(children))} 
                     className="text-xs sm:text-sm text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 px-2 sm:px-3 py-1 rounded-md transition-colors duration-200"
                   >
                     📋 نسخ
                   </button>
                </div>
                <pre className="p-3 sm:p-4 overflow-x-auto"><code className={`text-xs sm:text-sm ${className}`} {...props}>{children}</code></pre>
              </div>
            ) : (
              <code className="bg-blue-500/20 text-blue-300 rounded-md px-1.5 py-0.5 text-xs sm:text-sm font-mono border border-blue-500/30" {...props}>{children}</code>
            )
          },
          table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="table-auto w-full border-collapse border-2 border-gray-600 rounded-lg overflow-hidden shadow-lg" {...props} /></div>,
          thead: ({node, ...props}) => <thead className="bg-gradient-to-r from-blue-600/30 to-purple-600/30" {...props} />,
          th: ({node, ...props}) => <th className="border border-gray-600 px-3 sm:px-4 py-2 text-right font-bold text-sm sm:text-base" {...props} />,
          td: ({node, ...props}) => <td className="border border-gray-600 px-3 sm:px-4 py-2 text-sm sm:text-base" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-r-4 border-blue-500 pr-4 my-3 italic text-gray-300 bg-blue-500/10 py-2 rounded-r-lg" {...props} />,
          a: ({node, ...props}) => <a className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200" target="_blank" rel="noopener noreferrer" {...props} />,
        }}
      >
        {message.text}
      </ReactMarkdown>
    );
  };

  return (
    <div className={`flex items-end gap-2 sm:gap-3 my-3 sm:my-4 animate-fade-in ${containerClasses} px-2 sm:px-0`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-200">
          <AiIcon />
        </div>
      )}
      <div
        className={`max-w-[85%] sm:max-w-xl md:max-w-2xl lg:max-w-3xl w-fit p-3 sm:p-4 md:p-5 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 ${bubbleClasses}`}
      >
        {renderContent()}
      </div>
       {isUser && (
        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-200">
          <UserIcon />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;