export type IconName = 'BookIcon' | 'PaperIcon' | 'TargetIcon' | 'HeaderIcon' | 'WelcomeIcon' | 'AiIcon';

export interface Slide {
  type: 'intro' | 'step' | 'quiz' | 'summary';
  title: string;
  content: string;
  icon: IconName;
}

export interface PresentationData {
  title: string;
  slides: Slide[];
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  imagePreview?: string;
  isError?: boolean;
}