
export interface MathSubTopic {
  id: string; // Unique ID for navigation
  title: string;
  formula?: string;
  explanation: string; // Short summary for the card
  fullExplanation?: string; // Detailed Feynman explanation
  realWorldAnalogy?: string; // "Like throwing a ball..."
  exampleProblem?: {
    problem: string;
    solution: string;
    steps: string[];
  };
  imageKeyword?: string;
  imageUrl?: string; // Specific URL for the topic image
}

export interface MathTopic {
  id: string;
  title: string;
  icon: string;
  content: MathSubTopic[];
}

export enum ChatRole {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  role: ChatRole;
  text: string;
  isLoading?: boolean;
}

export enum AppView {
  SYNOPSIS = 'synopsis',
  CHAT = 'chat',
  VISION = 'vision',
  QUIZ = 'quiz',
  BOARD = 'board',
  CALCULATOR = 'calculator'
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}