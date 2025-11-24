
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
  CALCULATOR = 'calculator',
  MOBILE_CONNECT = 'mobile_connect',
  NATIONAL_EXAM = 'national_exam',
  GEOMETRY = 'geometry',
  FUNCTION_MACHINE = 'function_machine',
  PYTHAGORAS_MACHINE = 'pythagoras_machine',
  UNIT_CIRCLE_MACHINE = 'unit_circle_machine',
  TRIANGLE_MACHINE = 'triangle_machine',
  NUMBER_MACHINE = 'number_machine',
  STATS_MACHINE = 'stats_machine',
  PROBABILITY_MACHINE = 'probability_machine',
  MATRIX_MACHINE = 'matrix_machine',
  QUOTES_GALLERY = 'quotes_gallery',
  AI_DISCUSSION = 'ai_discussion'
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  hint?: string; // Added hint field
}

export interface QuizResult {
  id: string;
  topic: string;
  score: number;
  total: number;
  date: string;
}

export type QuestionType = 'mc' | 'open';

export interface ExamQuestion {
  id: number;
  text: string;
  type: QuestionType;
  points: number;
  options?: string[]; // For MC
  correctAnswer?: string; // For MC (index or text)
  rubric?: string; // For AI grading guidance on Open questions
}

export interface ExamResult {
  totalScore: number;
  maxScore: number;
  details: {
    questionId: number;
    userAnswer: string;
    score: number;
    maxPoints: number;
    feedback?: string;
  }[];
}

// --- GAMIFICATION TYPES ---

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserProfile {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  streakDays: number;
  lastActiveDate: string; // ISO Date string
  achievements: Achievement[];
}
