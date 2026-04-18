# Snappie — Master Build Plan

> **This is the single source of truth for building Snappie.** Follow the phases in order. Each phase has clear inputs, outputs, and acceptance criteria. Do not skip ahead.

---

## 📌 Project Status Tracker
- **[✅ DONE] Phase 1: Frontend Shell** -> Next.js, Tailwind, and RetroUI Neo-brutalism UI complete. WebRTC camera integrates and runs fake frontend-only state flows.
- **[✅ DONE] Phase 2: Backend API (Local, Mocked)** -> Constructed the Next.js API Routes and local mock services SDK. Frontend now natively polls the backend for RPG generation.
- **[✅ DONE] Phase 3: GCP Service Integration** -> Upgrading our mock services SDK to real `@google-cloud/` Node SDKs hitting live infrastructure.
- **[▶️ NEXT] Phase 4: Event-Driven Pipeline** -> Decoupling the pipeline execution from the Next.js POST request into a resilient Eventarc webhook pattern.
- **[⏳ PENDING] Phase 5: Deploy to Cloud Run** -> Deploying the unified Next.js Full-Stack App to Google Cloud via Docker.
- **[⏳ PENDING] Phase 6: Polish & Demo Prep** -> Error handling, TTS audio player logic, and presentation polish.

---

## Build Philosophy

We build in **6 phases**, each producing something **testable and demoable**:

```
Phase 1: Frontend Shell (static, no backend)
    ↓
Phase 2: Backend API (local, mocked GCP services)
    ↓
Phase 3: GCP Service Integration (real APIs, local dev)
    ↓
Phase 4: Event-Driven Pipeline (Eventarc wiring)
    ↓
Phase 5: Deploy to Cloud Run (production)
    ↓
Phase 6: Polish & Demo Prep
```

**Why this order?**
- Frontend first = you can see progress immediately and design the UX without waiting for backend
- Backend with mocks = you can develop the API contract without GCP costs
- GCP integration = swap mocks for real services one at a time
- Event pipeline = wire up the automated flow last (hardest to debug, so we want everything else solid first)
- Deploy = only after everything works locally
- Polish = animations, error states, loading states, demo script

---

## Phase 1 — Frontend Shell (Next.js + RetroUI)

**Goal:** Build the complete mobile-first UI using Next.js, Tailwind CSS, and RetroUI components with fake/hardcoded data. No backend calls or actual Auth yet.

**Why first?** The frontend defines what data we need. Once we know exactly what the card displays, we know exactly what the backend must produce. This is called **"design backward from the output."**

### Step 1.1 — Next.js Project Scaffolding

Create the Next.js app inside `frontend/`:
- Use **Next.js App Router**, **TypeScript**, and **Tailwind CSS**.
- Folder structure will follow standard Next.js conventions (`app/`, `components/`, `lib/`).

**Acceptance:** `npm run dev` opens the boilerplate Next.js app on `localhost:3000`.

---

### Step 1.2 — Design System & Base Styles (RetroUI)

Configure `tailwind.config.ts` and `globals.css` with the **Neo-Brutalism RetroUI** aesthetic:
- **Thick Borders**: `border-4 border-black` on components.
- **Hard Shadows**: Solid colored offset box-shadows (e.g., `box-shadow: 4px 4px 0px #000`).
- **Dynamic Colors**: Bright web-safe colors (cyan, magenta, bright yellow) instead of dark tones. 
- **Typography:** *Archivo Black* for headings and *Space Grotesk* for body text.

**Acceptance:** Base CSS variables and font families are successfully loaded and a simple neo-brutalist button renders correctly.

---

### Step 1.3 — Auth / Login Flow (`/login`)

Build the Signup/Login page:
- A bold, bright landing screen with the Snappie logo.
- A chunky "Login as Guest" button.
- Saves a mock `guest` session strictly on the client (e.g., using React Context or Local Storage).
- Redirects seamlessly to the Capture screen.

**Acceptance:** User clicks "Login as Guest", mock session is created, and user is routed to `/`.

---

### Step 1.4 — Snap / Camera Homepage (`/`)

Build the main camera view:
- A full-screen or large viewport-filling camera stream using WebRTC (`navigator.mediaDevices.getUserMedia`).
- A large, colorful, retro "SNAP" button.
- After snapping, renders a picture preview overlay on an HTML `<canvas>`.
- The preview has a bold CTA: "Forge Item!".

**Acceptance:** User can load the screen, approve camera permissions, see the feed, and snap a picture.

---

### Step 1.5 — Processing & Reveal View

Build the transition state and reveal artifact:
- **Loading State:** Fun retro processing animations (e.g., pixelated hourglass, "Forging Magic...").
- **Reveal Card (`RetroCard`):** Displays the uploaded image, fantasy name, rarity, and stats.
- Stats progress bars feature heavy black outlines and bold fills.
- Audio play button for narration.

**Acceptance:** After clicking "Forge", a fake timer runs, followed by a fully styled, beautifully graphic mock Item Card appearing.

---

### Step 1.6 — Dashboard / Collection (`/dashboard`)

Build the gallery:
- A Neo-brutalist card grid showing previously generated items.
- Displays thumbnail, item name, and rarity.
- Clicking an item expands it to show full details.
- Add a bottom/top global navigation bar to switch between Snap and Dashboard.

**Acceptance:** Gallery grid renders mock items. Clicking an item shows the detailed view.

---

### Phase 1 Deliverable

A **fully functional Next.js UI** deployed locally. You can log in as a guest, permit the camera, snap a photo, view the resulting "fake" RPG item, and browse a mock dashboard. No Python backend required yet.

---

## Phase 2 — Next.js Backend API (Local, Mocked Services)

**Goal:** Build the Next.js API routes (`src/app/api/...`) utilizing a Mock Service layer. This enables frontend contract integration without incurring GCP API costs or setting up credentials yet.

### Step 2.1 — Mock Service Layer (`src/lib/mock/`)
Build TypeScript classes mapped to our API dependencies:
- **`storage.ts`**: Fakes uploading files, returns a dummy `gs://` bucket URL.
- **`firestore.ts`**: Uses a singleton JS `Map()` to act as an in-memory database to store our item states.
- **`vision.ts`**: Returns hardcoded label arrays (e.g., `["mug", "cup"]`).
- **`gemini.ts`**: Returns a static `RPGItem` configuration after a 1s delay.
- **`tts.ts`**: Returns a local placeholder `.mp3` path.

### Step 2.2 — Next.js API Routes
Implement the Next.js App Router API endpoints:
- **`POST /api/upload`**: Accepts `FormData`, saves via `mock/storage.ts`, creates a pending item via `mock/firestore.ts`, and fires off background asynchronous promise to simulate Eventarc processing.
- **`GET /api/item/[id]`**: Queries our `mock/firestore.ts` DB. Returns HTTP 200 with the item details (or `status: "processing"`).

### Step 2.3 — Process Pipeline Logic
Construct a central `lib/pipeline.ts` function:
1. Receives image URI.
2. Pass to Vision mock.
3. Pass labels to Gemini mock.
4. Pass lore to TTS mock.
5. Update Firestore item status to "completed".

### Step 2.4 — Connect Frontend to API
Replace the `mockData.ts` timeouts currently operating in `src/app/page.tsx` with real Javascript `fetch()` calls polling `/api/item/[id]` until it registers as "completed".

**Phase 2 Deliverable:** A completely local full-stack prototype.

---

## Phase 3 — GCP Service Integration (Real APIs, Local Dev)

**Goal:** Swap out `src/lib/mock/` with real Node.js `@google-cloud/*` SDKs.

### Step 3.1 — Setup GCP Configs
- Enable `vision`, `aiplatform`, `texttospeech`, `firestore`, `storage` APIs.
- Generate a local Service Account Key.

### Step 3.2 — Node SDK Replacements
- Install `@google-cloud/storage`, `@google-cloud/firestore`, `@google-cloud/vision`, `@google-cloud/vertexai`, and `@google-cloud/text-to-speech`.
- Create `src/lib/gcp/...` wrappers mapping seamlessly over our existing pipeline calls.
- Provide a `config.ts` flag (`USE_MOCKS=false`) to easily toggle to the live cloud services.

**Phase 3 Deliverable:** Front-to-back Next.js application triggering actual Gemini generations and caching against a live Firestore database.

---

## Phase 4 — Event-Driven Pipeline (Eventarc)

**Goal:** Decouple standard API background execution into Cloud Storage Eventarc triggers. 

### Step 4.1 — Eventarc Webhook Target
- Build a new `POST /api/process` route handler designed exclusively for `CloudEvent` payload ingestion.
- Expose this route using Cloud Run.

### Step 4.2 — Provision Eventarc
- `gcloud eventarc triggers create ...` routing upload bucket finalised events precisely to `/api/process`.

**Phase 4 Deliverable:** System architecture exactly matching the proposed GCP diagram.

---

## Phase 5 — Deploy Full-Stack App to Cloud Run

**Goal:** Package Next.js and host the application globally.

### Step 5.1 — Next.js Dockerfile
- Draft a lightweight `Dockerfile` for Next.js standalone mode.
- Establish `cloudbuild.yaml` steps.

### Step 5.2 — Cloud Run Deployment
- Map GCP secrets, configure memory allowances for server-side React execution, and deploy the unified UI/API service logic.

---

## Phase 6 — Polish & Demo Prep

**Goal:** Ensure the presentation dazzles reviewers.
- Real loading bars tied to XMLHttpRequest data streams.
- Better error handling states (handling bad Gemini JSONs natively).
- Open Graph tags.

---

*This plan is a living document. Update it as decisions change.*
*Last updated: 2026-04-18*
