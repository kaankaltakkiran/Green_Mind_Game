import { ref, computed } from 'vue'
import type { GameState, QuizData, Difficulty, Question } from '../types/quiz'
import quizData from '../data/data.json'

export const useQuizGame = () => {
  const state = ref<GameState>({
    groups: [],
    currentGroupIndex: 0,
    totalQuestions: 0,
    timePerQuestion: 30,
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
    return group.questions[group.currentQuestion] || null
  })

  const getRandomQuestions = (questionsPerDifficulty: number): Question[] => {
    const selectedQuestions: Question[] = []
    const difficulties: Difficulty[] = ['easy', 'medium', 'hard']

    difficulties.forEach((difficulty) => {
      const questions = (quizData as QuizData)[difficulty]
      const shuffled = [...questions].map((q) => ({ ...q, difficulty }))
      selectedQuestions.push(
        ...shuffled.sort(() => Math.random() - 0.5).slice(0, questionsPerDifficulty),
      )
    })

    return selectedQuestions.sort(() => Math.random() - 0.5)
  }

  const initializeGame = (groupCount: number, questionsPerDifficulty: number) => {
    resetGameState()
    state.value.totalQuestions = questionsPerDifficulty * 3 // 3 difficulties
  }

  const resetGameState = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }

    state.value = {
      groups: [],
      currentGroupIndex: 0,
      totalQuestions: 0,
      timePerQuestion: 30,
      isGameStarted: false,
      isQuestionActive: false,
      selectedAnswer: null,
      timer: 0,
    }
  }

  const addGroup = (name: string) => {
    const questionsPerDifficulty = Math.floor(state.value.totalQuestions / 3)
    const groupQuestions = getRandomQuestions(questionsPerDifficulty)

    state.value.groups.push({
      name,
      score: 0,
      currentQuestion: 0,
      questions: groupQuestions,
    })
  }

  const startGame = () => {
    state.value.isGameStarted = true
    state.value.currentGroupIndex = 0
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

    // Store the selected answer
    state.value.selectedAnswer = answer
    state.value.isQuestionActive = false

    // Debug logs
    console.log('Selected answer:', answer)
    console.log('Correct answer:', currentQuestion.value.answer)
    console.log('Direct comparison:', answer === currentQuestion.value.answer)
    console.log('Selected answer length:', answer.length)
    console.log('Correct answer length:', currentQuestion.value.answer.length)

    // Compare character by character
    let mismatch = false
    for (let i = 0; i < Math.max(answer.length, currentQuestion.value.answer.length); i++) {
      if (answer[i] !== currentQuestion.value.answer[i]) {
        console.log(`Mismatch at position ${i}:`, {
          selected: answer[i],
          correct: currentQuestion.value.answer[i],
        })
        mismatch = true
      }
    }

    // Check if the answer is correct
    const isCorrect = !mismatch && answer === currentQuestion.value.answer

    if (isCorrect) {
      console.log('✅ Answer is correct!')
      const timeBonus = Math.floor(state.value.timer / 2)
      const difficultyBonus =
        {
          easy: 5,
          medium: 10,
          hard: 15,
        }[currentQuestion.value.difficulty] || 0

      const group = state.value.groups[state.value.currentGroupIndex]
      if (group) {
        group.score += 10 + timeBonus + difficultyBonus
      }
    } else {
      console.log('❌ Answer is wrong!')
    }

    nextTurn()
  }

  const nextTurn = () => {
    const group = state.value.groups[state.value.currentGroupIndex]
    if (!group) return

    group.currentQuestion++

    if (group.currentQuestion >= state.value.totalQuestions) {
      state.value.currentGroupIndex++

      if (state.value.currentGroupIndex >= state.value.groups.length) {
        state.value.isGameStarted = false
        return
      }
    } else {
      state.value.currentGroupIndex =
        (state.value.currentGroupIndex + 1) % state.value.groups.length

      let nextGroup = state.value.groups[state.value.currentGroupIndex]
      while (nextGroup && nextGroup.currentQuestion >= state.value.totalQuestions) {
        state.value.currentGroupIndex =
          (state.value.currentGroupIndex + 1) % state.value.groups.length
        nextGroup = state.value.groups[state.value.currentGroupIndex]
      }
    }

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
    resetGameState,
  }
}
