# Structa AI

## System Architecture Document

---

## 1. Overview

**Structa AI** is an AI powered mobile application that captures physical documents using a device camera and converts them into structured digital formats such as text, tables, and spreadsheets.

The system follows a **mobile thin client + AI heavy backend** architecture to ensure performance, scalability, and fast iteration.

---

## 2. High Level Architecture

```
┌─────────────┐
│  Mobile App │  (Expo / React Native)
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────┐
│  API Layer  │  (Auth, Upload, Jobs)
└──────┬──────┘
       │ Async Jobs
       ▼
┌─────────────┐
│ AI Pipeline │  (OCR, Tables, Structuring)
└──────┬──────┘
       │ Results
       ▼
┌─────────────┐
│  Storage    │  (Images, JSON, Exports)
└─────────────┘
```

---

## 3. Mobile Application Architecture

### 3.1 Technology Stack

* Expo CLI (Managed Workflow)
* React Native
* TypeScript
* Expo Camera
* Expo Image Manipulator
* Expo File System
* Expo Updates

---

### 3.2 Mobile App Layers

#### Presentation Layer

* Screens
* Navigation
* UI state
* Error and loading states

#### Domain Layer

* Scan workflows
* Document state machine
* Export logic
* Permission handling

#### Infrastructure Layer

* Camera integration
* Image preprocessing
* Upload manager
* API client

---

### 3.3 Mobile Core Modules

**Camera Module**

* Document capture
* Auto crop overlay
* Multi page scanning

**Image Preprocessing**

* Resize and compress
* Orientation correction
* Basic enhancement

**Upload Manager**

* Background upload
* Retry and resume
* Offline queue

**Result Viewer**

* Block based rendering
* Text blocks
* Table blocks
* Confidence highlighting

**Export Module**

* PDF export
* Excel export
* Text export
* Share intent

---

### 3.4 Mobile Data Models

```ts
Document {
  id: string
  status: pending | processing | completed | failed
  pages: Page[]
  blocks: Block[]
  createdAt: string
}

Page {
  id: string
  imageUri: string
}

Block {
  type: text | table | number
  content: any
  confidence: number
}
```

---

## 4. Backend Architecture

### 4.1 Backend Stack

* Node.js or NestJS API
* Python AI workers
* REST APIs
* Message Queue (Redis or SQS)
* Object Storage (S3 compatible)

---

### 4.2 Backend Core Services

**API Service**

* Authentication
* Scan creation
* Image upload
* Status polling
* Result delivery

**Job Orchestrator**

* Creates processing jobs
* Tracks job state
* Coordinates AI workers

**AI Worker Services**

* Image preprocessing
* OCR service
* Table detection
* Data structuring

**Export Service**

* PDF generation
* Excel generation

---

### 4.3 Backend Data Flow

1. Client uploads scanned image
2. API stores raw image
3. Job created in queue
4. AI pipeline processes image
5. Structured JSON generated
6. Export files created
7. Client fetches results

---

## 5. AI Processing Pipeline

```
Image
  ↓
Preprocessing
  ↓
OCR (Printed + Handwritten)
  ↓
Layout Detection
  ↓
Table Extraction
  ↓
Structuring Engine
  ↓
Structured JSON
```

---

## 6. Data Storage

**Object Storage**

* Raw images
* Processed images
* Exported files

**Database**

* Documents metadata
* Job status
* Usage tracking

---

## 7. Security and Compliance

* HTTPS only
* Signed upload URLs
* Data isolation per user
* Explicit camera permission usage
* User initiated uploads only

---

## 8. Scalability Considerations

* Stateless API services
* Horizontally scalable AI workers
* Queue based job processing
* Storage decoupled from compute

---

## 9. Play Store Compliance

* Clear camera permission disclosure
* Visible upload indicators
* Privacy policy alignment
* No background capture

---

## 10. Future Extensions

* Document type detection
* AI cleanup and summarization
* Formula recognition
* Cloud sync
* Team collaboration

---

## 11. Repository Structure (Mobile)

```
structa-ai-mobile/
│
├── app/
│   ├── screens/
│   ├── components/
│   ├── hooks/
│   └── navigation/
│
├── domain/
│   ├── models/
│   ├── services/
│   └── workflows/
│
├── infra/
│   ├── camera/
│   ├── upload/
│   ├── api/
│   └── storage/
│
├── assets/
├── app.config.ts
└── ARCHITECTURE.md
```

---

## 12. Architecture Summary

Structa AI follows:

* Thin mobile client
* AI heavy backend
* Async job processing
* Structured data first design
* Fast iteration and scalability

---
