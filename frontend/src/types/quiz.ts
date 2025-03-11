export interface Question {
  question: string
  options: string[]
  answer: string
}

export interface Group {
  name: string
  score: number
  currentQuestion: number
}

export interface GameState {
  groups: Group[]
  currentGroupIndex: number
  questions: Question[]
  totalQuestions: number
  timePerQuestion: number
  isGameStarted: boolean
  isQuestionActive: boolean
  selectedAnswer: string | null
  timer: number
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface QuizData {
  easy: Question[]
  medium: Question[]
  hard: Question[]
}
