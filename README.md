# 🎓 Apex LMS: Enterprise-Grade Learning Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Redux](https://img.shields.io/badge/Redux-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

An enterprise-grade, modern, and production-ready Learning Management System (LMS) designed with a clean, modern SaaS/EdTech aesthetic (inspired by Stripe, Linear, and Vercel). Features a scalable repository-service architectural pattern, JWT access + refresh token rotating sessions, rich multimedia syllabus players, interactive quiz engines, and real-time dashboard analytics.

---

## ✨ Key Features & Capabilities

### 🛡️ Enterprise Security & Auth
- **Rotating Double-Token Authentication:** High-security JWT structure with short-lived `AccessToken` (15 mins) and sliding `RefreshToken` (7 days) saved in secure structures.
- **Axios Interceptor Token Rotation:** Frontend interceptors intercept expired tokens, requesting a silent refresh behind the scenes, and retry original requests seamlessly without interrupting user sessions.
- **RBAC (Role-Based Access Control):** Custom route guards enforcing isolated layout panels and dashboards for **Admin**, **Instructor**, and **Student** roles.
- **Helmet & Rate Limiter Security:** Express tier protected by helmet headers, rate limiters, CORS filtering, input sanitization, and **Zod** schema validations.

### 🌐 Dual-Mode Database Fallback (Zero Setup Run)
- If a local MongoDB instance is not active, the system automatically triggers a **Memory-DB fallback mode**. All actions (enrollments, progress updates, course/lesson creations, quiz completions) operate in-memory using built-in mock seed repositories, guaranteeing the application **boots and runs perfectly out of the box with zero external configuration!**

### 💻 Premium UI/UX & Interactive Player
- **Glassmorphism & Framer Motion:** Stunning dark/light mode toggle with custom persistence, spring-driven stagger slide-ins, and cards.
- **Course Player Suite:** Split-pane playback featuring a HTML5 video player, custom embedded PDF reader, and rich-text study containers.
- **Assessment Engine:** Modular multiple-choice quiz engine with dynamic grading logic, instant score calculations, pass/fail status screens, and student review trackers.
- **Dashboard Telemetry:** Professional dashboard analytics displaying visual KPIs, active learning progression tracks, course catalogs, syllabus managers, and user management lists.

---

## 🏗️ Architectural Blueprints

### 📂 Directory Structure

#### 🟢 Backend Directory Layout
```text
backend/
┣ src/
┃ ┣ config/        # Mongoose database & environment configurations
┃ ┣ controllers/   # Route handler controllers (Auth, Courses, Quizzes, Dashboards)
┃ ┣ middleware/    # Auth guards, upload parser, rate-limit security, central catchers
┃ ┣ models/        # Mongoose database collection definitions
┃ ┣ repositories/  # DB Abstraction (switches automatically between Mongoose & InMemory DB)
┃ ┣ routes/        # Router tables split by resources
┃ ┣ services/      # Service tier encapsulating business actions
┃ ┣ utils/         # Seed files, JWT helpers, central error handlers
┃ ┣ validators/    # Zod validation models for payload checking
┃ ┣ app.ts         # Global Express App middleware assembly
┃ ┗ server.ts      # Main server entry & graceful shutdown hooks
```

#### 🔵 Frontend Directory Layout
```text
frontend/
┣ src/
┃ ┣ animations/    # Framer Motion transitions & micro-animation systems
┃ ┣ api/           # Base Axios client with silent token rotation interceptors
┃ ┣ components/    # Reusable UI widgets (players, loaders, cards)
┃ ┣ layouts/       # Nested master templates (Navbar, Sidebar, Dashboards)
┃ ┣ pages/         # Screen pages (Home, Login, Register, Dashboards, Catalog, Players)
┃ ┣ routes/        # Protected router boundaries and guards
┃ ┣ services/      # API endpoints definitions map
┃ ┣ store/         # Redux Toolkit state stores and slices (Auth, UI)
┃ ┣ types/         # Strict TypeScript definitions
```

---

## 🔑 Demo Credentials

To check role-based permissions immediately, the seed script prepares preloaded user credentials (password is **`password`** for all accounts):

| Role | Email | Capabilities |
| :--- | :--- | :--- |
| **Student** | `student@lms.com` | Browse catalog, enroll in courses, study lessons, complete quizzes, view dashboard progress |
| **Instructor**| `instructor@lms.com` | Create/edit courses, manage modules/lessons, build quizzes, track course analytics |
| **Admin** | `admin@lms.com` | Global platform analytics telemetry, view all registered courses, manage platform users |

---

## 🚀 Getting Started (Local Run)

### 1️⃣ Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (Optional, falls back to in-memory mode if offline)

### 2️⃣ Clone and Install Dependencies

Open a terminal at the project root directory and install dependencies:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3️⃣ Configure Environment Variables

#### Backend `.env`
Create a `.env` file in the `backend/` directory (you can copy `backend/.env.example`):
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/enterprise_lms
JWT_ACCESS_SECRET=super_secret_access_key_123_456_789_abc_def_xyz
JWT_REFRESH_SECRET=super_secret_refresh_key_987_654_321_zyx_wvu_tsr
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
```

### 4️⃣ Seed the Database (Optional MongoDB Populate)
If your MongoDB service is running and you want to populate it with starter courses, run:
```bash
cd backend
npm run seed
```

### 5️⃣ Run the Applications

Start both services in development mode:

```bash
# Start Backend (Listening on http://localhost:5000)
cd backend
npm run dev

# Start Frontend (Listening on http://localhost:5173)
cd ../frontend
npm run dev
```

Visit **`http://localhost:5173`** in your browser. Click on any role's quick-login button on the Login page to immediately test the system!

---

## 🐳 Docker Deployment (Orchestrated Stack)

Deploy the entire stack (Database + API + Nginx Static Serving Frontend) with a single command!

### 1️⃣ Run Compose
From the project root directory, run:
```bash
docker-compose up --build -d
```

This starts:
- **`lms-mongodb`**: A persistent MongoDB instance (port `27017`).
- **`lms-backend`**: Node.js microservice API (port `5000`).
- **`lms-frontend`**: SPA-configured Nginx static serving container (port `3000`).

### 2️⃣ Verify Stack
Open **`http://localhost:3000`** in your browser to experience the complete enterprise LMS platform running in Docker containers!

---

## 📦 Design Aesthetics Inspiration
- **Linear / Vercel**: Minimalist dashboard layouts, harmonized borders, and elegant grid patterns.
- **Stripe**: Glassmorphism, smooth animations, and premium dark/light mode switches.
- **Coursera / Udemy**: Dynamic syllabus trackers, double-pane players, and rich quiz assessments.

---

## 🛡️ Recruiter Portfolio Showcase Highlights
- **Service/Repository Pattern**: Backend code is clean, modular, and easy to maintain.
- **Robust Error Handling**: Centralized Express error interceptor returning standardized JSON wrappers.
- **Strict TypeScript Integration**: Strict typing shared across both backend and frontend layers.
- **Zero-Setup Run Ability**: The automatic InMemory fallback makes it highly portable for quick portfolio reviews.
