# Vercel Deployment & Production Setup Guide

This guide provides step-by-step instructions to deploy **Mini Instagram** to a live, publicly accessible URL on **Vercel** with full-stack capabilities (React/Vite frontend + Serverless Express API).

---

## 1. Key Concept: Docker Containerization vs. Vercel Serverless

> **Important Viva & Examination Distinction:**  
> * **Docker (`docker compose up --build`):** Bundles the entire operating system, dependencies, and persistent background processes (Express listening on port 5000, MongoDB on 27017, Redis on 6379, Nginx on 3000) into isolated local containers.
> * **Vercel Serverless (`vercel.json` + `api/index.js`):** Does not run persistent Linux daemon containers. Instead, it serves the React frontend statically across its global Edge Network (CDN) and executes backend routes on-demand via event-driven **AWS Lambda / Vercel Serverless Functions**. The function spins up when a request hits `/api/*`, executes, and freezes immediately.

---

## 2. Environment Variables Mapping

In the **Vercel Project Dashboard** (`Settings > Environment Variables`), configure the following keys:

| Environment Variable | Description | Example / Recommended Value | Target Environment |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Runtime environment | `production` | Production, Preview |
| `MONGO_URI` | Cloud MongoDB Atlas Connection String | `mongodb+srv://<user>:<pwd>@cluster.mongodb.net/mini-instagram?retryWrites=true&w=majority` | Production, Preview |
| `JWT_SECRET` | Secret key for signing authentication tokens | Random 64-character hex string | Production, Preview |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name | `your_cloud_name` | Production, Preview |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` | Production, Preview |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret key | `abcdefghijklmnopqrstuvwx` | Production, Preview |
| `FRONTEND_URL` | Deployed frontend origin | `https://your-mini-instagram.vercel.app` | Production |

> **Note on `VITE_API_URL`:**  
> Because our `vercel.json` routes `/api/(.*)` directly to `api/index.js` on the same domain, leave `VITE_API_URL` unset or set to `/api`. This ensures all API calls are relative, eliminating CORS preflight overhead.

---

## 3. Step-by-Step Vercel Deployment Instructions

### Method A: Automatic Deployment via GitHub Integration (Recommended)

1. Log into your account at [vercel.com](https://vercel.com).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your GitHub repository: `https://github.com/AayanA20/DevOps_Project`.
4. In the **Configure Project** screen:
   * **Framework Preset:** Leave as *Other* (our root `vercel.json` will automatically orchestrate the build).
   * **Root Directory:** Leave as `./` (root).
5. Expand the **Environment Variables** accordion and add the keys from Section 2 (`MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_*`).
6. Click **Deploy**.
7. Vercel will run the build:
   * Compiles the React/Vite frontend into `dist/`.
   * Packages `api/index.js` as a serverless function.
   * Generates a live URL: `https://devops-project-xxxx.vercel.app`.

---

### Method B: Deployment via Vercel CLI (Command Line)

If you have the Vercel CLI installed:

```bash
# 1. Install or run Vercel CLI
npm install -g vercel

# 2. Authenticate
vercel login

# 3. Deploy to preview
vercel

# 4. Deploy to production
vercel --prod
```

---

## 4. Post-Deployment Verification Checklist

Once deployed, verify the following endpoints on your live public URL:

- [ ] **Frontend Application:** Open `https://<your-project>.vercel.app/` in a browser. The Instagram landing/feed page should load cleanly.
- [ ] **Health Endpoint:** Open `https://<your-project>.vercel.app/health` $\rightarrow$ should return `{"status": "healthy"}`.
- [ ] **API Diagnostics:** Open `https://<your-project>.vercel.app/api/v1/system/architecture` $\rightarrow$ should return capacity baseline and telemetry.
- [ ] **User Registration:** Sign up a test user on `/signup`. Verify JWT token is saved in `localStorage`.
- [ ] **Post Creation:** Upload a photo with a caption. Verify it appears on the home feed and user profile grid.
- [ ] **Engagement:** Toggle a like and add a comment to verify database persistence.
