import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const hashedPassword = await bcrypt.hash("admin123", 10);

await prisma.user.upsert({
  where: { email: "admin@portal.com" },
  update: {},
  create: {
    name: "Admin",
    email: "admin@portal.com", 
    password: hashedPassword,
    role: "ADMIN",
  }, 
});

console.log("✅ Admin user created: admin@fixyads.com");
await prisma.$disconnect();