# MIND-MASTERY — Build Reference

## Successful Build (2026-04-30)

### Critical Rules
1. Always use npx expo install --fix for expo packages
2. package-lock.json MUST be in git
3. postinstall: echo "skip lefthook"
4. .npmrc: legacy-peer-deps=true
5. plugins: only real config plugins (expo-router, expo-audio, expo-notifications, expo-sqlite, expo-localization, expo-secure-store)
6. No .sql files — use .ts
7. babel.config.js: react-native-reanimated/plugin last
8. Font files MUST be >0 bytes
9. app.config.ts: UTF-8 without BOM

### Core Versions
- expo: 53.0.0
- react: 19.0.0
- react-native: 0.79.6
- expo-router: ~5.1.11
- expo-updates: ~0.28.18
- expo-font: 13.3.2
- typescript: ~5.8.3

### EAS
- Project ID: 3ec24a8a-9f3c-4a37-89a7-f767ba425df6
- Repo: ShkodnikAI/MIND-MASTERY
- Build: eas build --profile preview --platform android

### Pre-build Checklist
1. git pull origin main
2. npx expo install --fix
3. Check fonts >0 bytes
4. npx expo export (zero errors)
5. git push
6. eas build --profile preview --platform android
