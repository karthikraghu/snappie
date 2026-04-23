# Snappie

This project was built to explore and integrate Google Cloud Platform services: Firestore, Cloud Storage, Vertex AI, and Google Vision.

## How it works

Snappie transforms physical objects into digital RPG items through a multi-stage cloud pipeline. 

The process begins when a user captures an image. Google Vision identifies the object and its characteristics. Vertex AI (Gemini 1.5) then processes this visual metadata to generate a unique name, rarity level, and thematic lore. Simultaneously, Imagen 3 generates stylized artwork, and Cloud Text-to-Speech creates a voiceover for the item description. All metadata and assets are persisted in Firestore and Cloud Storage buckets for instant retrieval.

## Architecture

![Architecture Diagram](./image.png)

## Running the Application

1. Clone the repository.
2. Create a .env.local file in the frontend directory with your GCP and Firebase credentials.
3. Install dependencies using npm install.
4. Start the development server with npm run dev.
