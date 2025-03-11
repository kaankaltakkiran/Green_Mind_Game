<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="header-gradient">
      <q-toolbar class="header-content">
        <q-toolbar-title class="text-center">
          <div class="title-container">
            <span class="eco-icon animate-float">🌍</span>
            <span class="title-text animate-slide-in">Green Mind Quiz</span>
            <span class="eco-icon animate-float delay-2">🌱</span>
          </div>
          <div class="subtitle-text animate-fade-in">Çevre Bilinci için Eğlenceli Bir Yolculuk</div>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.header-gradient {
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.header-content {
  padding: 1.5rem 1rem;
}

.title-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.title-text {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(to right, #ffffff, #e8f5e9);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: 1px;
}

.subtitle-text {
  font-size: 1.1rem;
  color: #a5d6a7;
  font-weight: 500;
  letter-spacing: 0.5px;
  margin-top: 0.25rem;
}

.eco-icon {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* Animations */
.animate-float {
  animation: float 3s ease-in-out infinite;
}

.delay-2 {
  animation-delay: 1.5s;
}

.animate-slide-in {
  animation: slideIn 1s ease-out forwards;
}

.animate-fade-in {
  animation: fadeIn 1.5s ease-out forwards;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
