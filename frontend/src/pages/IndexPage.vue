<template>
  <q-page class="flex flex-center bg-green-1">
    <div class="container q-pa-md">
      <!-- Game States -->
      <template v-if="state.isGameStarted">
        <div class="game-container">
          <div class="game-header q-mb-md">
            <h3 class="text-h5 text-center text-green-9">
              Sıradaki Grup: {{ currentGroup?.name || 'Bilinmiyor' }}
            </h3>
            <div class="text-center text-subtitle1">
              Soru {{ (currentGroup?.currentQuestion || 0) + 1 }} /
              {{ currentGroup?.questions.length || 0 }}
            </div>
            <div class="text-center text-subtitle2 q-mb-sm">
              Her grup tüm sorularını tamamladıktan sonra sıra diğer gruba geçecektir.
            </div>
            <div class="timer text-center text-h6" :class="{ 'text-red': state.timer < 10 }">
              Süre: {{ state.timer }} saniye
            </div>
          </div>

          <q-card v-if="currentQuestion" class="question-card q-pa-md">
            <q-card-section>
              <div class="row items-center q-mb-md">
                <q-badge
                  :color="difficultyColor"
                  class="difficulty-badge q-px-md q-py-sm"
                  :label="difficultyText"
                />
              </div>
              <div class="text-h6">{{ currentQuestion.question }}</div>
            </q-card-section>

            <q-card-section>
              <q-list>
                <q-item
                  v-for="option in currentQuestion.options"
                  :key="option"
                  clickable
                  v-ripple
                  @click="handleAnswer(option)"
                  :disable="!state.isQuestionActive || state.isTransitioning"
                  class="option-item q-my-sm"
                  :class="{
                    'correct-answer':
                      !state.isQuestionActive &&
                      !state.isTransitioning &&
                      option === currentQuestion.answer,
                    'wrong-answer':
                      !state.isQuestionActive &&
                      !state.isTransitioning &&
                      option === state.selectedAnswer &&
                      option !== currentQuestion.answer,
                  }"
                >
                  <q-item-section>
                    <q-item-label class="text-subtitle1">{{ option }}</q-item-label>
                  </q-item-section>
                  <q-item-section v-if="!state.isQuestionActive && !state.isTransitioning" side>
                    <q-icon
                      v-if="option === currentQuestion.answer"
                      name="check_circle"
                      color="positive"
                      size="md"
                    />
                    <q-icon
                      v-else-if="
                        option === state.selectedAnswer && option !== currentQuestion.answer
                      "
                      name="cancel"
                      color="negative"
                      size="md"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>

            <div
              v-if="
                !state.isQuestionActive &&
                !state.isTransitioning &&
                currentQuestion &&
                state.selectedAnswer !== null
              "
              class="feedback q-mt-md text-center"
            >
              <div
                class="text-h6 q-pa-md rounded-borders"
                :class="{
                  'bg-green-2 text-positive': state.lastAnswerCorrect === true,
                  'bg-red-2 text-negative': state.lastAnswerCorrect === false,
                }"
              >
                <template v-if="state.lastAnswerCorrect === true">
                  <div class="text-h5">🎉 Doğru! 🎉</div>
                  <div class="text-subtitle1 q-mt-sm text-green-10">+10 puan</div>
                </template>
                <template v-else-if="state.lastAnswerCorrect === false">
                  <div class="text-h5">😔 Yanlış!</div>
                  <div class="text-subtitle1 q-mt-sm text-red-10">
                    Doğru cevap: {{ currentQuestion.answer }}
                  </div>
                </template>
              </div>
            </div>
          </q-card>
        </div>
      </template>

      <template v-else-if="isGameOver">
        <div class="game-over-container text-center">
          <h2 class="text-h4 text-green-9">Oyun Bitti! 🎮</h2>

          <div class="winners q-mt-lg">
            <h3 class="text-h5">Kazananlar:</h3>
            <div v-for="winner in winners" :key="winner.name" class="text-h6 text-green-8">
              {{ winner.name }} - {{ winner.score }} puan
            </div>
          </div>

          <div class="scores q-mt-lg">
            <h3 class="text-h5">Tüm Skorlar:</h3>
            <q-list bordered separator class="rounded-borders">
              <q-item v-for="group in state.groups" :key="group.name">
                <q-item-section>
                  <q-item-label>{{ group.name }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label>{{ group.score }} puan</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div class="q-mt-lg">
            <q-btn color="green-9" label="Yeni Oyun" icon="replay" @click="resetGame" size="lg" />
          </div>
        </div>
      </template>

      <template v-else>
        <div class="setup-container">
          <h2 class="text-h4 text-center text-green-9 q-mb-lg">🌍 Çevre Bilinci Yarışması 🌱</h2>

          <template v-if="!setupComplete">
            <div class="text-subtitle1 text-center q-mb-md">
              Yarışmaya başlamak için lütfen grup sayısını ve soru sayısını belirleyin.
            </div>
            <div class="row justify-center q-gutter-md">
              <q-input
                v-model.number="groupCount"
                type="number"
                label="Grup Sayısı"
                class="col-12 col-sm-6"
                filled
                :rules="[
                  (val) => val > 0 || 'Lütfen geçerli bir sayı girin',
                  (val) => val <= 10 || 'En fazla 10 grup oluşturabilirsiniz',
                ]"
                hint="En az 1, en fazla 10 grup"
              >
                <template v-slot:prepend>
                  <q-icon name="groups" />
                </template>
              </q-input>
              <q-input
                v-model.number="totalQuestions"
                type="number"
                label="Toplam Soru Sayısı"
                class="col-12 col-sm-6"
                filled
                :rules="[
                  (val) => val > 0 || 'Lütfen geçerli bir sayı girin',
                  (val) => val <= 30 || 'En fazla 30 soru seçebilirsiniz',
                ]"
                hint="En az 3, en fazla 30 soru"
              >
                <template v-slot:prepend>
                  <q-icon name="quiz" />
                </template>
              </q-input>
            </div>
            <div class="row justify-center q-mt-lg">
              <q-btn
                color="green-9"
                label="Grupları Oluştur"
                icon="arrow_forward"
                @click="setupGroups"
                :disable="!isSetupValid"
                size="lg"
              />
            </div>
          </template>

          <template v-else>
            <div class="group-setup q-pa-md">
              <h3 class="text-h5 text-center text-green-8 q-mb-md">Grup İsimlerini Girin</h3>
              <div class="text-subtitle2 text-center q-mb-md">
                {{ remainingGroups }} grup ismi daha girilmesi gerekiyor
              </div>
              <div class="row justify-center q-gutter-md">
                <q-input
                  v-model="currentGroupName"
                  label="Grup İsmi"
                  class="col-12 col-sm-6"
                  filled
                  @keyup.enter="addGroupName"
                  hint="Enter tuşu ile veya + butonuna basarak ekleyebilirsiniz"
                >
                  <template v-slot:prepend>
                    <q-icon name="group" />
                  </template>
                  <template v-slot:append>
                    <q-btn
                      flat
                      round
                      color="green"
                      icon="add"
                      @click="addGroupName"
                      :disable="!currentGroupName"
                    />
                  </template>
                </q-input>
              </div>

              <div class="groups-list q-mt-md">
                <div class="text-h6 text-center q-mb-sm">Eklenen Gruplar</div>
                <q-list bordered separator class="rounded-borders">
                  <q-item v-for="(group, index) in state.groups" :key="index">
                    <q-item-section avatar>
                      <q-icon name="group" color="green" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ group.name }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>

              <div class="row justify-center q-mt-lg">
                <q-btn
                  color="green-9"
                  label="Yarışmayı Başlat"
                  icon="play_arrow"
                  @click="startGame"
                  :disable="state.groups.length !== groupCount"
                  size="lg"
                />
              </div>
            </div>
          </template>
        </div>
      </template>

      <!-- Wrong Answer Overlay -->
      <q-dialog
        v-model="showWrongAnswerOverlay"
        persistent
        transition-show="scale"
        transition-hide="scale"
      >
        <q-card class="wrong-answer-overlay text-center">
          <q-card-section class="column items-center q-pa-lg">
            <div class="wrong-icon">✖</div>
            <div class="text-h4 text-negative q-mt-md">Yanlış Cevap!</div>
            <div class="text-subtitle1 q-mt-md text-weight-medium">Doğru cevap:</div>
            <div class="text-h6 text-primary q-mt-sm">
              {{ currentQuestion?.answer }}
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- Correct Answer Overlay -->
      <q-dialog
        v-model="showCorrectAnswerOverlay"
        persistent
        transition-show="scale"
        transition-hide="scale"
      >
        <q-card class="correct-answer-overlay text-center">
          <q-card-section class="column items-center q-pa-lg">
            <div class="correct-icon">✓</div>
            <div class="text-h4 text-positive q-mt-md">Doğru Cevap!</div>
            <div class="text-subtitle1 q-mt-md text-weight-medium">Tebrikler!</div>
            <div class="text-h6 text-primary q-mt-sm">+10 puan kazandınız</div>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuizGame } from 'src/composables/useQuizGame'

const {
  state,
  currentGroup,
  currentQuestion,
  isGameOver,
  winners,
  addGroup: addGroupToGame,
  startGame: startGamePlay,
  submitAnswer,
  resetGameState,
  initializeGame,
} = useQuizGame()

const setupComplete = ref(false)
const currentGroupName = ref('')
const groupCount = ref(2)
const totalQuestions = ref(9)
const showWrongAnswerOverlay = ref(false)
const showCorrectAnswerOverlay = ref(false)

// Initialize game with 3 questions per difficulty level (9 total questions)
initializeGame(2, 3)

const isSetupValid = computed(() => {
  return (
    groupCount.value >= 1 &&
    groupCount.value <= 10 &&
    totalQuestions.value >= 3 &&
    totalQuestions.value <= 30
  )
})

const remainingGroups = computed(() => {
  return groupCount.value - state.value.groups.length
})

const setupGroups = () => {
  if (!isSetupValid.value) return

  // Calculate questions per difficulty to match total questions
  const questionsPerDifficulty = Math.floor(totalQuestions.value / 3)
  initializeGame(groupCount.value, questionsPerDifficulty)
  setupComplete.value = true
}

const addGroupName = () => {
  if (!currentGroupName.value || state.value.groups.length >= groupCount.value) return

  addGroupToGame(currentGroupName.value)
  currentGroupName.value = ''
}

const startGame = () => {
  if (state.value.groups.length !== groupCount.value) return
  startGamePlay()
}

const resetGame = () => {
  resetGameState()
  setupComplete.value = false
  groupCount.value = 2
  totalQuestions.value = 9
  currentGroupName.value = ''
}

const difficultyColor = computed(() => {
  if (!currentQuestion.value) return 'grey'

  switch (currentQuestion.value.difficulty) {
    case 'easy':
      return 'positive'
    case 'medium':
      return 'warning'
    case 'hard':
      return 'negative'
    default:
      return 'grey'
  }
})

const difficultyText = computed(() => {
  if (!currentQuestion.value) return ''

  const difficultyMap = {
    easy: 'Kolay',
    medium: 'Orta',
    hard: 'Zor',
  }

  return difficultyMap[currentQuestion.value.difficulty] || ''
})

const handleAnswer = (answer: string) => {
  if (!currentQuestion.value || state.value.isTransitioning) return

  // Log for debugging
  console.log('Handling answer:', answer)
  console.log('Current question:', currentQuestion.value.question)
  console.log('Correct answer:', currentQuestion.value.answer)

  // Check if the answer is correct before submitting
  const isCorrect = answer === currentQuestion.value.answer
  console.log('Is answer correct?', isCorrect)

  submitAnswer(answer)

  // Show the appropriate overlay based on whether the answer is correct or not
  if (isCorrect) {
    showCorrectAnswerOverlay.value = true
    setTimeout(() => {
      showCorrectAnswerOverlay.value = false
    }, 1500) // Hide after 1.5 seconds
  } else {
    showWrongAnswerOverlay.value = true
    setTimeout(() => {
      showWrongAnswerOverlay.value = false
    }, 1500) // Hide after 1.5 seconds
  }
}
</script>

<style lang="scss" scoped>
.container {
  max-width: 800px;
  width: 100%;
}

.setup-container,
.game-container,
.game-over-container {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.question-card {
  background: #f0f8f0;
  border-left: 4px solid #2e7d32;

  .difficulty-badge {
    font-size: 1rem;
    font-weight: 500;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .option-item {
    border-radius: 8px;
    margin: 8px 0;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    position: relative;

    &:hover {
      background: #e8f5e9;
    }

    &.correct-answer {
      background: #c8e6c9 !important;
      border-color: #4caf50;
      color: #1b5e20;
      font-weight: 500;
      box-shadow: 0 2px 4px rgba(76, 175, 80, 0.2);
    }

    &.wrong-answer {
      background: #ffcdd2 !important;
      border-color: #f44336;
      color: #b71c1c;
      font-weight: 500;
      box-shadow: 0 2px 4px rgba(244, 67, 54, 0.2);
    }
  }
}

.timer {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 1rem 0;

  &.text-red {
    color: #f44336;
  }
}

.feedback {
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 1rem;
}

.groups-list {
  max-height: 300px;
  overflow-y: auto;
  margin: 1rem 0;
}

.wrong-answer-overlay {
  background: rgba(255, 255, 255, 0.98);
  border: none;
  border-radius: 16px;
  min-width: 320px;
  box-shadow: 0 4px 20px rgba(244, 67, 54, 0.25);

  .wrong-icon {
    font-size: 100px;
    color: #f44336;
    animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    text-shadow: 0 4px 8px rgba(244, 67, 54, 0.3);
    margin: 10px 0;
  }

  .q-card-section {
    background: linear-gradient(180deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0) 100%);
  }
}

.correct-answer-overlay {
  background: rgba(255, 255, 255, 0.98);
  border: none;
  border-radius: 16px;
  min-width: 320px;
  box-shadow: 0 4px 20px rgba(76, 175, 80, 0.25);

  .correct-icon {
    font-size: 100px;
    color: #4caf50;
    animation: bounce 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    text-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
    margin: 10px 0;
  }

  .q-card-section {
    background: linear-gradient(180deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0) 100%);
  }
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-2px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(4px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-6px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(6px, 0, 0);
  }
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
}
</style>
