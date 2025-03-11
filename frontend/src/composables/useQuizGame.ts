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

    // Get the current question index for this group
    const questionIndex = group.currentQuestion

    // Make sure the question exists in this group's questions array
    if (questionIndex < 0 || questionIndex >= group.questions.length) return null

    // Return the specific question for this group
    return group.questions[questionIndex]
  })

  const getRandomQuestions = (questionsPerDifficulty: number): Question[] => {
    const selectedQuestions: Question[] = []
    const difficulties: Difficulty[] = ['easy', 'medium', 'hard']

    difficulties.forEach((difficulty) => {
      const questions = (quizData as QuizData)[difficulty]
      // Create a deep copy of questions and add difficulty
      const shuffled = [...questions].map((q) => ({
        ...q,
        difficulty,
        // Ensure we're creating a new object for each question
        options: [...q.options],
      }))

      // Take random questions for this difficulty
      selectedQuestions.push(
        ...shuffled.sort(() => Math.random() - 0.5).slice(0, questionsPerDifficulty),
      )
    })

    // Randomize the order of all selected questions
    return selectedQuestions.sort(() => Math.random() - 0.5)
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

    // Check if the answer is correct
    const isCorrect = answer === currentQuestion.value.answer

    if (isCorrect) {
      console.log('✅ Answer is correct!')
      // Award 10 points for correct answer
      const group = state.value.groups[state.value.currentGroupIndex]
      if (group) {
        group.score += 10
      }
    } else {
      console.log('❌ Answer is wrong!')
      // No points for wrong answer
    }

    nextTurn()
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
    // Calculate questions per difficulty based on total questions
    const questionsPerDifficulty = Math.floor(state.value.totalQuestions / 3)

    // Get a unique set of random questions for this group
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

  const nextTurn = () => {
    const group = state.value.groups[state.value.currentGroupIndex]
    if (!group) return

    group.currentQuestion++

    if (group.currentQuestion >= group.questions.length) {
      state.value.currentGroupIndex++

      if (state.value.currentGroupIndex >= state.value.groups.length) {
        state.value.isGameStarted = false
        return
      }
    }

    // Ensure the current group is valid and has questions left
    let nextGroup = state.value.groups[state.value.currentGroupIndex]
    while (nextGroup && nextGroup.currentQuestion >= nextGroup.questions.length) {
      state.value.currentGroupIndex =
        (state.value.currentGroupIndex + 1) % state.value.groups.length
      nextGroup = state.value.groups[state.value.currentGroupIndex]
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
