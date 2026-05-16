# TeamFlow - Collaborative Task Manager

TeamFlow is a production-ready, full-stack project management application built for teams to stay organized, track progress, and meet deadlines with clear accountability.

## 🚀 Key Features

- **Robust Authentication**: JWT-based secure login and signup with password hashing.
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Full control over projects, tasks, and team management.
  - **Member**: Focus on assigned tasks and track personal contributions.
- **Project Intelligence**: Real-time progress calculating based on task completion.
- **Task Management**: Advanced filtering by status, priority, and overdue states.
- **Comprehensive Dashboard**: Beautiful analytics for system-wide (Admin) and personal (Member) performance.
- **Professional UI**: Built with Tailwind CSS, Lucide icons, and Framer Motion for smooth transitions.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, React Router 6, Axios, Tailwind CSS, Motion.
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL (via Prisma ORM). *Note: Local development uses SQLite for ease of setup.*
- **Security**: JWT (jsonwebtoken), bcryptjs, Zod validation.

---

## 📁 Folder Structure

```text
team-task-manager/
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── seed.js         # Initial data seeding
├── src/
│   ├── api/            # API client configuration
│   ├── components/     # UI building blocks
│   ├── context/        # Global auth state management
│   ├── layouts/        # Dashboard layout systems
│   ├── pages/          # Core views (Auth, Dashboard, Projects, Tasks)
│   ├── App.tsx         # Routing logic
│   └── main.tsx        # App entry point
├── server.ts           # Unified Express + Vite server
├── .env.example        # Environment variable templates
├── package.json        # Build and dependency scripts
└── README.md           # Documentation
```

---

## ⚙️ Local Setup

1. **Clone the repo** and install dependencies:
   ```bash
   npm install
   ```

2. **Setup Environment Variables**:
   Create a `.env` file from the example:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-key"
   ```

3. **Initialize Database**:
   ```bash
   npm run prisma:generate
   npm run prisma:push
   npm run prisma:seed
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

---

## 🔒 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `admin123` |
| **Member** | `member@example.com` | `member123` |

---

## ☁️ Railway Deployment Steps

1. **Connect GitHub**: Import this repository to your Railway project.
2. **Add Database**: Add a PostgreSQL plugin in Railway.
3. **Variables**: Set `DATABASE_URL` (get this from the Postgres plugin Tab), `JWT_SECRET`, and `NODE_ENV=production`.
4. **Build Command**: Set to `npm run build`.
5. **Start Command**: Set to `npm start`.
6. **Deploy**: Railway will automatically build and start the server on port 3000.

---

## 📋 API Endpoints

- **Auth**: `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`
- **Projects**: `GET /api/projects`, `POST /api/projects`, `DELETE /api/projects/:id`
- **Tasks**: `GET /api/tasks`, `POST /api/tasks`, `PUT /api/tasks/:id`
- **Admin**: `GET /api/users`, `POST /api/projects/:id/members`

---

## 🎥 Demo Video Script (2-5 mins)

1. **Introduction (30s)**: "Welcome to TeamFlow. This app solves team coordination issues with clear role-based access..."
2. **Admin Flow (1m)**: "Logging in as Admin. Notice the overview dashboard. Let's create a project, invite a member, and assign a task..."
3. **Member Flow (1m)**: "Logging in as a member. I only see my assigned projects and tasks. I can update my status which reflects on the project progress bar..."
4. **Efficiency Features (30s)**: "Highlight the overdue task section and the clean, responsive mobile view."
5. **Conclusion**: "TeamFlow provides a robust foundation for organizational task management."

---

## 🛠 Future Improvements
- [ ] Email notifications for new task assignments.
- [ ] Real-time updates using WebSockets.
- [ ] File attachments on tasks.
- [ ] Kanban board view for projects.
