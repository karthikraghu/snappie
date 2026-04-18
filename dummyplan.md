We are now planning a **GCP-only, mobile-first app** where a user uploads a photo of an ordinary object, Google Cloud turns it into a fantasy RPG artifact with stats and lore, generates an epic voiceover, and stores the result for the frontend to display. [cloud.google](https://cloud.google.com/products/firestore)

## What we’re building

The product is a web app called something like **Legendary Loot Forge**: the user snaps a photo of a boring real-world item, uploads it, and gets back a magical item card with a name, rarity, stats, lore, and narration. [docs.cloud.google](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/2-5-flash)

The key change is that we are no longer pitching this as a Firebase-heavy stack; we are pitching it as a **native Google Cloud architecture** built around Cloud Run, Cloud Storage, Eventarc, Vertex AI, Vision API, Text-to-Speech, and Firestore. [docs.cloud.google](https://docs.cloud.google.com/run/docs/triggering/storage-triggers)

## Final architecture

| Part | GCP product | Role |
|---|---|---|
| Frontend | Cloud Run | Hosts the mobile-first web app.  [docs.cloud.google](https://docs.cloud.google.com/run/docs/triggering/trigger-with-events) |
| Upload storage | Cloud Storage | Stores uploaded images and generated audio files.  [docs.cloud.google](https://docs.cloud.google.com/run/docs/triggering/storage-triggers) |
| Event trigger | Eventarc | Detects new image uploads and starts processing.  [docs.cloud.google](https://docs.cloud.google.com/run/docs/triggering/trigger-with-events) |
| Backend | Cloud Run service or function | Orchestrates the pipeline after upload.  [docs.cloud.google](https://docs.cloud.google.com/run/docs/triggering/trigger-with-events) |
| Object detection | Cloud Vision API | Figures out what the uploaded object is.  [docs.cloud.google](https://docs.cloud.google.com/run/docs/triggering/storage-triggers) |
| RPG generation | Vertex AI Gemini 2.5 Flash | Produces structured item JSON, lore, and game flavor.  [docs.cloud.google](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/2-5-flash) |
| Voiceover | Cloud Text-to-Speech | Generates dramatic narration audio.  [docs.cloud.google](https://docs.cloud.google.com/release-notes) |
| Data store | Firestore | Saves item metadata, status, and asset URLs.  [cloud.google](https://cloud.google.com/products/firestore) |

## End-to-end flow

1. The user uploads an image from the web app to **Cloud Storage**. [docs.cloud.google](https://docs.cloud.google.com/run/docs/triggering/storage-triggers)
2. That upload triggers **Eventarc**, which invokes our serverless backend on **Cloud Run**. [docs.cloud.google](https://docs.cloud.google.com/run/docs/triggering/trigger-with-events)
3. The backend calls **Cloud Vision API** to detect the object labels and useful visual cues. [docs.cloud.google](https://docs.cloud.google.com/run/docs/triggering/storage-triggers)
4. The backend passes those cues to **Vertex AI Gemini 2.5 Flash**, which returns strict structured output for the RPG item. [docs.cloud.google](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/model-versions)
5. The backend sends the lore text to **Cloud Text-to-Speech** to generate an audio narration file. [docs.cloud.google](https://docs.cloud.google.com/release-notes)
6. The backend stores the final metadata in **Firestore** and keeps image/audio assets in **Cloud Storage**. [firebase.google](https://firebase.google.com/docs/firestore)
7. The frontend fetches the completed artifact and shows the reveal card to the user. [cloud.google](https://cloud.google.com/products/firestore)

## Why this is the plan

This version is better because it is clearly **GCP-only**, uses the current event-driven Google Cloud pattern with **Eventarc + Cloud Run**, and uses **Gemini 2.5 Flash** as the modern fast model for structured generation on Vertex AI. [docs.cloud.google](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/2-5-flash)

It also sounds cleaner to judges because every service has one purpose: Storage ingests assets, Eventarc triggers work, Vision interprets the photo, Vertex AI invents the artifact, Text-to-Speech adds immersion, and Firestore stores app state. [cloud.google](https://cloud.google.com/products/firestore)

## What we are not doing

We are **not** centering the architecture on Firebase Hosting or Firebase-first wording anymore, because the requirement is to stay within GCP products and keep the story firmly Google Cloud-native. [docs.cloud.google](https://docs.cloud.google.com/run/docs/triggering/trigger-with-events)

We are also **not** using an old Gemini 1.5 Flash pitch as the main model story, because Gemini 2.5 Flash is the more current fast model line on Vertex AI. [docs.cloud.google](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/model-versions)

## Short version to say aloud

“We’re building a mobile-first web app on Google Cloud where users upload a photo of an everyday object, Cloud Storage and Eventarc trigger a serverless backend on Cloud Run, Cloud Vision identifies the object, Vertex AI Gemini 2.5 Flash turns it into a legendary RPG item, Text-to-Speech gives it an epic narration, and Firestore stores the result for instant display in the app.” [docs.cloud.google](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/2-5-flash)

