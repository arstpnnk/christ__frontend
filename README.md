Christian Helper — Expo + TypeScript demo
========================================

Как запустить (локально):
1. Распаковать архив:
   unzip christian-helper.zip
   cd christian-helper

2. Установить зависимости:
   npm install
   (или: yarn install)

3. Запустить Expo:
   npx expo start

4. Открой приложение Expo Go на телефоне и отсканируй QR-код,
   либо запусти Android/iOS эмулятор через Expo DevTools.

Примечания:
- Проект сделан для простого просмотра экрана логина и навигации.
- Если при установке появится предупреждение про версию SDK — обновите expo CLI:
   npm install -g expo-cli
- Для production и реальной авторизации нужно подключить OAuth/бэкенд.

Файлы:
- App.tsx — точка входа, навигация
- screens/LoginScreen.tsx — экран логина (с фоном и логотипом)
- screens/RegisterScreen.tsx — экран регистрации
- screens/GuestScreen.tsx — гостевой экран
- assets/ — содержит bg.jpg, logo.png, google.png
