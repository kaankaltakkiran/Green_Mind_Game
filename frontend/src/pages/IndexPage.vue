<template>
  <q-page class="flex flex-center bg-green-1">
    <div class="container q-pa-md">
      <!-- Game Setup -->
      <div v-if="!state.isGameStarted && !isGameOver" class="setup-container">
        <h2 class="text-h4 text-center text-green-9 q-mb-lg">🌍 Environmental Awareness Quiz 🌱</h2>

        <template v-if="!setupComplete">
          <div class="row justify-center q-gutter-md">
            <q-input
              v-model.number="groupCount"
              type="number"
              label="Number of Groups"
              class="col-12 col-sm-6"
              :rules="[(val) => val > 0 || 'Please enter a valid number']"
            />
            <q-input
              v-model.number="questionsPerDifficulty"
              type="number"
              label="Questions per Difficulty Level"
              class="col-12 col-sm-6"
              :rules="[(val) => val > 0 || 'Please enter a valid number']"
            />
          </div>
          <div class="row justify-center q-mt-md">
            <q-btn
              color="green-9"
              label="Start Setup"
              @click="setupGroups"
              :disable="!isSetupValid"
            />
          </div>
        </template>

        <template v-else>
          <div class="group-setup q-pa-md">
            <h3 class="text-h5 text-center text-green-8 q-mb-md">Enter Group Names</h3>
            <div class="row justify-center q-gutter-md">
              <q-input
                v-model="currentGroupName"
                label="Group Name"
                class="col-12 col-sm-6"
                @keyup.enter="addGroupName"
              >
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
              <q-list bordered class="rounded-borders">
                <q-item v-for="(group, index) in state.groups" :key="index">
                  <q-item-section>
                    <q-item-label>{{ group.name }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <div class="row justify-center q-mt-lg">
              <q-btn
                color="green-9"
                label="Start Game"
                @click="startGame"
                :disable="state.groups.length !== groupCount"
              />
            </div>
          </div>
        </template>
      </div>

      <!-- Game Play -->
      <div v-else-if="state.isGameStarted" class="game-container">
        <div class="game-header q-mb-md">
          <h3 class="text-h5 text-center text-green-9">
            Current Group: {{ currentGroup?.name || 'Unknown' }}
          </h3>
          <div class="text-center text-subtitle1">
            Question {{ (currentGroup?.currentQuestion || 0) + 1 }} of {{ state.totalQuestions }}
          </div>
          <div class="timer text-center text-h6" :class="{ 'text-red': state.timer < 10 }">
            Time: {{ state.timer }}s
          </div>
        </div>

        <q-card v-if="currentQuestion" class="question-card q-pa-md">
          <q-card-section>
            <div class="text-h6">{{ currentQuestion.question }}</div>
          </q-card-section>

          <q-card-section>
            <q-list>
              <q-item
                v-for="option in currentQuestion.options"
                :key="option"
                clickable
                v-ripple
                @click="submitAnswer(option)"
                :disable="!state.isQuestionActive"
              >
                <q-item-section>
                  <q-item-label>{{ option }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <div v-if="state.selectedAnswer && currentQuestion" class="feedback q-mt-md text-center">
          <div
            :class="
              state.selectedAnswer === currentQuestion.answer ? 'text-positive' : 'text-negative'
            "
          >
            {{ state.selectedAnswer === currentQuestion.answer ? 'Correct! 🎉' : 'Incorrect 😔' }}
          </div>
        </div>
      </div>

      <!-- Game Over -->
      <div v-else class="game-over-container text-center">
        <h2 class="text-h4 text-green-9">Game Over! 🎮</h2>

        <div class="winners q-mt-lg">
          <h3 class="text-h5">Winners:</h3>
          <div v-for="winner in winners" :key="winner.name" class="text-h6 text-green-8">
            {{ winner.name }} - {{ winner.score }} points
          </div>
        </div>

        <div class="scores q-mt-lg">
          <h3 class="text-h5">All Scores:</h3>
          <q-list bordered class="rounded-borders">
            <q-item v-for="group in state.groups" :key="group.name">
              <q-item-section>
                <q-item-label>{{ group.name }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label>{{ group.score }} points</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <div class="q-mt-lg">
          <q-btn color="green-9" label="Play Again" @click="resetGame" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuizGame } from '../composables/useQuizGame'

const {
  state,
  currentGroup,
  currentQuestion,
  isGameOver,
  winners,
  initializeGame,
  addGroup,
  startGame: startGamePlay,
  submitAnswer,
} = useQuizGame()

const groupCount = ref(2)
const questionsPerDifficulty = ref(3)
const setupComplete = ref(false)
const currentGroupName = ref('')

const isSetupValid = computed(() => {
  return groupCount.value > 0 && questionsPerDifficulty.value > 0
})

const setupGroups = () => {
  if (!isSetupValid.value) return

  initializeGame(groupCount.value, questionsPerDifficulty.value)
  setupComplete.value = true
}

const addGroupName = () => {
  if (!currentGroupName.value || state.value.groups.length >= groupCount.value) return

  addGroup(currentGroupName.value)
  currentGroupName.value = ''
}

const startGame = () => {
  if (state.value.groups.length !== groupCount.value) return
  startGamePlay()
}

const resetGame = () => {
  setupComplete.value = false
  groupCount.value = 2
  questionsPerDifficulty.value = 3
  currentGroupName.value = ''
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
  max-height: 200px;
  overflow-y: auto;
}
</style>
