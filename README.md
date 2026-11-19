# Welcome Kit - Personalized Airbnb Local Guide

**Hackathon:** Relate by Neo4j Hackathon (`relate.devpost.com`)  
**Submission Deadline:** Friday, December 11, 2026 @ 6:00 PM PST  
**Theme:** *Context, Connected*  
**Cost:** $0 Forever (100% Free-Tier Deployment)

---

## Executive Summary

**Welcome Kit** transforms static Airbnb house manuals into personalized, graph-powered neighborhood guides. Instead of sending every guest the same generic PDF, hosts set up their property once, guests answer 3 quick taste questions before arrival, and an embedded **Relay by Neo4j** graph database traverses real relationships between the property, local venues, cultural vibe tags, and past guest endorsements to curate a tailored local itinerary.

## Core Architecture

### System Architecture & Free-Tier Stack

* **Frontend:** React + Vite + Tailwind CSS (Airbnb-inspired design system: `#FFFFFF` canvas, `#222222` ink, `#FF385C` coral CTA buttons, `16px` rounded cards) deployed on **Vercel (Hobby Plan — $0)**.
* **Backend & Multi-Agent Engine:** Node.js + Express deployed on **Render (Free Web Service — $0)**.
* **Embedded Graph Database:** **Relate by Neo4j** (`@relate/relate`) running in-process inside Express using **single-file mode** (`./server/data/welcome-kit.rl`). Zero external database servers, zero Neo4j credentials in `.env`, and committed directly to GitHub for instant judge inspection.
* **Persistent App Database:** **MongoDB Atlas (Free M0 Cluster — $0 forever)** storing host accounts, bookings, cached guides, and post-stay feedback. On Render free-tier restarts, Express automatically re-hydrates new MongoDB entries into `./data/welcome-kit.rl` via Cypher `MERGE`.
* **External APIs ($0, No Credit Card Required):**
  * **LLM Reasoning:** Google Gemini Flash (`gemini-3.5-flash-lite` / `gemini-3.8-flash`) or Groq free tier — strictly used to normalize guest tastes and draft warm, host-branded welcome notes grounded in Relate graph results.
  * **Geocoding & Local Spot Discovery:** OpenStreetMap (**Nominatim + Overpass API**) — converts host addresses into coordinates and auto-seeds real nearby cafes, restaurants, parks, and venues on property onboarding.
  * **Local Embeddings (Optional Hybrid Search):** `@xenova/transformers` (`all-MiniLM-L6-v2`) running locally in Node.js for zero-cost semantic + graph search.

## Relate Graph Schema (`./server/data/welcome-kit.rl`)

```text
(:Property {id, name, neighborhood, wifiPass, doorCode, houseRules})
   -[:NEAR {walkMins}]->
(:LocalSpot {id, name, category, description, priceTier, lat, lon})
   -[:HAS_VIBE]->
(:VibeTag {name})  // e.g., jazz, natural_wine, indie_film, family_friendly, pizza, street_food
   <-[:PREFERS]-
(:Guest {id, name, groupType})
   -[:LOVED_SPOT {rating, note}]->
(:LocalSpot)
```

## Environment Variables (`/server/.env`)

No Neo4j URI, username, or password is required because Relate opens `./data/welcome-kit.rl` directly from disk:

```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/welcomekit
GEMINI_API_KEY=your_free_google_ai_studio_key
CLIENT_URL=http://localhost:5173
```

## Hackathon Winning Differentiators ("Plus Points")

### Multi-Agent Shared Memory with Safe Transactions (30 pts — Relate & Connected Context)

* **Guide Curator Agent:** Reads Property -> NEAR -> LocalSpot -> HAS_VIBE <- Guest paths and past guest endorsements to build personalized walking itineraries.
* **Memory & Feedback Agent:** Commits post-stay guest ratings (`:LOVED_SPOT`) into Relate via concurrent-safe transactions without clobbering active reads.

### Graph-First, Zero-Hallucination Guarantee

The LLM never invents places; it only narrates verified subgraphs from Relate, backed by MongoDB response caching (<50ms) and an offline template fallback.

### Browser-Based Interactive Graph Explorer (10 pts Creativity)

Embeds `@relate/relate-wasm` in `/demo/compare` so judges can click nodes and inspect live graph paths directly in the browser.

### Zero-Setup Reproducibility (15 pts Documentation)

Pre-seeded `./server/data/welcome-kit.rl` committed to GitHub + mandatory `relate` repository topic tag + Devpost-compliant `README.md`.

## Monorepo File Structure & 50/50 Ownership

```
airbnb-welcome-kit/
├── .gitignore                              # [Shared] Must NOT ignore *.rl files so welcome-kit.rl commits cleanly
├── README.md                               # [Shared] Devpost-compliant README (Mode, Why, Schema, Setup, Live URLs)
│
├── client/                                 # React + Vite + Tailwind CSS Frontend (Deployed on Vercel)
│   ├── index.html                          # [Shared] App title, Airbnb-style fonts
│   ├── package.json                        # [Shared] react, react-router-dom, lucide-react, qrcode.react, tailwindcss
│   ├── tailwind.config.js                  # [Shared] Airbnb palette (#FFFFFF bg, #222222 ink, #FF385C coral)
│   ├── vercel.json                         # [Member 2] SPA rewrite rule so nested React Router paths never 404
│   └── src/
│       ├── main.jsx                        # [Shared] React root entry
│       ├── App.jsx                         # [Shared] Route definitions
│       ├── index.css                       # [Shared] Tailwind base imports & custom scrollbars
│       │
│       ├── services/
│       │   └── api.js                      # [Shared] Centralized Axios/fetch client reading VITE_API_URL + cold-start handler
│       │
│       ├── components/
│       │   ├── Navbar.jsx                  # [Shared] Clean Airbnb-style top bar with quick switch to Judge Demo Mode
│       │   ├── LocalSpotCard.jsx           # [Member 2] Rounded 16px spot card, walking-time pill, price tier, Graph Trace trigger
│       │   ├── GraphTraceDrawer.jsx        # [Member 2] Expandable "Why This Spot?" node-and-edge path viewer
│       │   ├── CategoryFilterBar.jsx       # [Member 2] Horizontal icon filter tabs (All, Coffee, Food & Wine, Music, Hidden Gems)
│       │   ├── QuickCopyEssentials.jsx     # [Member 1] One-tap copy cards for Wi-Fi Password, Door Code & Check-Out Time
│       │   ├── HostApprovalModal.jsx       # [Member 1] Editable AI welcome note + one-click Approve & QR Code generator
│       │   └── ConciergeChatDrawer.jsx     # [Member 1] Slide-up AI House & Neighborhood Concierge mobile chat widget
│       │
│       └── pages/
│           ├── HostDashboard.jsx           # [Member 1] Screen 1: Property setup form, Host Impact ROI banner & booking queue
│           ├── GuestTasteIntake.jsx        # [Member 2] Screen 3: 3-question check-in (Music, Food, Film + Group Mode toggle)
│           ├── GuestWelcomeGuide.jsx       # [Member 2] Screen 4: Personalized guide, category filters, thumbs-up/down feedback
│           └── JudgeSplitDemo.jsx          # [Member 2] Screen 5: Side-by-side comparison + live subgraph view (@relate/relate-wasm)
│
└── server/                                 # Node.js + Express + Relate Backend (Deployed on Render)
    ├── .env.example                        # [Shared] PORT, MONGODB_URI, GEMINI_API_KEY, CLIENT_URL
    ├── package.json                        # [Shared] express, mongoose, cors, dotenv, @relate/relate, @google/generative-ai
    ├── server.js                           # [Shared] Express entry point, CORS setup, startup hydration trigger, route mounting
    │
    ├── data/
    │   └── welcome-kit.rl                  # [Shared] Persistent Relate single-file store (COMMITTED TO GITHUB)
    │
    ├── config/
    │   ├── mongo.js                        # [Member 1] MongoDB Atlas Mongoose connection helper
    │   └── relate.js                       # [Member 1] Singleton Relate single-file opener & safe transaction helper
    │
    ├── models/
    │   ├── Property.js                     # [Member 1] Mongoose schema: host property info, Wi-Fi, doorCode, houseRules
    │   ├── Booking.js                      # [Member 1] Mongoose schema: guest info, shareToken, approvalStatus, welcomeDraft
    │   ├── CachedGuide.js                  # [Member 2] Mongoose schema: cached guides keyed by (propertyId + sortedVibesHash)
    │   └── Feedback.js                     # [Member 2] Mongoose schema: post-stay spot ratings for Render restart hydration
    │
    ├── utils/
    │   ├── seedRelate.js                   # [Member 1] Seeds initial properties, spots, vibes & past guests into welcome-kit.rl
    │   ├── hydrateRelate.js                # [Member 1] Startup sync: MERGEs MongoDB properties & ratings into Relate on Render boot
    │   ├── osmDiscovery.js                 # [Member 1] Free OpenStreetMap (Nominatim + Overpass) local spot auto-seeder
    │   └── llmClient.js                    # [Member 2] Gemini Flash / Groq wrapper with offline template fallback
    │
    ├── agents/
    │   ├── conciergeAgent.js               # [Member 1] Grounded Q&A agent over house manual + Relate property subgraph
    │   ├── guideCuratorAgent.js            # [Member 2] Multi-hop Cypher taste traversal + Group Mode blender + welcome writer
    │   └── feedbackMemoryAgent.js          # [Member 2] Safe Relate transaction writer for post-stay :LOVED_SPOT ratings
    │
    ├── controllers/
    │   ├── hostController.js               # [Member 1] Logic for property creation, booking creation, approval & concierge chat
    │   └── guestController.js              # [Member 2] Logic for taste intake, guide generation, feedback & split-screen compare
    │
    └── routes/
        ├── hostRoutes.js                   # [Member 1] POST /api/properties, PATCH /api/bookings/:id/approve, POST /api/concierge/chat
        └── guestRoutes.js                  # [Member 2] POST /api/guides/generate, POST /api/feedback, GET /api/demo/compare
```

## Step-by-Step Execution Roadmap

### Phase 1: Setup & Relate Graph Core (Days 1–2)

* [ ] Create public GitHub repo tagged with relate (relate-neo4j-hackathon).
* [ ] Install `@relate/relate` in `/server`, run `seedRelate.js` to populate `./data/welcome-kit.rl`, and commit the `.rl` file to GitHub.

### Phase 2: Backend API & Multi-Agent Engine (Days 3–5)

* [ ] Connect MongoDB Atlas (Free M0) and implement `hydrateRelate.js` startup MERGE sync.
* [ ] Build `guideCuratorAgent.js` (multi-hop Cypher traversal + Group Mode + LLM welcome note + MongoDB cache).
* [ ] Build `feedbackMemoryAgent.js` (safe Relate transaction rating writer) and `conciergeAgent.js` (grounded Q&A).

### Phase 3: Airbnb-Inspired Frontend UI (Days 4–7 — Parallel)

* [ ] Build Host Dashboard, Approval Modal with QR generator, Guest 3-Question Taste Intake, and Personalized Welcome Guide.

### Phase 4: Visual Graph Differentiators (Days 8–9)

* [ ] Implement expandable "Why This Spot?" Graph Trace Drawer on every spot card.
* [ ] Build Split-Screen Judge Demo (`/demo/compare`) with interactive browser graph view (`@relate/relate-wasm`).

### Phase 5: Free-Tier Deployment & Testing (Day 10)

* [ ] Member 1 (MongoDB Atlas + Render): Create free M0 MongoDB cluster (0.0.0.0/0 network access) and deploy `/server` (Root Directory: server, Build: npm install, Start: npm start) to a Render Free Web Service with MONGODB_URI, GEMINI_API_KEY, and CLIENT_URL.
* [ ] Member 2 (Vercel): Deploy `/client` (Root Directory: client, Framework: Vite) to Vercel with VITE_API_URL pointing to Render and client/vercel.json handling SPA rewrites.
* [ ] Both: Lock in production CORS on Render, verify cold-start re-hydration, and test end-to-end flows.

### Phase 6: Documentation & Submission (Days 11–12)

* [ ] Complete README.md with Relate single-file mode details, graph schema, setup commands, and live Vercel/Render links.
* [ ] Record a 1–2 minute demo video showcasing host setup, guest check-in, split-screen comparison with live graph paths, and post-stay feedback updating the graph.
* [ ] Submit on Devpost before December 11, 2026 @ 6:00 PM PST.

## Step 1: Shared Foundation (On `main`)

* **Both Members:**
  * `chore: initialize client and server folder structure with packages and tailwind`
  * `feat: add base server.js, App.jsx, api.js, and initial seeded welcome-kit.rl`

## Step 2: Parallel Feature Commits (On Separate Branches)

### Member 1 Commits (`feat/host-seeding-concierge`)

1. `feat(db): add MongoDB Atlas and embedded Relate singleton configs`
2. `feat(seed): add Relate seed script, OpenStreetMap spot discovery, and startup hydration`
3. `feat(api): add Property and Booking models, host controllers, and routes`
4. `feat(agent): implement grounded house concierge chat agent`
5. `feat(ui): build HostDashboard, HostApprovalModal with QR, and QuickCopyEssentials`
6. `feat(ui): add slide-up ConciergeChatDrawer widget`

### Member 2 Commits (`feat/guest-matching-demo`)

1. `feat(models): add CachedGuide and Feedback Mongoose schemas`
2. `feat(agent): add LLM client with fallback and multi-hop GuideCuratorAgent`
3. `feat(agent): add transaction-safe FeedbackMemoryAgent for post-stay ratings`
4. `feat(api): add guest controllers, routes, and /api/demo/compare endpoint`
5. `feat(ui): build GuestTasteIntake 3-question flow and CategoryFilterBar`
6. `feat(ui): build GuestWelcomeGuide, LocalSpotCard, and GraphTraceDrawer`
7. `feat(ui): build JudgeSplitDemo side-by-side comparison and vercel.json`

## Step 3: Merge & Deployment Commits (Back on `main`)

* **Member 1:**
  * `merge: integrate feat/host-seeding-concierge into main`
  * `chore(deploy): configure production CORS and Render backend settings`
* **Member 2:**
  * `merge: integrate feat/guest-matching-demo into main`
  * `feat(polish): add demo autofill presets and cold-start loading banner`
* **Both Members:**
  * `docs: finalize Devpost README with Relate schema, setup, and live links`

Complete submission on Devpost before December 11, 2026 @ 6:00 PM PST.# NestNote
