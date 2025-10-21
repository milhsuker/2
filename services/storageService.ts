// خدمة حفظ المحادثات في Local Storage
// تم التحديث: 2024-12-21

import { Message } from '../types';

const STORAGE_KEY = 'education_platform_chats';
const MAX_CHATS = 50; // الحد الأقصى للمحادثات المحفوظة

interface SavedChat {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

// حفظ محادثة جديدة
export function saveChat(messages: Message[]): string {
  if (messages.length === 0) return '';
  
  const chats = getAllChats();
  const chatId = Date.now().toString();
  
  // استخراج عنوان من أول رسالة للمستخدم
  const firstUserMessage = messages.find(m => m.sender === 'user');
  const title = firstUserMessage?.text.slice(0, 50) || 'محادثة جديدة';
  
  const newChat: SavedChat = {
    id: chatId,
    title,
    messages,
    timestamp: Date.now()
  };
  
  // إضافة المحادثة الجديدة في البداية
  chats.unshift(newChat);
  
  // الاحتفاظ بآخر MAX_CHATS محادثة فقط
  const limitedChats = chats.slice(0, MAX_CHATS);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedChats));
  return chatId;
}

// جلب جميع المحادثات
export function getAllChats(): SavedChat[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading chats:', error);
    return [];
  }
}

// جلب محادثة محددة
export function getChat(chatId: string): SavedChat | null {
  const chats = getAllChats();
  return chats.find(chat => chat.id === chatId) || null;
}

// حذف محادثة
export function deleteChat(chatId: string): void {
  const chats = getAllChats();
  const filtered = chats.filter(chat => chat.id !== chatId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

// حذف جميع المحادثات
export function clearAllChats(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// تصدير محادثة كنص
export function exportChatAsText(messages: Message[]): string {
  let text = '═══════════════════════════════════════\n';
  text += '       المنصة التعليمية الذكية\n';
  text += '═══════════════════════════════════════\n\n';
  
  messages.forEach((msg, index) => {
    const sender = msg.sender === 'user' ? '👤 أنت' : '🤖 المساعد';
    text += `${sender}:\n`;
    text += `${msg.text}\n`;
    
    if (msg.imagePreview) {
      text += `[صورة مرفقة]\n`;
    }
    
    if (index < messages.length - 1) {
      text += '\n---\n\n';
    }
  });
  
  text += '\n═══════════════════════════════════════\n';
  text += `تاريخ التصدير: ${new Date().toLocaleString('ar-IQ')}\n`;
  text += '═══════════════════════════════════════\n';
  
  return text;
}

// تنزيل محادثة كملف
export function downloadChat(messages: Message[], filename?: string): void {
  const text = exportChatAsText(messages);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `محادثة_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// تصدير جميع المحادثات
export function exportAllChats(): void {
  const chats = getAllChats();
  
  let text = '═══════════════════════════════════════\n';
  text += '    جميع المحادثات المحفوظة\n';
  text += '═══════════════════════════════════════\n\n';
  
  chats.forEach((chat, index) => {
    text += `\n📝 محادثة ${index + 1}: ${chat.title}\n`;
    text += `📅 التاريخ: ${new Date(chat.timestamp).toLocaleString('ar-IQ')}\n`;
    text += `💬 عدد الرسائل: ${chat.messages.length}\n\n`;
    text += exportChatAsText(chat.messages);
    text += '\n\n';
  });
  
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `جميع_المحادثات_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// الحصول على إحصائيات
export function getStats() {
  const chats = getAllChats();
  const totalMessages = chats.reduce((sum, chat) => sum + chat.messages.length, 0);
  const totalQuestions = chats.reduce((sum, chat) => 
    sum + chat.messages.filter(m => m.sender === 'user').length, 0
  );
  
  return {
    totalChats: chats.length,
    totalMessages,
    totalQuestions,
    totalAnswers: totalMessages - totalQuestions
  };
}
