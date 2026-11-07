# Mini Instagram - Project Status & Roadmap

## Overview
- **Project Name:** Mini Instagram – Photo Sharing Platform
- **Assignment:** University DevOps & System Design Project (20 Marks)
- **Active Branch:** `main`
- **Origin Remote:** `https://github.com/AayanA20/DevOps_Project`
- **Architectural Specifications:** [docs/SYSTEM_DESIGN_PHASE_4_5.md](docs/SYSTEM_DESIGN_PHASE_4_5.md)

---

## Phase Checklist

### Phase 1: Workspace Inspection & Architecture Design
- [x] Workspace inspection completed.
- [x] Cloned GitHub repository mapped to workspace root (`main`, `origin/main`).
- [x] Initialized development branch.
- [x] Root `.gitignore` and `.env.example` created.
- [x] Modular full-stack directory architecture established.
- **Status:** COMPLETED

### Phase 2: Frontend Development (React + Vite + Tailwind CSS + Lucide Icons)
- [x] Initialized Vite React SPA in `frontend/`.
- [x] Configured Tailwind CSS with Instagram design tokens (colors, scrollbars, responsive breakpoints).
- [x] Created Axios HTTP client with automated Bearer JWT injection and 401 handling (`services/api.js`).
- [x] Implemented API service modules:
  - [x] `authService.js` (register, login, getMe, logout)
  - [x] `postService.js` (getPosts, getFeed with cursor pagination, createPost with idempotency key, deletePost, like, comment)
  - [x] `userService.js` (getUserProfile, followUser, unfollowUser, getSuggestedUsers, search, notifications)
- [x] Implemented centralized Auth State (`AuthContext.jsx`, `useAuth.js`).
- [x] Implemented reusable components:
  - [x] `Navbar` (mobile header & bottom navigation bar)
  - [x] `Sidebar` (desktop navigation with Instagram branding, create trigger, and user card)
  - [x] `PostCard` (author header, responsive media container, like button, comments, delete action)
  - [x] `CommentSection` (comment list, author profile links, expandable view, submission input)
  - [x] `CreatePostModal` (modal dialog, live image preview, preset sample images, caption counter)
  - [x] `ProfileHeader` (avatar, follow/unfollow toggle, post/follower/following counters, bio)
  - [x] `LikeButton` (optimistic UI update with animated heart icon)
  - [x] `ProtectedRoute` (session check and automatic redirect to `/login`)
  - [x] `LoadingSpinner` (Instagram circular spinner)
  - [x] `ErrorMessage` (user-friendly alert banner with retry trigger)
- [x] Implemented pages:
  - [x] `Login` (`/login` with quick demo account shortcut)
  - [x] `Signup` (`/signup` with validation)
  - [x] `HomeFeed` (`/` with pagination, pull-to-refresh, empty state, and fallback demo items)
  - [x] `CreatePost` (`/create` full-page post creator)
  - [x] `UserProfile` (`/profile/:id` with 3-column photo grid and interactive overlay)
  - [x] `Explore` (`/explore` with search filter and suggested creator follow cards)
- [x] Configured client routing with `react-router-dom` in `App.jsx`.
- [x] Verified production build (`vite build`: 0 errors).
- **Status:** COMPLETED

### Phase 3: Backend APIs & Database Models (Node.js + Express + Mongoose)
- [x] Initialized Express backend in `backend/` with ES Modules.
- [x] Configured Mongoose connection (`config/db.js`) with production error handling.
- [x] Configured Cloudinary integration (`config/cloudinary.js`) with signed upload signature generation.
- [x] Defined Mongoose Models:
  - [x] `User` (username, email, password with bcrypt hash hook, bio, followers, following, timestamps)
  - [x] `Post` (user ref, imageUrl, caption, likes ref array, comments subdocument, compound indexes)
- [x] Implemented Controllers & Routes:
  - [x] Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
  - [x] Posts: `POST /api/posts`, `GET /api/posts` (paginated), `GET /api/posts/:id`, `DELETE /api/posts/:id`
  - [x] Likes: `POST /api/posts/:id/like` (duplicate prevention), `DELETE /api/posts/:id/like`
  - [x] Comments: `POST /api/posts/:id/comments`, `GET /api/posts/:id/comments`
  - [x] Users: `GET /api/users/:id`, `POST /api/users/:id/follow`, `DELETE /api/users/:id/follow`, `GET /api/users/suggested`
- [x] Implemented Middleware:
  - [x] `authMiddleware.js` (JWT token verification, user context attachment)
  - [x] `errorMiddleware.js` (404 handler, Mongoose duplicate key/validation error handling)
  - [x] CORS configuration with dynamic origin matching
- [x] Structured decoupled `app.js` and `server.js` architecture for testability & serverless compatibility.
- **Status:** COMPLETED

### Phase 4: API Design & Full-Stack Integration (Versioned REST `/api/v1`)
- [x] Formalized System Design Specification: [docs/SYSTEM_DESIGN_PHASE_4_5.md](docs/SYSTEM_DESIGN_PHASE_4_5.md).
- [x] Implemented versioned REST API (`/api/v1`) adhering to Section 4A & 4B contracts:
  - [x] Auth: `POST /api/v1/auth/signup` (201 with `userId, accessToken, refreshToken`), `POST /api/v1/auth/login`, `POST /api/v1/auth/logout` (204 session invalidation), `GET /api/v1/auth/me`
  - [x] Media direct uploads: `POST /api/v1/media/upload-url` (short-lived presigned upload URL for zero-byte application server pass-through)
  - [x] Posts: `POST /api/v1/posts` (returns 201 with status `PROCESSING`), `GET /api/v1/posts/:id`, `DELETE /api/v1/posts/:id` (204)
  - [x] Likes & Comments: `POST /api/v1/posts/:id/like` (idempotent), `DELETE /api/v1/posts/:id/like`, `POST /api/v1/posts/:id/comments` (201), `GET /api/v1/posts/:id/comments`
  - [x] Social Graph: `GET /api/v1/users/:id`, `PATCH /api/v1/users/me`, `POST /api/v1/users/:id/follow` (idempotent), `DELETE /api/v1/users/:id/follow` (204), `GET /api/v1/users/:id/followers`, `GET /api/v1/users/:id/posts`
  - [x] Auxiliary: `GET /api/v1/notifications`, `GET /api/v1/search?q=&type=user|hashtag`, `POST /api/v1/stories`, `GET /api/v1/stories`
- [x] Enforced standardized error shape across all endpoints: `{"error": {"code": "...", "message": "..."}}`.
- [x] Enforced Gateway Rate Limiting: 100 requests/minute per user/IP with `Retry-After` header and `429 Too Many Requests`.
- [x] Added `Idempotency-Key` request header support for idempotent network retries.
- [x] Updated Frontend service layer (`authService.js`, `postService.js`, `userService.js`) to seamlessly interact with `/api/v1`.
- **Status:** COMPLETED

### Phase 5: High-Level Architecture, Distributed Scalability & End-to-End Workflows
- [x] Complete System Design Architecture Documented (Section 5A–5E):
  - [x] Instagram's Real Architecture Documented (Section 4F: Historical AWS era vs. Modern Meta Infrastructure — Django/Cinder, PostgreSQL sharding, Cassandra, Redis, Memcached/mcrouter, Rocksandra, RabbitMQ/Celery, Gearman, S3/CloudFront, TAO, Everstore, asyncio & GC tuning).
  - [x] Mermaid High-Level Architecture Diagram (Figure 1: Clients $\rightarrow$ L7 LB $\rightarrow$ API Gateway $\rightarrow$ Stateless Containers $\rightarrow$ Kafka $\rightarrow$ Workers $\rightarrow$ Polyglot Stores).
  - [x] Request Lifecycle Sequence Diagram (Figure 2: Direct-to-S3 signed URL photo upload).
  - [x] Polyglot Persistence specifications (PostgreSQL sharded, Cassandra RF=3, Redis Cluster 64GB, S3 + CDN, Elasticsearch).
  - [x] Consistency Model: Strong consistency for accounts/relationships vs Eventual consistency for feeds/counts/notifications.
  - [x] Viva Quick Answers guide covering system design architectural justifications.
- [x] Redis Cache-Aside Service (`services/cacheService.js`):
  - [x] `feed:{userId}`: Sorted set ordered by timestamp score
  - [x] `post:{postId}`: Hydrated post hash
  - [x] `user:{userId}`: Profile hash with 1-hour TTL
  - [x] `likes:count:{postId}`: Atomic integer counter
  - [x] `session:{token}`: Session token store with 7-day TTL
  - [x] `rate:{userId}:{minute}`: Sliding window rate limit counters
- [x] Asynchronous Kafka Event Bus Simulation (`services/eventBus.js`):
  - [x] Topics: `post-events`, `engagement-events`, `graph-events`
  - [x] Outbox Pattern: Atomic post write + outbox relay
  - [x] Idempotent Consumers: deduplication via `eventId`
  - [x] Dead-Letter Queue (DLQ: `post-events.dlq`) and exponential back-off retries
  - [x] Workers: `media-processor` (generates 150/640/1080 thumbnails, updates status to `PUBLISHED`), `feed-builder` (pushes to follower feeds), `search-indexer` (indexes hashtags), `notification-sender`, `counter-updater`
- [x] Hybrid Feed Fan-out Implementation (`controllers/v1/v1FeedController.js`):
  - [x] Fan-out on write for regular users (< 100k followers)
  - [x] Fan-out on read for celebrity accounts (> 100k followers)
  - [x] Cursor pagination (`?cursor=<epoch>_<postId>&limit=20`) returning `{ posts, nextCursor }`
- [x] Live System Telemetry Endpoint (`GET /api/v1/system/architecture`):
  - Real-time cache hits/misses, active keys, event bus throughput, memory usage, and capacity baseline.
- [x] Automated test suite expanded to 15/15 passing tests (`tests/health.test.js` + `tests/phase4_5.test.js`).
- **Status:** COMPLETED

---

## Next Steps (Upon User Approval)
- [ ] **Phase 6:** Automated test expansion (frontend Vitest tests).
- [ ] **Phase 7:** Docker containerization (`frontend/Dockerfile`, `backend/Dockerfile`, `docker-compose.yml`).
- [ ] **Phase 8:** GitHub Actions CI/CD pipeline (`.github/workflows/ci.yml`).
- [ ] **Phase 9:** Production deployment preparation for Vercel / Render / Cloud.
- [ ] **Phase 10:** Comprehensive university demonstration guide and final presentation script.
