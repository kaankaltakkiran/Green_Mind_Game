export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Question {
  question: string
  options: string[]
  answer: string
  difficulty: Difficulty
}

export interface Group {
  name: string
  score: number
  currentQuestion: number
  questions: Question[]
}

export interface GameState {
  groups: Group[]
  currentGroupIndex: number
  totalQuestions: number
  timePerQuestion: number
  isGameStarted: boolean
  isQuestionActive: boolean
  selectedAnswer: string | null
  timer: number
  lastAnswerCorrect: boolean | null
  isTransitioning: boolean
}

export interface QuizData {
  easy: Omit<Question, 'difficulty'>[]
  medium: Omit<Question, 'difficulty'>[]
  hard: Omit<Question, 'difficulty'>[]
}
