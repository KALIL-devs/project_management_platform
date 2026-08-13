import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const hashedPassword = await bcrypt.hash("admin123", 10);

await prisma.user.upsert({
  where: { email: "admin@portal.com" },
  update: {},
  create: {
    name: "Admin User",
    email: "admin@portal.com", 
    password: hashedPassword,
    role: "ADMIN",
  }, 
});

const empPassword = await bcrypt.hash("employee123", 10);

const emp1 = await prisma.user.upsert({
  where: { email: "alex.morgan@fixyads.com" },
  update: {},
  create: {
    name: "Alex Morgan",
    email: "alex.morgan@fixyads.com",
    password: empPassword,
    role: "EMPLOYEE",
  },
});

const emp2 = await prisma.user.upsert({
  where: { email: "sarah.connor@fixyads.com" },
  update: {},
  create: {
    name: "Sarah Connor",
    email: "sarah.connor@fixyads.com",
    password: empPassword,
    role: "EMPLOYEE",
  },
});

const emp3 = await prisma.user.upsert({
  where: { email: "david.miller@fixyads.com" },
  update: {},
  create: {
    name: "David Miller",
    email: "david.miller@fixyads.com",
    password: empPassword,
    role: "EMPLOYEE",
  },
});

// Seed sample tasks for employees
const taskCount = await prisma.task.count({ where: { userId: emp1.id } });
if (taskCount === 0) {
  await prisma.task.createMany({
    data: [
      {
        title: "Design Landing Page Banners",
        description: "Create high-converting ad graphics for social campaigns.",
        status: "IN_PROGRESS",
        userId: emp1.id,
      },
      {
        title: "Review Client Analytics Report",
        description: "Analyze monthly reach and CTR metrics for FixyAds clients.",
        status: "COMPLETED",
        userId: emp1.id,
      },
      {
        title: "Setup Google Ads Campaign",
        description: "Configure search and display ads with target keywords.",
        status: "PENDING",
        userId: emp2.id,
      },
    ],
  });
}

// Seed sample attendance / punch logs
const attendanceCount = await prisma.attendance.count({ where: { userId: emp1.id } });
if (attendanceCount === 0) {
  const now = new Date();
  
  // Today's active punch for Alex
  const todayIn = new Date(now);
  todayIn.setHours(9, 15, 0, 0);
  await prisma.attendance.create({
    data: {
      userId: emp1.id,
      date: new Date(now.setHours(0,0,0,0)),
      punchIn: todayIn,
      status: "PUNCHED_IN",
      notes: "Started working on client campaign visuals.",
    },
  });

  // Yesterday completed punch for Alex
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  const yestIn = new Date(yest);
  yestIn.setHours(9, 0, 0, 0);
  const yestOut = new Date(yest);
  yestOut.setHours(17, 30, 0, 0);
  await prisma.attendance.create({
    data: {
      userId: emp1.id,
      date: new Date(yest.setHours(0,0,0,0)),
      punchIn: yestIn,
      punchOut: yestOut,
      totalMinutes: 510, // 8.5 hours
      status: "PUNCHED_OUT",
      notes: "Completed daily tasks and sprint review.",
    },
  });

  // 2 days ago completed punch for Alex
  const dayBefore = new Date();
  dayBefore.setDate(dayBefore.getDate() - 2);
  const dayBeforeIn = new Date(dayBefore);
  dayBeforeIn.setHours(9, 30, 0, 0);
  const dayBeforeOut = new Date(dayBefore);
  dayBeforeOut.setHours(18, 0, 0, 0);
  await prisma.attendance.create({
    data: {
      userId: emp1.id,
      date: new Date(dayBefore.setHours(0,0,0,0)),
      punchIn: dayBeforeIn,
      punchOut: dayBeforeOut,
      totalMinutes: 510,
      status: "PUNCHED_OUT",
      notes: "Client alignment meeting & report drafting.",
    },
  });

  // Yesterday completed punch for Sarah
  await prisma.attendance.create({
    data: {
      userId: emp2.id,
      date: new Date(yest.setHours(0,0,0,0)),
      punchIn: yestIn,
      punchOut: yestOut,
      totalMinutes: 510,
      status: "PUNCHED_OUT",
      notes: "Worked on client onboarding roadmaps.",
    },
  });
}

console.log("✅ Seed completed with admin, employees, tasks, and attendance logs!");
await prisma.$disconnect();