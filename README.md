# 🌿 Green Mind Game

An interactive web-based quiz game focused on environmental awareness and sustainability education.

## 🇹🇷 Türkçe Açıklama

### 🌍 Pangea Quiz - Çevre Bilinci Yarışması

Pangea Quiz, çevre bilinci ve sürdürülebilirlik konularında farkındalık yaratmak amacıyla geliştirilmiş interaktif bir bilgi yarışması oyunudur. Bu oyun, eğlenceli bir rekabet ortamında çevre sorunları, sürdürülebilirlik ve ekoloji hakkında bilgi edinmenizi sağlar.

### 🎮 Nasıl Oynanır?

1. **Oyunu Başlatma:**

   - Grup sayısını ve soru sayısını belirleyin (1-10 grup, 3-30 soru)
   - Her gruba bir isim verin
   - "Yarışmayı Başlat" butonuna tıklayın

2. **Oyun Akışı:**

   - Her grup sırayla tüm sorularını tamamlar
   - Her soru için 30 saniye süre verilir
   - Sorular zorluk seviyelerine göre (Kolay, Orta, Zor) kategorize edilmiştir
   - Doğru cevap verdiğinizde 10 puan kazanırsınız
   - Yanlış cevap verdiğinizde puan kazanamazsınız

3. **Sonuçlar:**
   - Tüm gruplar sorularını tamamladığında oyun sona erer
   - En yüksek puanı alan grup(lar) kazanan olarak ilan edilir
   - Tüm grupların puanları görüntülenir

### 🌱 Oyunun Amacı

Bu oyun, çevre sorunları hakkında farkındalık yaratmak, sürdürülebilirlik konusunda bilgi paylaşımını teşvik etmek ve ekolojik dengenin önemini vurgulamak amacıyla tasarlanmıştır. Eğlenceli bir rekabet ortamında öğrenme sağlayarak, çevre bilincinin artmasına katkıda bulunmayı hedeflemektedir.

### 💡 İpuçları

- Soruları dikkatle okuyun
- Sürenizi verimli kullanın
- Zorluk seviyesi arttıkça sorular daha karmaşık hale gelir
- Grup arkadaşlarınızla işbirliği yaparak doğru cevabı bulmaya çalışın

---

## 🎯 Features

- 🌍 Environmental awareness quiz with multiple-choice questions
- ⏱️ Dynamic timer system for each question
- 🏆 Comprehensive scoring system
- 👤 User authentication and profile management
- 📊 Global and regional leaderboards
- 🌐 Multi-language support (English & Turkish)
- 📱 Responsive design for all devices
- 🎨 Eco-friendly themed UI/UX

## 🛠️ Technical Stack

### Frontend

- Quasar Framework (v2.x) with Vue.js 3
- TypeScript
- SCSS for custom styling
- Vite as build tool
- TensorFlow.js for AI components

### Backend

- PHP 8.1
- MySQL 8.0
- JWT Authentication
- RESTful API

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PHP 8.1+
- MySQL 8.0+
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/green-mind-game.git
cd green-mind-game
```

2. Install frontend dependencies

```bash
cd frontend
npm install
```

3. Install backend dependencies

```bash
cd backend
composer install
```

4. Configure environment variables

```bash
cp .env.example .env
# Edit .env file with your database and API credentials
```

5. Run database migrations

```bash
php artisan migrate
```

6. Start development servers

```bash
# Frontend (in frontend directory)
npm run dev

# Backend (in backend directory)
php -S localhost:8000
```

## 🌐 Internationalization

The game supports multiple languages:

- English (Default)
- Turkish

Language files are located in:

- Frontend: `src/i18n/`
- Backend: `resources/lang/`

## 🎮 Game Features

### Quiz System

- Multiple difficulty levels
- Various environmental topics
- Timed questions
- Interactive feedback
- Progress tracking

### Scoring System

- Base points for correct answers
- Time bonus points
- Streak multipliers
- Weekly challenges

### Leaderboard

- Global rankings
- Regional rankings
- Weekly/Monthly/All-time categories
- Friend challenges

## 🔐 Security Features

- JWT Authentication
- CSRF Protection
- XSS Prevention
- API Rate Limiting
- SQL Injection Prevention
- Secure Headers

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Environmental data sources
- Open-source contributors
- Community feedback and support

---

Made with 💚 for a greener future
