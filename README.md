# Mini Instagram – Full-Stack Photo Sharing Platform & System Design
> **University DevOps & System Design Project (20 Marks Evaluation)**  
> **Prepared by:** Shivani & Team · **Target Scale:** 10M registered users · 2M DAU  
> **System Design Document:** [docs/SYSTEM_DESIGN_PHASE_4_5.md](docs/SYSTEM_DESIGN_PHASE_4_5.md)  
> **Vercel Deployment Guide:** [docs/VERCEL_DEPLOYMENT_GUIDE.md](docs/VERCEL_DEPLOYMENT_GUIDE.md)

[![Continuous Integration (CI)](https://github.com/AayanA20/DevOps_Project/actions/workflows/ci.yml/badge.svg)](https://github.com/AayanA20/DevOps_Project/actions/workflows/ci.yml)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20Deployment-success?logo=vercel)](https://mini-instagram-eta.vercel.app)
[![Docker Ready](https://img.shields.io/badge/Docker-Multi--Container%20Compose-blue?logo=docker)](docker-compose.yml)
[![Tests Passing](https://img.shields.io/badge/Tests-37%2F37%20Passing-brightgreen)](backend/tests/)

---

## 🌐 Live Production Links

* **Live Web Application:** [https://mini-instagram-eta.vercel.app](https://mini-instagram-eta.vercel.app)
* **Live API Health Endpoint:** [https://mini-instagram-eta.vercel.app/health](https://mini-instagram-eta.vercel.app/health)
* **Live System Architecture & Capacity Telemetry:** [https://mini-instagram-eta.vercel.app/api/v1/system/architecture](https://mini-instagram-eta.vercel.app/api/v1/system/architecture)
* **GitHub Repository:** [https://github.com/AayanA20/DevOps_Project](https://github.com/AayanA20/DevOps_Project)

---

## 📸 Project Overview

**Mini Instagram** is a full-stack social media application and distributed system design project. It combines:
1. **Part A (System Design – Phase 4 & 5):** A comprehensive architectural design capable of handling **10M registered users, 2M Daily Active Users (DAU), 7,000 peak RPS**, polyglot persistence, Redis cache-aside caching, Kafka event streaming, and hybrid feed fan-out.
2. **Part B (DevOps Prototype):** A clean, modular, production-grade full-stack application (React + Vite + Tailwind CSS + Node.js Express + Mongoose) implementing versioned REST endpoints (`/api/v1`), Gateway rate limiting, idempotency keys, Redis-compatible caching, and asynchronous outbox event processing.

---

## 🏛️ System Architecture (Phase 5)

### High-Level Architecture (Figure 1)
```mermaid
graph TD
    subgraph Clients["Clients"]
        Android["Android App"]
        iOS["iOS App"]
        Web["Web App"]
    end

    subgraph EdgeStorage["Edge & Storage Layer"]
        CDN["CDN (Edge Cache)<br/>Images & Video Delivery"]
        S3["S3 Object Storage<br/>raw/ (Private) & public/ (Transcoded)"]
    end

    subgraph Ingress["Ingress Infrastructure"]
        LB["Layer 7 Load Balancer<br/>TLS Termination · Health Checks"]
        GW["API Gateway<br/>JWT Auth · Redis Rate Limiting · Route Dispatch"]
    end

    subgraph Microservices["Stateless Application Services (Autoscaled)"]
        UserSvc["User Service<br/>Auth & Profiles"]
        PostSvc["Post Service<br/>Post Creation & Reads"]
        FeedSvc["Feed Service<br/>Hybrid Feed Aggregation"]
        SocialSvc["Social Graph Service<br/>Follow & Unfollow"]
        EngageSvc["Like / Comment Service<br/>Engagement & Counters"]
        NotifSvc["Notification Service<br/>Delivery & Read State"]
        SearchSvc["Search Service<br/>Elasticsearch Queries"]
    end

    subgraph Messaging["Kafka Event Bus (RF = 3)"]
        Kafka["Kafka Topics<br/>post-events · engagement-events · graph-events"]
    end

    subgraph Workers["Asynchronous Consumer Groups"]
        MediaProc["media-processor<br/>Thumbnails 150/640/1080px"]
        FeedBld["feed-builder<br/>Push post IDs to follower feeds"]
        NotifSend["notification-sender<br/>Likes, comments & follow alerts"]
        SearchIdx["search-indexer<br/>Update Elasticsearch indexes"]
        CounterUpd["counter-updater<br/>Reconcile counts & analytics"]
    end

    subgraph Persistence["Polyglot Data Layer"]
        RedisNode["Redis Cluster (64 GB)<br/>Feeds, Cache, Counters, Sessions"]
        PGNode["PostgreSQL (Sharded)<br/>Users, Follows (1 Primary + 3 Replicas)"]
        CassNode["Cassandra Cluster (RF = 3)<br/>Posts, Comments, Likes, Durable Feeds"]
        ESNode["Elasticsearch Cluster<br/>Inverted Search Indexes"]
    end

    Clients -->|Direct Media Download| CDN
    CDN -->|Cache Miss Origin| S3
    Clients -->|HTTPS REST| LB
    LB -->|Internal Route| GW
    GW -->|Forward Auth Request| Microservices

    UserSvc -->|ACID Read/Write| PGNode
    SocialSvc -->|Graph Read/Write| PGNode
    PostSvc -->|Metadata Read/Write| CassNode
    FeedSvc -->|Sub-ms Hot Fetch| RedisNode
    FeedSvc -->|Cold Rebuild| CassNode
    EngageSvc -->|Point Query| CassNode
    EngageSvc -->|Atomic INCR| RedisNode
    SearchSvc -->|Fuzzy/Prefix Search| ESNode

    PostSvc -->|Publish POST_CREATED| Kafka
    EngageSvc -->|Publish LIKE/COMMENT| Kafka
    SocialSvc -->|Publish GRAPH_EVENTS| Kafka

    Kafka -->|Consume| Workers
    MediaProc -->|Upload Thumbnails| S3
    MediaProc -->|Set PUBLISHED| CassNode
    FeedBld -->|ZADD Post ID| RedisNode
    FeedBld -->|Durable Insert| CassNode
    SearchIdx -->|Index Document| ESNode
    NotifSend -->|Write Notification| CassNode
    CounterUpd -->|Sync Batch| CassNode
```

### Request Lifecycle: Direct S3 Photo Upload (Figure 2)
```mermaid
sequenceDiagram
    autonumber
    actor Client as Client (Phone)
    participant GW as API Gateway
    participant PostSvc as Post Service
    participant S3 as S3 Storage
    participant Cass as Cassandra
    participant Kafka as Kafka Event Bus
    participant Consumers as Background Workers (Media, Feed, Search, Notif)

    Client->>GW: POST /api/v1/media/upload-url (JWT)
    GW->>PostSvc: Validate JWT & Rate Limit, Forward
    PostSvc-->>Client: 200 OK (signed upload URL + mediaKey, 5 min TTL)
    
    Client->>S3: PUT binary image bytes directly to S3
    
    Client->>GW: POST /api/v1/posts (mediaKey, caption, Idempotency-Key)
    GW->>PostSvc: Forward request
    PostSvc->>Cass: Write post row + transactional outbox row (QUORUM)
    PostSvc-->>Client: 201 Created (status: "PROCESSING", postId: 101)
    Note over Client: Fast response (<200 ms) · App displays optimistic post

    PostSvc->>Kafka: Outbox relay publishes POST_CREATED (acks=all)
    Kafka->>Consumers: Broadcast event to all consumer groups
    
    par Async Processing
        Consumers->>S3: media-processor: Download raw, resize 150/640/1080px, upload public
        Consumers->>Cass: media-processor: Update post status to PUBLISHED
    and Feed Fan-out
        Consumers->>Consumers: feed-builder: Lookup followers from Social Graph
        Consumers->>Cass: feed-builder: Push postId to active followers in Redis & Cassandra
    and Search Index
        Consumers->>Consumers: search-indexer: Tokenize hashtags & text into Elasticsearch
    and Notifications
        Consumers->>Consumers: notification-sender: Dispatch alerts to subscribed followers
    end
```

---

## 📊 Capacity Baseline & Sizing (10M Users)

| Metric | Target Value | Architectural Sizing / Calculation |
| :--- | :--- | :--- |
| **Registered Users** | 10,000,000 | 10M user records |
| **Daily Active Users (DAU)** | 2,000,000 | ~20% of user base |
| **Requests / Day** | 200,000,000 | $2\text{M DAU} \times 100\text{ req/day}$ |
| **Average RPS** | ~2,315 RPS | $\frac{200{,}000{,}000}{86{,}400\text{ s}}$ |
| **Peak RPS (3x)** | ~7,000 RPS | Peak multiplier |
| **Application Containers** | ~21 instances | $\frac{7{,}000\text{ peak RPS}}{500\text{ RPS/container}} \times 1.5\text{ headroom} \approx 21$ across 3 AZs |
| **New Posts / Day** | 200,000 posts | ~10% of DAU post daily |
| **Media Storage / Year** | ~146 TB / year | $200{,}000 \times 2\text{ MB} \times 365 \approx 146\text{ TB/year}$ |
| **Post Metadata / Year** | ~73 GB / year | $200{,}000 \times 1\text{ KB} \times 365 \approx 73\text{ GB/year}$ (~220 GB at RF=3) |
| **Redis Feed Cluster Memory** | ~64 GB | $2\text{M DAU} \times 800\text{ IDs} \times 40\text{ bytes} \approx 64\text{ GB}$ (4x 16 GB nodes) |

---

## ⚡ Phase 4 REST API Specifications (`/api/v1`)

All endpoints use base path `/api/v1` and standard HTTP status codes:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/signup` | Register new account (returns `userId`, `accessToken`, `refreshToken`) | No |
| `POST` | `/api/v1/auth/login` | Log in and receive access + refresh tokens | No |
| `POST` | `/api/v1/auth/logout` | Invalidate refresh token session | Yes |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Yes |
| `POST` | `/api/v1/media/upload-url` | Get short-lived presigned upload URL for direct S3 upload | Yes |
| `POST` | `/api/v1/posts` | Create post (`status: PROCESSING`, supports `Idempotency-Key`) | Yes |
| `GET` | `/api/v1/posts/:id` | Fetch post details (cached in Redis `post:{postId}`) | No |
| `DELETE` | `/api/v1/posts/:id` | Delete post (owner only, invalidates cache) | Yes |
| `GET` | `/api/v1/feed` | Hybrid home feed with cursor pagination (`?cursor=...&limit=20`) | Optional |
| `POST` | `/api/v1/posts/:id/like` | Idempotent like (atomic `INCR` on `likes:count:{postId}`) | Yes |
| `DELETE` | `/api/v1/posts/:id/like` | Idempotent unlike | Yes |
| `POST` | `/api/v1/posts/:id/comments` | Add comment to post | Yes |
| `GET` | `/api/v1/posts/:id/comments` | List comments for a post | No |
| `GET` | `/api/v1/users/:id` | Get user profile with follower/following counts | No |
| `PATCH` | `/api/v1/users/me` | Update bio or profile avatar | Yes |
| `POST` | `/api/v1/users/:id/follow` | Idempotent follow (dispatches feed backfill event) | Yes |
| `DELETE` | `/api/v1/users/:id/follow` | Unfollow user | Yes |
| `GET` | `/api/v1/users/:id/followers` | List followers of user | No |
| `GET` | `/api/v1/users/:id/posts` | User profile grid posts | No |
| `GET` | `/api/v1/notifications` | List user notifications | Yes |
| `GET` | `/api/v1/search` | Search users or hashtags (`?q=&type=user\|hashtag`) | No |
| `POST` | `/api/v1/stories` | Create ephemeral 24-hour story | Yes |
| `GET` | `/api/v1/system/architecture`| Real-time capacity specifications and live engine telemetry | No |

### Standard Error Response Shape
```json
{
  "error": {
    "code": "POST_NOT_FOUND",
    "message": "The requested post does not exist"
  }
}
```

---

## 🛠️ Implemented Architectural Components

1. **Redis Cache-Aside Service (`backend/services/cacheService.js`):**
   - Implements Redis sorted sets (`feed:{userId}`), hashes (`post:{postId}`, `user:{userId}`), and atomic counters (`likes:count:{postId}`).
   - Embedded high-performance in-memory LRU store with automatic fallback when Redis cluster is offline.
2. **Asynchronous Kafka Event Bus (`backend/services/eventBus.js`):**
   - Topics: `post-events`, `engagement-events`, `graph-events`.
   - Transactional Outbox pattern emulation.
   - At-least-once delivery with `eventId` deduplication (idempotent consumers).
   - Retry queue with exponential backoff and Dead-Letter Queue (`post-events.dlq`).
   - Consumers: `media-processor`, `feed-builder`, `search-indexer`, `notification-sender`, `counter-updater`.
3. **Gateway Rate Limiter (`backend/middleware/rateLimiter.js`):**
   - Enforces 100 requests/minute per user/IP using sliding window counters.
   - Sets `X-RateLimit-*` and `Retry-After` headers on HTTP 429.
4. **Idempotency Protection (`backend/middleware/idempotency.js`):**
   - Checks `Idempotency-Key` headers on write requests to prevent duplicate posts on poor mobile network retries.

---

## 🚀 Running the Project

### Option A: Complete Multi-Container Stack via Docker Compose (Recommended)
With Docker and Docker Compose installed:
```bash
# Build and run backend, frontend, MongoDB and Redis simultaneously
docker compose up --build -d

# Check all 4 containers and their health probes
docker compose ps

# View live container logs
docker compose logs -f
```
**Live Container Access Points:**
- **Web Application (React SPA + Nginx):** `http://localhost:3000`
- **Backend API Direct:** `http://localhost:5000`
- **API Health Check (Nginx Reverse Proxy):** `http://localhost:3000/health`
- **MongoDB Database:** `localhost:27017`
- **Redis Cache:** `localhost:6379`

### Option B: Local Node.js Development
#### Prerequisites
- Node.js (v18+)
- npm (v9+)

#### 1. Run Backend
```bash
cd backend
npm install
npm test            # Runs complete test suite (26/26 passing)
npm run dev         # Starts server on http://localhost:5000
```

#### 2. Run Frontend
```bash
cd frontend
npm install
npm test            # Runs Vitest component test suite (11/11 passing)
npm run build       # Bundles production Vite build (0 errors)
npm run dev         # Launches Vite dev server on http://localhost:5173
```

---

## 🧪 Automated Test Verification (Phase 6: 37 / 37 Passing Tests)

### 1. Backend Integration & Edge Case Tests (`backend/`)
```bash
cd backend
npm test
```
**Output (26 / 26 passing):**
```text
✔ AUTH: Malformed or invalid JWT Bearer token returns 401 UNAUTHORIZED
✔ AUTH: Missing Bearer scheme (token only) returns 401 UNAUTHORIZED
✔ TOKEN: generateTokens creates valid access and refresh token pair
✔ IDEMPOTENCY: Middleware intercepts repeat Idempotency-Key and returns cached outcome
✔ RATE LIMITER: Sliding window returns HTTP 429 when threshold exceeded
✔ CACHE: Key expiration removes item after TTL
✔ CACHE: Atomic INCR on non-existent key initializes to 1
✔ CACHE: Stats tracks hits and misses accurately
✔ EVENTBUS: Dead-letter queue captures failed consumer events after retries
✔ FEED: Cursor pagination handles limit bounds
✔ NOT FOUND: Unregistered v1 endpoint returns standardized 404 error shape
✔ GET /health returns healthy status code 200
✔ GET /api/health returns service identification
✔ GET / returns API welcome info and route index
✔ POST /api/auth/register with missing fields returns 400
✔ POST /api/auth/login with empty fields returns 400
✔ GET non-existent route returns 404
✔ GET /api/v1/system/architecture returns capacity baseline and polyglot specs
✔ POST /api/v1/auth/signup with missing fields returns 400 with standardized error shape
✔ POST /api/v1/auth/login with missing credentials returns 400 with standardized error shape
✔ POST /api/v1/media/upload-url without JWT returns 401 UNAUTHORIZED
✔ GET /api/v1/feed returns 200 with posts array and nextCursor property
✔ GET /api/v1/search handles query and returns results
✔ Rate limiting headers are present on API responses
✔ CacheService verifies Redis Sorted Sets & Hash operations (Section 4D)
✔ EventBus publishes to Kafka topics with outbox pattern and deduplication (Section 5D)

ℹ tests 26 | suites 0 | pass 26 | fail 0 | cancelled 0
```

### 2. Frontend Component & State Tests (`frontend/`)
```bash
cd frontend
npm test
```
**Output (11 / 11 passing):**
```text
 ✓ src/tests/LoadingSpinner.test.jsx (2 tests)
 ✓ src/tests/ErrorMessage.test.jsx (3 tests)
 ✓ src/tests/LikeButton.test.jsx (4 tests)
 ✓ src/tests/PostCard.test.jsx (2 tests)

 Test Files  4 passed (4)
      Tests  11 passed (11)
```

---

## 🎓 University Viva Quick Answers

1. **Why an API Gateway?**  
   It terminates TLS, checks JWT authentication once, enforces the 100 req/min rate limit, and routes traffic. This prevents abusive requests from overloading internal microservices.
2. **Why direct-to-S3 uploads with signed URLs?**  
   Uploading 2 MB photos through application servers consumes memory, CPU, and sockets. Signed URLs allow phones to upload directly to S3, keeping API response latency under 200 ms.
3. **What happens if Kafka is down?**  
   Posts and likes are saved safely in the primary store along with an outbox record (Transactional Outbox pattern). Once Kafka recovers, the relay resumes dispatching events without any data loss.
4. **Why microservices for system design but a monolith for the mini project?**  
   Microservices are designed for 10M users and multi-team scaling. For a university DevOps submission, a modular monolithic architecture (React, Express, MongoDB) is vastly faster to develop, test, containerize, and deploy within CI/CD pipelines.
5. **What is the difference between containerizing with Docker and deploying on Vercel?**  
   Docker runs a persistent, long-running Linux container (daemon) with stateful in-memory processes, custom networking, and dedicated ports. Vercel is a serverless platform that deploys static frontend bundles to a global CDN and executes API logic inside short-lived, ephemeral serverless functions that sleep when idle.
6. **Why use multi-stage Docker builds?**  
   In `frontend/Dockerfile`, the build stage uses Node 20 to install dependencies and compile Vite bundles. The production runtime stage uses `nginx:alpine` (~25 MB) and copies only the compiled static assets. This eliminates developer tools, compilers, and `node_modules` from the production image, dramatically improving security and pull times.
7. **How does Nginx avoid CORS issues in Docker Compose?**  
   Nginx serves the frontend on port 80 and reverse-proxies `/api/` calls directly to `http://backend:5000/api/` inside the private Docker network. To the user's browser, both the HTML and the API appear on the same origin (`localhost:3000`), completely eliminating Cross-Origin Resource Sharing (CORS) blocks.

---

## 🎓 University Viva & Demonstration Script (20 Marks Evaluation)

Follow these 13 steps during your demonstration to your professor:

| Step # | Demonstration Action | What to Show / Explain to the Professor |
| :---: | :--- | :--- |
| **1** | **Open Deployed Application** | Open `https://mini-instagram-eta.vercel.app`. Explain that it is globally hosted on Vercel Edge CDN with responsive mobile/desktop layouts. |
| **2** | **Register a New User** | Navigate to `/signup`, register a user account. Explain that the password is automatically salted and hashed using **bcrypt** with a pre-save Mongoose hook. |
| **3** | **Log In & Session Auth** | Log in with the credentials. Open DevTools `Application > Local Storage` to show the signed **JWT Bearer Token** and explain stateless authentication. |
| **4** | **Create a Post** | Click the **`+ Create`** button. Select a preset photo or paste an image URL, enter a caption, and submit. Explain the direct upload flow and post lifecycle. |
| **5** | **Like & Comment** | Click the heart icon on a post (shows optimistic animation) and submit a comment. Explain idempotent duplicate-like prevention and reverse-chronological ordering. |
| **6** | **Show GitHub Repository** | Open `https://github.com/AayanA20/DevOps_Project`. Show the clean monorepo directory layout (`frontend/`, `backend/`, `docs/`, `.github/`). |
| **7** | **Show Branches & Pull Requests** | Click on GitHub **Pull Requests** and show **PR #1 (`feature/phase8-ci-cd` $\rightarrow$ `main`)**. Explain how feature branches protect the production branch. |
| **8** | **Show Commit History** | Run `git log --oneline` or show the commit history on GitHub. Highlight meaningful conventional commit prefixes (`feat:`, `fix:`, `docs:`, `ci:`, `chore:`). |
| **9** | **Show Dockerfile Architecture** | Open `frontend/Dockerfile` and `backend/Dockerfile`. Explain **multi-stage builds** and how copying only compiled assets into `nginx:alpine` cuts image size by >85%. |
| **10** | **Run Docker Containers** | Run `docker compose up -d` in the terminal and `docker ps`. Show 4 isolated containers (`frontend`, `backend`, `mongo`, `redis`) communicating over a private bridge network. |
| **11** | **Show GitHub Actions CI/CD** | Open the **Actions** tab on GitHub. Show the `.github/workflows/ci.yml` pipeline executing automated jobs on push and pull requests. |
| **12** | **Show Automated Tests Passing** | Run `npm test` in `frontend/` (11 Vitest tests) and `backend/` (26 native tests) to show **37 / 37 tests passing (100% pass rate)**. |
| **13** | **Show Live Cloud Telemetry** | Open `https://mini-instagram-eta.vercel.app/api/v1/system/architecture` to show live memory stats, cache hit ratios, and capacity baselines for 10M users. |
