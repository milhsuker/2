// Fix: Add TypeScript definitions for the Web Speech API to resolve compilation errors.
// The SpeechRecognition API is not part of the standard TypeScript DOM library.
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
}

interface SpeechRecognitionResult {
  readonly [index: number]: SpeechRecognitionAlternative;
  readonly length: number;
}

interface SpeechRecognitionResultList {
  readonly [index: number]: SpeechRecognitionResult;
  readonly length: number;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MicIcon } from './icons';

interface ChatInputProps {
  onSendMessage: (message: string, image?: { mimeType: string; data: string, preview: string }) => void;
  isLoading: boolean;
  variant?: 'welcome' | 'chat';
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, variant = 'welcome' }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<{ mimeType: string; data: string, preview: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'ar-SA';
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('📝 النص المسجل:', transcript);
        setText(prevText => prevText ? `${prevText} ${transcript}` : transcript);
        setIsRecording(false);
      };
      
      recognition.onerror = (event) => {
        console.error('❌ خطأ في التسجيل:', event.error);
        setIsRecording(false);
        
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          alert('❌ لم يتم السماح بالوصول للميكروفون\n\nيرجى السماح بالوصول من إعدادات المتصفح');
        } else if (event.error === 'no-speech') {
          alert('⚠️ لم يتم اكتشاف أي صوت\n\nتكلم بوضوح وجرب مرة أخرى');
        } else if (event.error === 'network') {
          alert('❌ خطأ في الاتصال\n\nتحقق من اتصال الإنترنت');
        }
      };
      
      recognition.onend = () => {
        console.log('⏹️ انتهى التسجيل');
        setIsRecording(false);
      };
      
      recognitionRef.current = recognition;
    } else {
      console.warn('⚠️ التسجيل الصوتي غير مدعوم في هذا المتصفح');
    }
  }, []);
  
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImage({
            mimeType: file.type,
            data: base64String,
            preview: URL.createObjectURL(file)
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const resetInput = () => {
    setText('');
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const handleSend = useCallback(() => {
    if ((text.trim() || image) && !isLoading) {
      onSendMessage(text, image ? { mimeType: image.mimeType, data: image.data, preview: image.preview } : undefined);
      resetInput();
    }
  }, [text, image, isLoading, onSendMessage]);
  
  const handleMicClick = async () => {
      if (!recognitionRef.current) {
        alert('❌ التسجيل الصوتي غير مدعوم\n\n✅ استخدم:\n• Chrome\n• Edge\n• Safari (iOS 14.5+)');
        return;
      }
      
      if (isRecording) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            console.error('Error stopping:', e);
          }
          setIsRecording(false);
      } else {
          try {
            // التحقق من دعم getUserMedia
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
              // إذا لم يكن مدعوماً، نحاول التسجيل مباشرة
              console.log('⚠️ getUserMedia غير مدعوم، محاولة التسجيل مباشرة...');
              recognitionRef.current.start();
              setIsRecording(true);
              return;
            }
            
            // طلب الإذن من المتصفح أولاً
            console.log('🎤 طلب إذن الوصول للميكروفون...');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('✅ تم السماح بالوصول للميكروفون');
            
            // إيقاف الـ stream لأننا لا نحتاجه (نستخدم recognition فقط)
            stream.getTracks().forEach(track => track.stop());
            
            // الآن نبدأ التسجيل
            recognitionRef.current.start();
            setIsRecording(true);
            console.log('🎤 بدأ التسجيل الصوتي');
          } catch (error: any) {
            console.error('❌ خطأ في التسجيل:', error);
            setIsRecording(false);
            
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
              alert(`❌ تم رفض الوصول للميكروفون

يرجى السماح بالوصول:

📱 موبايل:
1. اضغط القفل 🔒
2. أذونات الموقع
3. اسمح بالميكروفون
4. حدّث الصفحة

💻 كمبيوتر:
1. اضغط أيقونة الميكروفون 🎤
2. اختر "السماح"
3. حدّث الصفحة`);
            } else if (error.name === 'NotFoundError') {
              alert('❌ لم يتم العثور على ميكروفون\n\nتأكد من توصيل ميكروفون');
            } else {
              alert(`❌ حدث خطأ: ${error.message}\n\nجرب متصفح آخر`);
            }
          }
      }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };
  
  const removeImage = () => {
      setImage(null);
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  }
  
  const containerClasses = variant === 'welcome' 
    ? "w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6"
    : "bg-[#2b2d31] p-3 sm:p-4 w-full";

  return (
    <div className={containerClasses}>
      <div className="relative bg-gradient-to-br from-[#373a41] to-[#2b2d31] rounded-2xl shadow-2xl border-2 border-transparent focus-within:border-blue-500 focus-within:shadow-blue-500/50 transition-all duration-300 hover:shadow-xl">
        {image && (
            <div className="p-3 sm:p-4">
                <div className="relative inline-block group">
                    <img src={image.preview} alt="preview" className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 object-cover rounded-xl shadow-lg border-2 border-blue-500/30" />
                    <button 
                      onClick={removeImage} 
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center text-sm font-bold hover:bg-red-600 transition-all duration-200 shadow-lg transform hover:scale-110"
                    >
                      ×
                    </button>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-all duration-200"></div>
                </div>
            </div>
        )}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end p-2 sm:p-3 gap-2">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "🎤 يتم الاستماع..." : "✨ اسأل عن أي درس أو مفهوم..."}
              className="flex-1 bg-transparent p-3 sm:p-4 text-white placeholder-gray-400 focus:outline-none resize-none overflow-y-hidden max-h-32 sm:max-h-40 md:max-h-48 leading-relaxed min-h-[44px]"
              style={{ fontSize: '16px' }}
              rows={1}
              disabled={isLoading || isRecording}
            />
            <div className="flex flex-row justify-center sm:flex-row gap-2 sm:gap-2">
                {/* Image upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 sm:flex-none p-3 sm:p-3 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 disabled:opacity-50 transition-all duration-200 rounded-xl transform hover:scale-110 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  disabled={isLoading || isRecording}
                  aria-label="إرفاق صورة"
                  title="إرفاق صورة"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.49"/>
                  </svg>
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
                
                {/* Microphone button */}
                <button
                    onClick={handleMicClick}
                    disabled={isLoading}
                    className={`flex-1 sm:flex-none p-3 sm:p-3 rounded-xl transform hover:scale-110 active:scale-95 transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center ${
                      isRecording 
                        ? 'text-white bg-red-500 animate-pulse-mic shadow-lg' 
                        : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                    } disabled:opacity-50`}
                    aria-label="تسجيل صوتي"
                    title={isRecording ? "إيقاف التسجيل" : "بدء التسجيل"}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                </button>
                
                {/* Send button */}
                <button
                  onClick={handleSend}
                  disabled={isLoading || (!text.trim() && !image)}
                  className="flex-1 sm:flex-none p-3 sm:p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="إرسال"
                  title="إرسال"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
            </div>
        </div>
        
        {/* Hint text for mobile */}
        <div className="px-4 pb-3 text-xs text-gray-500 text-center sm:hidden">
          اضغط Enter للإرسال • Shift+Enter لسطر جديد
        </div>
      </div>
    </div>
  );
};

export default ChatInput;