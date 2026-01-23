# Structa AI Mobile

AI-powered document scanner that converts physical documents into structured digital formats.

## Tech Stack

- **Expo SDK 54** (Managed Workflow)
- **React Native**
- **TypeScript** (Strict Mode)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
structa-ai-mobile/
├── app/                # UI Layer (Screens, Components, Navigation)
├── domain/             # Business Logic (Models, Workflows, Services)
├── infra/              # Platform & Integrations (Camera, API, Storage)
├── config/             # App configuration
├── assets/             # Images, fonts
└── docs/               # Documentation
```

## Phase 1 Checklist

- [x] Expo project setup
- [x] TypeScript strict mode
- [x] Folder structure
- [x] Core data models
- [x] API client
- [x] Camera permission hook
- [x] Image preprocessor
- [x] Upload manager
- [x] Local storage
- [x] Scan workflow
- [x] Export service
- [ ] Screen components
- [ ] Navigation setup

## Environment Variables

Create a `.env` file:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)

## License

Private - Structa AI
