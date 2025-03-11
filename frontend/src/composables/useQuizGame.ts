import { ref, computed } from 'vue'
import type { GameState, QuizData, Difficulty } from '../types/quiz'
import quizData from '../data/data.json'

export const useQuizGame = () => {
  const state = ref<GameState>({
    groups: [],
    currentGroupIndex: 0,
    questions: [],
    totalQuestions: 0,
    timePerQuestion: 30, // 30 seconds per question
    isGameStarted: false,
    isQuestionActive: false,
    selectedAnswer: null,
    timer: 0,
  })

  const timerInterval = ref<number | null>(null)

  const currentGroup = computed(() => state.value.groups[state.value.currentGroupIndex])

  const currentQuestion = computed(() => {
    const group = currentGroup.value
    if (!group) return null
    return state.value.questions[group.currentQuestion] || null
  })

  const initializeGame = (groupCount: number, questionsPerDifficulty: number) => {
    // Reset game state
    state.value.groups = []
    state.value.questions = []
    state.value.currentGroupIndex = 0
    state.value.isGameStarted = false
    state.value.isQuestionActive = false
    state.value.selectedAnswer = null

    // Select questions from each difficulty level
    const difficulties: Difficulty[] = ['easy', 'medium', 'hard']
    difficulties.forEach((difficulty) => {
      const questions = (quizData as QuizData)[difficulty]
      const shuffled = [...questions].sort(() => Math.random() - 0.5)
      state.value.questions.push(...shuffled.slice(0, questionsPerDifficulty))
    })

    // Shuffle all selected questions
    state.value.questions = state.value.questions.sort(() => Math.random() - 0.5)
    state.value.totalQuestions = state.value.questions.length
  }

  const addGroup = (name: string) => {
    state.value.groups.push({
      name,
      score: 0,
      currentQuestion: 0,
    })
  }

  const startGame = () => {
    state.value.isGameStarted = true
    startQuestion()
  }

  const startQuestion = () => {
    state.value.isQuestionActive = true
    state.value.selectedAnswer = null
    state.value.timer = state.value.timePerQuestion

    timerInterval.value = window.setInterval(() => {
      if (state.value.timer > 0) {
        state.value.timer--
      } else {
        handleTimeout()
      }
    }, 1000)
  }

  const handleTimeout = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
    }
    state.value.isQuestionActive = false
    nextTurn()
  }

  const submitAnswer = (answer: string) => {
    if (!state.value.isQuestionActive || !currentQuestion.value) return

    if (timerInterval.value) {
      clearInterval(timerInterval.value)
    }
    state.value.selectedAnswer = answer
    state.value.isQuestionActive = false

    if (answer === currentQuestion.value.answer) {
      // Calculate score based on remaining time (bonus points for quick answers)
      const timeBonus = Math.floor(state.value.timer / 2)
      const group = state.value.groups[state.value.currentGroupIndex]
      if (group) {
        group.score += 10 + timeBonus
      }
    }

    nextTurn()
  }

  const nextTurn = () => {
    const group = state.value.groups[state.value.currentGroupIndex]
    if (!group) return

    group.currentQuestion++

    if (group.currentQuestion >= state.value.totalQuestions) {
      // Move to next group
      state.value.currentGroupIndex++

      if (state.value.currentGroupIndex >= state.value.groups.length) {
        // Game over
        state.value.isGameStarted = false
        return
      }
    }

    // Start next question after a short delay
    setTimeout(startQuestion, 2000)
  }

  const isGameOver = computed(() => {
    return !state.value.isGameStarted && state.value.groups.some((g) => g.currentQuestion > 0)
  })

  const winners = computed(() => {
    if (!isGameOver.value) return []

    const maxScore = Math.max(...state.value.groups.map((g) => g.score))
    return state.value.groups.filter((g) => g.score === maxScore)
  })

  return {
    state,
    currentGroup,
    currentQuestion,
    isGameOver,
    winners,
    initializeGame,
    addGroup,
    startGame,
    submitAnswer,
  }
}
