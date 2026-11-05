# Mini Instagram - Project Status & Roadmap

## Overview
- **Project Name:** Mini Instagram – Photo Sharing Platform
- **Assignment:** University DevOps & System Design Project (20 Marks)
- **Current Branch:** `develop`

---

## Phase Checklist

### Phase 1: Workspace Inspection & Architecture Design
- [x] Workspace inspection completed.
- [x] Git repository synchronized with remote origin (`https://github.com/AayanA20/DevOps_Project`).
- [x] Branching model initiated (`main`, `develop`).
- [x] Root `.gitignore` and `.env.example` created.
- [x] System architecture documented.
- **Status:** COMPLETED

### Phase 2: Frontend Development (React + Vite + Tailwind CSS + Lucide Icons)
- [ ] Initialize Vite React SPA in `frontend/`.
- [ ] Install Tailwind CSS, React Router, Axios, Lucide React.
- [ ] Implement reusable components:
  - [ ] Navbar
  - [ ] Sidebar
  - [ ] PostCard
  - [ ] CommentSection
  - [ ] CreatePostModal
  - [ ] ProfileHeader
  - [ ] LikeButton
  - [ ] ProtectedRoute
  - [ ] LoadingSpinner
  - [ ] ErrorMessage
- [ ] Implement pages:
  - [ ] Login (`/login`)
  - [ ] Signup (`/signup`)
  - [ ] Home Feed (`/`)
  - [ ] Create Post (`/create`)
  - [ ] User Profile (`/profile/:id`)
  - [ ] Explore Users (`/explore`)
- [ ] Setup Auth & Post context / state management with fallback mock data when backend is starting.
- [ ] Build verification (`npm run build`).
- **Status:** IN PROGRESS

### Phase 3: Backend APIs & Database Models (Node.js + Express + Mongoose)
- [ ] Initialize Express application in `backend/`.
- [ ] Setup Mongoose connection with MongoDB Atlas support and graceful error handling.
- [ ] Define Mongoose Models:
  - [ ] `User` (username, email, password, profilePicture, bio, followers, following, createdAt)
  - [ ] `Post` (user, imageUrl, caption, likes, comments, createdAt)
- [ ] Implement Controllers & Routes:
  - [ ] Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
  - [ ] Posts: `POST /api/posts`, `GET /api/posts` (with pagination), `GET /api/posts/:id`, `DELETE /api/posts/:id`
  - [ ] Likes: `POST /api/posts/:id/like`, `DELETE /api/posts/:id/like` (duplicate prevention)
  - [ ] Comments: `POST /api/posts/:id/comments`, `GET /api/posts/:id/comments`
  - [ ] Users: `GET /api/users/:id`, `POST /api/users/:id/follow`, `DELETE /api/users/:id/follow`
- [ ] Middleware:
  - [ ] `authMiddleware` (JWT verification & user attachment)
  - [ ] Centralized error handler
  - [ ] CORS & body-parser
- [ ] Cloudinary integration & signed upload configuration helper.
- [ ] Local API verification via curl/node test script.
- **Status:** PENDING

### Phase 4: Full-Stack Integration
- [ ] Connect Frontend Axios API service to Backend endpoints.
- **Status:** PENDING (Paused as requested up to Phase 3)

### Phase 5: Auth, Posts, Likes, Comments & Profiles Verification
- [ ] Manual & integration flow verification.
- **Status:** PENDING

### Phase 6: Automated Testing
- [ ] Vitest + React Testing Library (Frontend).
- [ ] Jest / Supertest (Backend API tests).
- **Status:** PENDING

### Phase 7: Docker & Docker Compose
- [ ] `frontend/Dockerfile` & `.dockerignore` (multi-stage build with Nginx or static server).
- [ ] `backend/Dockerfile` & `.dockerignore`.
- [ ] Root `docker-compose.yml`.
- [ ] Container spin-up and health verification.
- **Status:** PENDING

### Phase 8: Git Branching & GitHub Actions CI/CD
- [ ] Create feature branches and pull requests.
- [ ] `.github/workflows/ci.yml`.
- **Status:** PENDING

### Phase 9: Vercel Deployment & Production Configuration
- [ ] Deploy Frontend to Vercel.
- [ ] Configure Backend for serverless Vercel function or standalone host.
- [ ] Live URL verification.
- **Status:** PENDING

### Phase 10: Documentation & University Demonstration Guide
- [ ] Final comprehensive README.md.
- [ ] Step-by-step viva / professor demo walkthrough.
- **Status:** PENDING
