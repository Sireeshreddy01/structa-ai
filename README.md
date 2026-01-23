# Structa AI

AI-powered mobile application that captures physical documents using a device camera and converts them into structured digital formats such as text, tables, and spreadsheets.

## Features

- 📸 Document capture with auto-crop overlay
- 📄 Multi-page scanning support
- 🔍 OCR for printed and handwritten text
- 📊 Table detection and extraction
- 📁 Export to PDF, Excel, and plain text
- ☁️ Cloud processing with async job handling

## Architecture

- **Mobile**: Expo / React Native (TypeScript)
- **Backend**: Node.js/NestJS API + Python AI workers
- **Storage**: S3-compatible object storage
- **Queue**: Redis or SQS for async processing

## Project Structure

```
structa-ai/
├── apps/
│   └── mobile/          # Expo React Native app
├── packages/
│   ├── api/             # Backend API service
│   ├── ai-workers/      # Python AI processing workers
│   └── shared/          # Shared types and utilities
├── docs/                # Documentation
└── infrastructure/      # Deployment configs
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- Python 3.11+
- Expo CLI

### Installation

```bash
# Install dependencies
pnpm install

# Start mobile app
cd apps/mobile
pnpm start

# Start backend
cd packages/api
pnpm dev
```

## Documentation

See [architechture.md](./architechture.md) for detailed system architecture.

## License

MIT
