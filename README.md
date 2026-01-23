# Structa AI 📄🤖

AI-powered mobile document scanner that captures physical documents and converts them to structured digital formats.

## Features

- 📷 **Smart Document Capture** - Camera-based scanning with auto-crop and perspective correction
- 🔍 **OCR Engine** - Extract text from printed and handwritten documents
- 📊 **Table Detection** - Automatically detect and extract tables
- 📁 **Multiple Export Formats** - Export to PDF, Excel, CSV, JSON, Markdown
- 🔄 **Offline Support** - Queue uploads when offline, sync when connected
- 🔒 **Secure** - End-to-end encryption, data isolation, GDPR compliance

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Mobile App (Expo)                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────────┐ │
│  │ Camera  │  │ Image   │  │ Upload  │  │  Offline Queue      │ │
│  │ Capture │→ │ Process │→ │ Manager │→ │  (Background Sync)  │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend API (Express)                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────────┐ │
│  │  Auth   │  │ Upload  │  │  Jobs   │  │    Rate Limiting    │ │
│  │  JWT    │  │ Handler │  │  Queue  │  │    Validation       │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
    ┌──────────┐        ┌──────────┐        ┌──────────────┐
    │ Postgres │        │  Redis   │        │    MinIO     │
    │   DB     │        │  Queue   │        │   Storage    │
    └──────────┘        └──────────┘        └──────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI Workers (Python/FastAPI)                   │
│  ┌────────────┐  ┌─────┐  ┌────────┐  ┌────────┐  ┌───────────┐│
│  │ Preprocess │→ │ OCR │→ │ Layout │→ │ Tables │→ │ Structure ││
│  │   Image    │  │     │  │ Detect │  │ Extract│  │   Data    ││
│  └────────────┘  └─────┘  └────────┘  └────────┘  └───────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

### Mobile App
- **Expo SDK 54** - Managed workflow
- **React Native** - Cross-platform UI
- **TypeScript** - Type safety
- **React Navigation** - Native stack navigation

### Backend API
- **Express.js** - HTTP server
- **Prisma** - PostgreSQL ORM
- **BullMQ** - Job queue
- **Jose** - JWT authentication
- **Zod** - Request validation

### AI Workers
- **FastAPI** - Python API server
- **OpenCV** - Image processing
- **Tesseract/EasyOCR** - Text recognition
- **LayoutParser** - Document layout detection
- **img2table** - Table extraction

### Infrastructure
- **PostgreSQL** - Primary database
- **Redis** - Job queue & caching
- **MinIO** - S3-compatible object storage
- **Docker** - Containerization

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Quick Start (Docker)

```bash
# Clone the repository
git clone https://github.com/yourusername/structa-ai.git
cd structa-ai

# Start all services
docker-compose up -d

# The services will be available at:
# - Mobile Metro: http://localhost:8081
# - Backend API: http://localhost:3000
# - AI Workers: http://localhost:8000
# - MinIO Console: http://localhost:9001
```

### Development Setup

#### 1. Mobile App

```bash
# Install dependencies
npm install

# Start Expo development server
npx expo start
```

#### 2. Backend API

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

#### 3. AI Workers

```bash
cd ai-workers

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env

# Start server
python main.py
```

## Project Structure

```
structa-ai/
├── app/                    # Mobile app screens
│   ├── screens/           # Screen components
│   └── components/        # Reusable UI components
├── domain/                # Business logic
│   ├── models/           # Data models
│   ├── workflows/        # State machines
│   └── services/         # Domain services
├── infra/                 # Infrastructure layer
│   ├── camera/           # Camera service
│   ├── image/            # Image processing
│   ├── upload/           # Upload management
│   ├── api/              # API client
│   └── network/          # Network state
├── backend/              # Node.js backend
│   ├── src/
│   │   ├── api/         # Express routes
│   │   ├── config/      # Configuration
│   │   └── services/    # Business services
│   └── prisma/          # Database schema
├── ai-workers/          # Python AI processing
│   ├── processors/      # AI processors
│   └── exporters/       # Export services
└── docker-compose.yml   # Docker orchestration
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get profile

### Documents
- `GET /api/documents` - List documents
- `POST /api/documents` - Create document
- `GET /api/documents/:id` - Get document
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/:id/status` - Processing status
- `POST /api/documents/:id/process` - Start processing

### Uploads
- `POST /api/uploads/:documentId/pages` - Upload page
- `DELETE /api/uploads/:documentId/pages/:pageId` - Delete page
- `PUT /api/uploads/:documentId/pages/reorder` - Reorder pages

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/structa
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_BUCKET=structa-documents
```

### AI Workers (.env)
```env
AI_PORT=8000
AI_REDIS_URL=redis://localhost:6379
AI_OCR_ENGINE=tesseract
AI_STORAGE_TYPE=s3
```

## Phase Completion Status

- ✅ Phase 1: Foundation (Expo, TypeScript, Models)
- ✅ Phase 2: Mobile Runtime (Permissions, Storage, Background)
- ✅ Phase 3: Image Quality (Preprocessing, Multi-page)
- ✅ Phase 4: Network & Transfer (Chunked Upload, Offline Queue)
- ✅ Phase 5: Backend API (Express, Prisma, BullMQ)
- ✅ Phase 6: AI Pipeline (OCR, Layout, Tables)
- ✅ Phase 7: Data Structuring (Block Segmentation, Validation)
- ✅ Phase 8: Export (PDF, Excel, CSV, JSON)
- ✅ Phase 9: Security (Encryption, Data Isolation, Audit)
- ✅ Phase 10: Scalability (Metrics, Health, Feature Flags)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
