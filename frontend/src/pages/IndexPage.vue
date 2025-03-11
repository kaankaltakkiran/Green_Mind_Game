<template>
  <q-page class="flex flex-center bg-green-1">
    <div class="container q-pa-md">
      <!-- Game Setup -->
      <div v-if="!state.isGameStarted && !isGameOver" class="setup-container">
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
                :rules="[(val) => val.length > 0 || 'Grup ismi boş olamaz']"
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

      <!-- Game Play -->
      <div v-else-if="state.isGameStarted" class="game-container">
        <div class="game-header q-mb-md">
          <h3 class="text-h5 text-center text-green-9">
            Sıradaki Grup: {{ currentGroup?.name || 'Bilinmiyor' }}
          </h3>
          <div class="text-center text-subtitle1">
            Soru {{ (currentGroup?.currentQuestion || 0) + 1 }} / {{ state.totalQuestions }}
          </div>
          <div class="timer text-center text-h6" :class="{ 'text-red': state.timer < 10 }">
            Süre: {{ state.timer }} saniye
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
                class="q-my-sm"
              >
                <q-item-section>
                  <q-item-label class="text-subtitle1">{{ option }}</q-item-label>
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
            {{ state.selectedAnswer === currentQuestion.answer ? 'Doğru! 🎉' : 'Yanlış 😔' }}
          </div>
        </div>
      </div>

      <!-- Game Over -->
      <div v-else class="game-over-container text-center">
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
const totalQuestions = ref(9)
const setupComplete = ref(false)
const currentGroupName = ref('')

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
  totalQuestions.value = 9
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

  .q-item {
    border-radius: 8px;
    margin: 8px 0;
    transition: all 0.3s ease;

    &:hover {
      background: #e8f5e9;
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
</style>
