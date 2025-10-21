import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PresentationData, IconName } from '../types';
import { Icons } from './icons';

interface PresentationViewProps {
  data: PresentationData;
}

const PresentationView: React.FC<PresentationViewProps> = ({ data }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToNextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, data.slides.length - 1));
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const slide = data.slides[currentSlide];
  const IconComponent = Icons[slide.icon as IconName] || Icons['BookIcon'];

  return (
    <div className="bg-[#373a41] p-6 rounded-lg shadow-lg text-white text-right w-full">
      <h2 className="text-2xl font-bold mb-4 text-center">{data.title}</h2>
      
      <div className="bg-[#2b2d31] p-4 rounded-md min-h-[200px] flex flex-col justify-center">
        <div className="flex items-center justify-end gap-3 mb-3">
            <h3 className="text-xl font-semibold">{slide.title}</h3>
            <span className="text-blue-400"><IconComponent /></span>
        </div>
        <div className="prose prose-invert prose-p:text-right prose-ul:text-right prose-ol:text-right text-white max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{slide.content}</ReactMarkdown>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={goToPrevSlide}
          disabled={currentSlide === 0}
          className="px-4 py-2 bg-blue-600 rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          السابق
        </button>
        <span className="text-sm text-gray-400">
          {currentSlide + 1} / {data.slides.length}
        </span>
        <button
          onClick={goToNextSlide}
          disabled={currentSlide === data.slides.length - 1}
          className="px-4 py-2 bg-blue-600 rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          التالي
        </button>
      </div>
    </div>
  );
};

export default PresentationView;
