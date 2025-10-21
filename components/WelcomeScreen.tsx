import React, { useState, useEffect, useRef } from 'react';
import { WelcomeIcon } from './icons';
import ChatInput from './ChatInput';
import { CSSTransition, SwitchTransition } from 'react-transition-group';

interface WelcomeScreenProps {
  onSendMessage: (message: string, image?: { mimeType: string; data: string; preview: string; }) => void;
  isLoading: boolean;
}

const carouselPhrases = [
  "🎓 أهلاً بك في المستقبل. كيف يمكنني تبسيط دراستك اليوم؟",
  "🔬 اشرح لي قاعدة أرخميدس مع مثال عملي",
  "📸 هل تعلم؟ يمكنك إرسال صورة لسؤالك وسأقوم بحله لك",
  "📚 لخص قصيدة 'أنشودة المطر' للسياب بأسلوب مبسط",
  "✨ حوّل أي موضوع معقد إلى عرض تقديمي سهل وممتع",
  "🎯 اسألني عن أي مادة: رياضيات، فيزياء، كيمياء، أحياء، أدب",
  "💡 احصل على شرح مفصل مع أمثلة وتمارين تطبيقية",
  "🚀 جاهز لمساعدتك في التفوق الدراسي على مدار الساعة",
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSendMessage, isLoading }) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const nodeRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((prevIndex) => (prevIndex + 1) % carouselPhrases.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full text-white text-center px-4 py-6 md:py-8">
      <div className="flex flex-col items-center justify-center flex-grow w-full max-w-4xl">
          {/* Icon with gradient background */}
          <div className="relative p-6 md:p-8 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 rounded-3xl mb-6 md:mb-8 animate-fade-in-down shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-white opacity-20 rounded-3xl animate-pulse"></div>
            <WelcomeIcon />
          </div>
          
          {/* Title with responsive sizing */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 animate-fade-in-down bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            مساعد السادس الإعدادي
          </h1>
          
          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-gray-400 mb-6 md:mb-8 animate-fade-in-down animate-delay-300 px-4">
            مساعدك الذكي للتفوق في جميع المواد الدراسية
          </p>
          
          {/* Carousel phrases with better height management */}
          <div className="min-h-[60px] sm:min-h-[70px] md:min-h-[80px] flex items-center justify-center animate-fade-in-down animate-delay-300 w-full px-4">
              <SwitchTransition mode="out-in">
                  <CSSTransition
                      key={phraseIndex}
                      nodeRef={nodeRef}
                      timeout={500}
                      classNames="carousel-item"
                  >
                      <p ref={nodeRef} className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 font-medium leading-relaxed max-w-3xl">
                          {carouselPhrases[phraseIndex]}
                      </p>
                  </CSSTransition>
              </SwitchTransition>
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8 w-full max-w-3xl animate-fade-in-up animate-delay-300">
            <div className="bg-[#2b2d31] rounded-xl p-3 md:p-4 hover:bg-[#373a41] transition-colors duration-300 transform hover:scale-105">
              <div className="text-2xl md:text-3xl mb-1 md:mb-2">📝</div>
              <div className="text-xs md:text-sm text-gray-400">كتابة</div>
            </div>
            <div className="bg-[#2b2d31] rounded-xl p-3 md:p-4 hover:bg-[#373a41] transition-colors duration-300 transform hover:scale-105">
              <div className="text-2xl md:text-3xl mb-1 md:mb-2">🎤</div>
              <div className="text-xs md:text-sm text-gray-400">صوت</div>
            </div>
            <div className="bg-[#2b2d31] rounded-xl p-3 md:p-4 hover:bg-[#373a41] transition-colors duration-300 transform hover:scale-105">
              <div className="text-2xl md:text-3xl mb-1 md:mb-2">📷</div>
              <div className="text-xs md:text-sm text-gray-400">صورة</div>
            </div>
            <div className="bg-[#2b2d31] rounded-xl p-3 md:p-4 hover:bg-[#373a41] transition-colors duration-300 transform hover:scale-105">
              <div className="text-2xl md:text-3xl mb-1 md:mb-2">🎯</div>
              <div className="text-xs md:text-sm text-gray-400">دقيق</div>
            </div>
          </div>
      </div>
      
      {/* Input section with better spacing */}
      <div className="w-full mt-6 md:mt-8 animate-fade-in-up">
        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} variant="welcome" />
      </div>
    </div>
  );
};

export default WelcomeScreen;
