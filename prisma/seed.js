import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const memberPassword = await bcrypt.hash('member123', 10);

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'System Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Member users
  const member1 = await prisma.user.upsert({
    where: { email: 'member@example.com' },
    update: {},
    create: {
      email: 'member@example.com',
      name: 'John Member',
      password: memberPassword,
      role: 'MEMBER',
    },
  });

  const member2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      password: memberPassword,
      role: 'MEMBER',
    },
  });

  // Projects
  const project1 = await prisma.project.create({
    data: {
      title: 'Marketing Campaign',
      description: 'Q4 Global Launch',
      creatorId: admin.id,
      members: {
        create: [
          { userId: admin.id, role: 'ADMIN' },
          { userId: member1.id, role: 'MEMBER' },
        ]
      },
      tasks: {
        create: [
          { 
            title: 'Design initial mockups', 
            status: 'COMPLETED', 
            priority: 'HIGH', 
            createdById: admin.id, 
            assignedToId: member1.id,
            dueDate: new Date(Date.now() - 86400000) // Yesterday
          },
          { 
            title: 'Social media schedule', 
            status: 'IN_PROGRESS', 
            priority: 'MEDIUM', 
            createdById: admin.id, 
            assignedToId: member1.id,
            dueDate: new Date(Date.now() + 86400000) // Tomorrow
          }
        ]
      }
    }
  });

  const project2 = await prisma.project.create({
    data: {
      title: 'Infrastructure Upgrade',
      description: 'Migrating legacy systems',
      creatorId: admin.id,
      members: {
        create: [
          { userId: admin.id, role: 'ADMIN' },
          { userId: member2.id, role: 'MEMBER' },
        ]
      },
      tasks: {
        create: [
          { 
            title: 'Server migration', 
            status: 'TODO', 
            priority: 'HIGH', 
            createdById: admin.id, 
            assignedToId: member2.id,
            dueDate: new Date(Date.now() - 172800000) // 2 days ago (Overdue)
          }
        ]
      }
    }
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
