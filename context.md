# Snappie — Project Context

> **Read this file first in every new session.** It tells you what this project is, what tech we use, and where things live.

---

## What is Snappie?

Snappie is a **mobile-first web app** where a user takes a photo of an ordinary real-world object (a mug, a pen, a shoe) and the app transforms it into a **legendary RPG artifact** — complete with a fantasy name, rarity, stats, lore backstory, and an epic AI-generated voiceover narration.

**One-liner:** "Snap a photo. Get a legendary item."

---

## Who is this for?

This is a **GCP showcase project** — designed to demonstrate native Google Cloud architecture to judges/reviewers. Every service must be a GCP product. No AWS, no Azure, no third-party AI APIs.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **App Platform (Full-Stack)** | Next.js (App Router), Node.js | Consolidates frontend and backend into a single serverless repository. Fast, type-safe (TypeScript). |
| **Frontend Style** | Tailwind CSS, Retro UI | Distinctive Neo-Brutalism aesthetic. Bright colors, thick borders. |
| **Object Storage** | Cloud Storage | Stores uploaded images and generated audio files. |
| **Event Bus** | Eventarc | Detects new uploads in Cloud Storage → triggers backend API route. |
| **Object Detection** | Cloud Vision API | Identifies what the uploaded object is (labels, descriptions). |
| **RPG Generation** | Vertex AI — Gemini 2.5 Flash | Generates structured JSON: item name, rarity, stats, lore. |
| **Voiceover** | Cloud Text-to-Speech | Converts lore text into dramatic narration audio. |
| **Database** | Firestore | Stores item metadata, processing status, and asset URLs. |

---

## Architecture Flow

```
User uploads photo via Next.js
       │
       ▼
  Cloud Storage (bucket: snappie-uploads)
       │
       ▼ (Eventarc trigger)
       │
  Next.js API Route (`POST /api/process`)
       │
       ├─► Cloud Vision API Node SDK → object labels
       │
       ├─► Vertex AI Gemini 2.5 Flash Node SDK → RPG item JSON
       │
       ├─► Cloud Text-to-Speech Node SDK → narration audio (.mp3)
       │
       ├─► Save audio to Cloud Storage (bucket: snappie-assets)
       │
       └─► Save metadata to Firestore (collection: items)
       
  Next.js Frontend polls frontend API for completed item → shows reveal card
```

---

## Project Structure (Target)

```
snappie/
├── context.md              # This file — project context
├── plan.md                 # Detailed build plan with phases
└── frontend/               # Next.js Full Stack App
    ├── src/app/
    │   ├── login/          # Frontend login page
    │   ├── dashboard/      # Frontend dashboard page
    │   ├── page.tsx        # Frontend snap/camera landing page
    │   └── api/            # Backend API Routes
    │       ├── upload/route.ts
    │       ├── item/[id]/route.ts
    │       └── process/route.ts
    ├── src/components/     # React UI Components
    └── src/lib/            # Backend SDKs & logic
        ├── gcp/            # Real Cloud SDK integrations
        └── mock/           # Fake local implementations for testing
```

---

## Key Data Models

### User Session (Frontend Mock)

```json
{
  "userId": "guest_123456",
  "isGuest": true,
  "createdAt": "2026-04-18T10:00:00Z"
}
```

### RPG Item (Firestore document in `items` collection)

```json
{
  "id": "auto-generated",
  "userId": "guest_123456",
  "status": "uploading | processing | completed | failed",
  "originalImageUrl": "gs://snappie-uploads/...",
  "detectedObject": "coffee mug",
  "visionLabels": ["mug", "ceramic", "drinkware"],
  "item": {
    "name": "Chalice of Eternal Warmth",
    "rarity": "Legendary",
    "type": "Artifact",
    "stats": {
      "power": 85,
      "defense": 20,
      "magic": 95,
      "durability": 60
    },
    "lore": "Forged in the volcanic springs...",
    "specialAbility": "Grants immunity to frost damage"
  },
  "narrationAudioUrl": "gs://snappie-assets/audio/...",
  "createdAt": "2026-04-18T10:00:00Z",
  "completedAt": "2026-04-18T10:00:12Z"
}
```

---

## API Contract

### POST /api/upload
- **Input:** `multipart/form-data` with image file & `userId`
- **Response:** `{ "itemId": "abc123", "status": "processing" }`
- **What it does:** Saves image to Cloud Storage, creates Firestore doc.

### GET /api/item/{itemId}
- **Input:** Item ID in URL path
- **Response:** Full RPG item JSON (see data model above)
- **What it does:** Reads from Firestore, returns current status and data.

---

## Environment & Config

| Variable | Description |
|---|---|
| `GCP_PROJECT_ID` | Google Cloud project ID |
| `GCS_UPLOAD_BUCKET` | Bucket for user-uploaded images |
| `GCS_ASSETS_BUCKET` | Bucket for generated audio files |
| `FIRESTORE_COLLECTION` | Collection name for items (default: `items`) |

---

## Important Constraints

1. **GCP-only Backend Services** — No AWS, Azure, or third-party AI services. Node.js native SDKs only.
2. **Mobile-first** — Next.js layout must be responsive.
3. **Neo-Brutalism UI** — Utilize RetroUI CSS rules for stark, bold blocks.
4. **Serverless** — Cloud Run scales to zero.
5. **Event-driven** — Upload triggers processing automatically via Eventarc.

---

*Last updated: 2026-04-18*
