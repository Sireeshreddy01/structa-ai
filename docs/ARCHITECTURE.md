# Structa AI Mobile - Architecture

## Overview

Mobile thin client for **Structa AI** - captures documents and displays structured results.

---

## Technology Stack

- **Framework**: Expo (Managed Workflow)
- **Language**: TypeScript (Strict Mode)
- **UI**: React Native
- **Camera**: expo-camera
- **Image Processing**: expo-image-manipulator
- **File System**: expo-file-system
- **OTA Updates**: expo-updates

---

## Folder Structure

```
structa-ai-mobile/
│
├── app/                # UI Layer
│   ├── screens/        # Screen components
│   ├── components/     # Reusable UI components
│   ├── navigation/     # Navigation configuration
│   └── providers/      # Context providers
│
├── domain/             # Business Logic
│   ├── models/         # Data models and types
│   ├── workflows/      # Document scan workflows
│   └── services/       # Domain services
│
├── infra/              # Platform & Integrations
│   ├── camera/         # Camera integration
│   ├── image/          # Image preprocessing
│   ├── upload/         # Upload manager
│   ├── api/            # API client
│   └── storage/        # Local storage
│
├── config/             # App configuration
├── assets/             # Images, fonts
└── docs/               # Documentation
```

---

## Layer Responsibilities

### App Layer (Presentation)
- Screens and navigation
- UI state management
- Error and loading states
- User interaction handling

### Domain Layer (Business Logic)
- Document state machine
- Scan workflows
- Export logic
- Permission handling

### Infra Layer (Platform)
- Camera integration
- Image preprocessing
- Background uploads
- API communication
- Local caching

---

## Data Flow

1. User captures document via camera
2. Image preprocessed (resize, compress)
3. Upload to backend API
4. Poll for processing status
5. Receive structured blocks
6. Render results
7. Export if needed

---

## Key Principles

- **Separation of Concerns**: UI, Domain, Infra isolated
- **TypeScript Strict**: Safer refactors
- **Offline First**: Queue uploads when offline
- **Minimal Dependencies**: Only essential packages
