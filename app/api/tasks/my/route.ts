import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    const tasks = await prisma.task.findMany({
      where: role === "CLIENT"
        ? { clientId: userId }
        : { userId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        client: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("My tasks error:", error);
    return NextResponse.json([], { status: 200 });
  }
}