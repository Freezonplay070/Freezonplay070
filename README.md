
# RadioFree — безкоштовний сайт-радіо (GitHub Pages / Cloudflare Pages)

Готовий шаблон для **0 грн** запуску сайту з кількома плейлистами (Phonk, Classical, Drive) + **опційно** лайв-стрім (Shoutcast/Icecast) + **опційно** реєстрація через Firebase Auth.

## Структура
```
.
├── index.html                # Головна сторінка
├── styles.css                # Стилі
├── app.js                    # Логіка плеєра та плейлистів
├── auth.js                   # Опційний логін через Firebase
├── config/
│   ├── playlists.json        # Налаштування плейлистів/стріму
│   └── firebase.json         # Конфіг Firebase (може бути порожнім)
└── assets/
    ├── logo.svg
    └── sample/               # Демо-треки (WAV-тон)
```

---

## КРОКИ ДЕПЛОЮ НА GITHUB PAGES (0 грн)

1. **Створи репозиторій** на GitHub із назвою `username.github.io` (де `username` — твій нік).
2. Завантаж усі файли з цього архіву в репозиторій.
3. Зайди в **Settings → Pages** і переконайся, що Source: `Deploy from a branch` (за замовчуванням військо).
4. Через ~1–2 хвилини сайт буде доступний за адресою `https://username.github.io/`.

> **Альтернатива:** Cloudflare Pages / Netlify / Vercel — просто імпортуй репозиторій і натисни *Deploy*.

---

## Як додати свої плейлисти/файли
Відкрий `config/playlists.json` і редагуй:
```jsonc
{
  "site": { "name": "RadioFree", "brandColor": "#0ecb68", "accentColor": "#ff7a17" },
  "playlists": [
    {
      "id": "phonk",
      "title": "Phonk",
      "type": "files",
      "tracks": [
        { "title": "Мій трек", "artist": "Я", "src": "assets/music/mine.mp3" }
      ]
    },
    {
      "id": "live",
      "title": "Live",
      "type": "stream",
      "streamUrl": "https://YOUR_SHOUTCAST_OR_ICECAST_URL"
    }
  ]
}
```
- Для **type: "files"** — вкажи масив треків `tracks[]`, кожен з полями `title`, `artist`, `src` (URL на `.mp3/.wav`).
- Для **type: "stream"** — вкажи `streamUrl` (посилання від твого радіо-хостингу).
- Картинки обкладинок поклади у `assets/covers/` і вкажи шлях у полі `cover`.

> **Порада:** якщо заливаєш власні аудіо у репозиторій — вони будуть доступні за прямими лінками. Або ж посилайся на інші хостинги (CDN, S3-аналоги, радіо-хостинги).

---

## Увімкнути реєстрацію (Firebase Auth, без сервера)
1. Зайди в [Firebase Console] → **Create project**.
2. **Authentication → Sign-in method → Email/Password → Enable**.
3. **Project settings → General → Your apps → Web app** → *Register app* → скопіюй `firebaseConfig`.
4. Встав ці ключі у `config/firebase.json`:
```json
{ "apiKey":"...", "authDomain":"...",
  "projectId":"...","appId":"..." }
```
5. У **Authentication → Settings → Authorized domains** додай домен свого сайту
   (наприклад `username.github.io` або `project.pages.dev`).
6. Готово: кнопка «Увійти/Зареєструватись» активується. Обліковки зберігаються у Firebase.

> Хочеш зберігати «вподобані треки» у хмарі? Додай Cloud Firestore і запиши там дані користувача — код легко розширити.

---

## Додати живий стрім («радіо»)
1. Отримай `streamUrl` у свого хостингу (Shoutcast/Icecast). Для старту можна спробувати безкоштовні плани (зазвичай з обмеженнями).
2. Додай у `config/playlists.json` плейлист `type: "stream"` із цим URL.
3. Натисни **Слухати** на картці Live → плеєр підхопить потік.

---

## Поради / часті питання
- **Автовідтворення заблоковано**? У браузері потрібна взаємодія користувача: натисни ▶️.
- **Не грає ваш MP3**: перевір CORS на хостингу файлів і чи є прямий доступ.
- **Багато трафіку**: з часом може знадобитися CDN/інший хостинг аудіо.
- **Кастомний домен**: прив’яжи безкоштовний субдомен (наприклад `*.eu.org`) і налаштуй CNAME на GitHub Pages.

---

## Ліцензія аудіо
Відповідальність за права на музику — на власнику сайту. Для демо тут — синусоїдні тони (власного виробництва).

Успіхів! 🔊
