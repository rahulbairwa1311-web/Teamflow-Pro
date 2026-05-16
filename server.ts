import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "teamflow-secret-key-12345";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Auth Middleware
  const authMiddleware = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  const adminMiddleware = (req: any, res: any, next: any) => {
    if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Admin access required" });
    next();
  };

  // Auth Routes
  app.post("/api/auth/signup", async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, role: role || "MEMBER" },
      });
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err: any) {
      res.status(400).json({ error: err.message.includes("unique") ? "Email already exists" : "Signup failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/auth/me", authMiddleware, async (req: any, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  });

  // Users Routes (Admin only)
  app.get("/api/users", authMiddleware, adminMiddleware, async (req, res) => {
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true } });
    res.json(users);
  });

  // Projects Routes
  app.get("/api/projects", authMiddleware, async (req: any, res) => {
    if (req.user.role === "ADMIN") {
      const projects = await prisma.project.findMany({ include: { members: { include: { user: true } }, tasks: true } });
      return res.json(projects);
    }
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId: req.user.id } } },
      include: { members: { include: { user: true } }, tasks: true },
    });
    res.json(projects);
  });

  app.post("/api/projects", authMiddleware, adminMiddleware, async (req: any, res) => {
    const { title, description } = req.body;
    const project = await prisma.project.create({
      data: {
        title,
        description,
        creatorId: req.user.id,
        members: { create: { userId: req.user.id, role: "ADMIN" } },
      },
    });
    res.json(project);
  });

  app.get("/api/projects/:id", authMiddleware, async (req: any, res) => {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } }, tasks: { include: { assignedTo: true } } },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    
    const isMember = project.members.some(m => m.userId === req.user.id);
    if (!isMember && req.user.role !== "ADMIN") return res.status(403).json({ error: "Access denied" });
    
    res.json(project);
  });

  app.delete("/api/projects/:id", authMiddleware, adminMiddleware, async (req, res) => {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  app.post("/api/projects/:id/members", authMiddleware, adminMiddleware, async (req, res) => {
    const { userId } = req.body;
    try {
      const member = await prisma.projectMember.create({
        data: { projectId: req.params.id, userId, role: "MEMBER" },
      });
      res.json(member);
    } catch (err) {
      res.status(400).json({ error: "Member already added" });
    }
  });

  app.delete("/api/projects/:id/members/:userId", authMiddleware, adminMiddleware, async (req, res) => {
    await prisma.projectMember.deleteMany({ where: { projectId: req.params.id, userId: req.params.userId } });
    res.json({ success: true });
  });

  // Tasks Routes
  app.get("/api/tasks", authMiddleware, async (req: any, res) => {
    let where: any = {};
    if (req.user.role !== "ADMIN") {
      where = { assignedToId: req.user.id };
    }
    const tasks = await prisma.task.findMany({ where, include: { project: true, assignedTo: true } });
    res.json(tasks);
  });

  app.post("/api/tasks", authMiddleware, adminMiddleware, async (req: any, res) => {
    const { title, description, status, priority, dueDate, projectId, assignedToId } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assignedToId,
        createdById: req.user.id,
      },
    });
    res.json(task);
  });

  app.put("/api/tasks/:id", authMiddleware, async (req: any, res) => {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Admins can update everything, members only status if assigned
    if (req.user.role === "ADMIN") {
      const updated = await prisma.task.update({
        where: { id: req.params.id },
        data: req.body,
      });
      return res.json(updated);
    }

    if (task.assignedToId !== req.user.id) return res.status(403).json({ error: "Unauthorized" });
    
    // Member only PATCH logic (only status)
    if (Object.keys(req.body).length === 1 && req.body.status) {
      const updated = await prisma.task.update({
        where: { id: req.params.id },
        data: { status: req.body.status },
      });
      return res.json(updated);
    }
    res.status(403).json({ error: "Members can only update status" });
  });

  app.delete("/api/tasks/:id", authMiddleware, adminMiddleware, async (req, res) => {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  // Dashboard Stats
  app.get("/api/dashboard/stats", authMiddleware, async (req: any, res) => {
    const isMember = req.user.role !== "ADMIN";
    const where = isMember ? { assignedToId: req.user.id } : {};
    const projWhere = isMember ? { members: { some: { userId: req.user.id } } } : {};

    const now = new Date();

    const [totalProjects, totalTasks, statusCounts, priorityCounts, overdueCount, recentTasks] = await Promise.all([
      prisma.project.count({ where: projWhere }),
      prisma.task.count({ where }),
      prisma.task.groupBy({
        by: ['status'],
        where,
        _count: true
      }),
      prisma.task.groupBy({
        by: ['priority'],
        where,
        _count: true
      }),
      prisma.task.count({
        where: {
          ...where,
          status: { not: "COMPLETED" },
          dueDate: { lt: now }
        }
      }),
      prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { project: true }
      })
    ]);

    const stats = {
      totalProjects,
      totalTasks,
      todo: statusCounts.find(s => s.status === "TODO")?._count || 0,
      inProgress: statusCounts.find(s => s.status === "IN_PROGRESS")?._count || 0,
      completed: statusCounts.find(s => s.status === "COMPLETED")?._count || 0,
      priorityDistribution: {
        high: priorityCounts.find(p => p.priority === "HIGH")?._count || 0,
        medium: priorityCounts.find(p => p.priority === "MEDIUM")?._count || 0,
        low: priorityCounts.find(p => p.priority === "LOW")?._count || 0,
      },
      overdue: overdueCount,
      recentTasks
    };

    res.json(stats);
  });

  // --- Vite & Client ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
