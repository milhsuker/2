import React, { useState, useEffect } from 'react';
import { getAllChats, deleteChat, getStats } from '../services/storageService';

interface SidebarProps {
  onClose?: () => void;
  onLoadChat?: (chatId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, onLoadChat }) => {
  const [savedChats, setSavedChats] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalChats: 0, totalQuestions: 0, totalAnswers: 0 });

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = () => {
    const chats = getAllChats();
    setSavedChats(chats);
    setStats(getStats());
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('هل تريد حذف هذه المحادثة؟')) {
      deleteChat(chatId);
      loadChats();
    }
  };

  const handleLoadChat = (chatId: string) => {
    if (onLoadChat) {
      onLoadChat(chatId);
      if (onClose) onClose();
    }
  };
  return (
    <aside className="flex flex-col w-72 sm:w-80 lg:w-64 xl:w-72 bg-gradient-to-b from-[#2b2d31] to-[#1f2023] p-4 sm:p-5 lg:p-6 shadow-2xl h-full overflow-y-auto">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                مساعد السادس الإعدادي
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                مدعوم بـ Gemini AI
              </p>
            </div>
          </div>
          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="إغلاق القائمة"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase text-gray-500 mb-3 tracking-wider">إجراءات سريعة</h2>
        <div className="space-y-2">
          <button className="w-full text-right p-3 rounded-xl bg-[#373a41] hover:bg-[#404449] transition-all duration-200 text-sm flex items-center gap-3 group">
            <span className="text-blue-400 group-hover:scale-110 transition-transform">➕</span>
            <span>محادثة جديدة</span>
          </button>
          <button className="w-full text-right p-3 rounded-xl bg-[#373a41] hover:bg-[#404449] transition-all duration-200 text-sm flex items-center gap-3 group">
            <span className="text-purple-400 group-hover:scale-110 transition-transform">📚</span>
            <span>المواد الدراسية</span>
          </button>
          <button className="w-full text-right p-3 rounded-xl bg-[#373a41] hover:bg-[#404449] transition-all duration-200 text-sm flex items-center gap-3 group">
            <span className="text-green-400 group-hover:scale-110 transition-transform">⭐</span>
            <span>المحفوظات</span>
          </button>
        </div>
      </div>

      {/* Previous Chats Section */}
      <div className="flex-1 mb-6 overflow-y-auto">
        <h2 className="text-xs font-bold uppercase text-gray-500 mb-3 tracking-wider">المحادثات السابقة</h2>
        {savedChats.length === 0 ? (
          <div className="text-center text-gray-400 mt-8 p-4">
            <div className="mb-3 text-4xl opacity-50">💬</div>
            <p className="text-sm">لا توجد محادثات سابقة</p>
            <p className="text-xs text-gray-500 mt-2">ابدأ محادثة جديدة الآن</p>
          </div>
        ) : (
          <div className="space-y-2">
            {savedChats.slice(0, 10).map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleLoadChat(chat.id)}
                className="group p-3 bg-[#373a41] hover:bg-[#404449] rounded-lg cursor-pointer transition-all duration-200 relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{chat.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(chat.timestamp).toLocaleDateString('ar-IQ')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-400 transition-all"
                    aria-label="حذف"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="mb-6 p-4 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-xl border border-blue-500/20">
        <h3 className="text-xs font-bold uppercase text-gray-400 mb-3">الإحصائيات</h3>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">{stats.totalQuestions}</div>
            <div className="text-xs text-gray-500">أسئلة</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">{stats.totalAnswers}</div>
            <div className="text-xs text-gray-500">إجابات</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-700/50">
        <div className="text-xs text-gray-500 space-y-2">
          <div className="flex items-center justify-between">
            <span>الإصدار</span>
            <span className="text-blue-400 font-mono">v1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span>الحالة</span>
            <span className="flex items-center gap-1 text-green-400">
              <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              متصل
            </span>
          </div>
          <p className="text-center pt-2 text-gray-600">© 2024 جميع الحقوق محفوظة</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
