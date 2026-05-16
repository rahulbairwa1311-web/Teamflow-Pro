# TeamFlow PRO - Bento Grid Task Management

TeamFlow PRO is a high-performance, full-stack project management application featuring a modern **Bento Grid** interface. It's designed for high-velocity teams to stay organized, track progress, and maintain focus with a clear, visual hierarchy.

## 🌟 What's New: The Bento Update
We've completely overhauled the UI to use a "Bento Box" layout strategy. This provides:
- **Visual Intelligence**: Key metrics (Overdue, Active Projects) are instantly visible in high-contrast tiles.
- **Priority Distribution**: A dark-themed analytics card showing task weight across the system.
- **Improved Hierarchy**: A full-width "Welcome Card" with quick actions for the most common workflows.
- **Refined Navigation**: A sleek top-nav header replacing the sidebar for maximum content space.

## 🚀 Key Features

- **JWT Authentication**: Secure login and signup with `bcryptjs` password hashing.
- **Bento Dashboard**: A beautiful, responsive grid layout for system-wide insights.
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Oversee all projects, manage team members, and view system health.
  - **Member**: Focus on assigned work with personalized task views.
- **Project Progress Engine**: Real-time percentage tracking based on task completion states.
- **Priority Distribution**: Visual breakdown of High/Medium/Low priority tasks.
- **Full-Stack Performance**: Express.js backend with Prisma ORM for efficient data handling.

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Framer Motion, Tailwind CSS (v4), Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: SQLite (Development) / PostgreSQL (Production) via Prisma.
- **Security**: JSON Web Tokens (JWT), Bcrypt password salting.

## 📁 Project Structure

```text
teamflow-pro/
├── prisma/
│   ├── schema.prisma   # Database models & provider config
│   └── seed.js         # Initial dev data
├── src/
│   ├── components/     # UI components
│   ├── context/        # Auth & State management
│   ├── layouts/        # Bento-style Dashboard Layout
│   ├── pages/          # Dashboard, Projects, Tasks, Users
│   └── index.css       # Tailwind configuration & Bento themes
├── server.ts           # Full-stack server (Express + Vite middleware)
├── .env.example        # Environment variable template
└── README.md           # This documentation
```

## ⚙️ Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Database Setup**:
   ```bash
   npx prisma generate
   ```
   ```bash
   npx prisma db push
   ```
   ```bash
   npm run prisma:seed
   ```

3. **Start Development**:
   ```bash
   npm run dev
   ```
   *The app will be available at `http://localhost:3000`*

## 🔒 Demo Accounts (Post-Seed)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `admin123` |
| **Member** | `member@example.com` | `member123` |

## ☁️ Deployment Guide (Railway)

1. **Database**: Provision a PostgreSQL database on Railway.
2. **Environment Variables**:
   - `DATABASE_URL`: Your Railway Postgres connection string.
   - `JWT_SECRET`: A long, random string.
   - `NODE_ENV`: `production`
3. **Build Command**: `prisma generate && vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs`
4. **Start Command**: `node dist/server.cjs`

## 📋 API Reference

- `POST /api/auth/signup`: Create a new account.
- `POST /api/auth/login`: Authenticate and receive a JWT.
- `GET /api/dashboard/stats`: Retrieve bento-grid analytics.
- `GET /api/projects`: List all accessible projects.
- `GET /api/tasks`: Filterable task list (Priority, Status).
- `GET /api/users`: Admin-only team member management.

---
Built with pride for high-performance teams.
