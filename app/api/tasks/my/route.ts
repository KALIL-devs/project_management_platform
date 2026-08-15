import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authHelpers";

export async function GET() {
  const { session, errorResponse } = await requireAuth();
  if (errorResponse || !session) return errorResponse;

  try {
    const userId = session.user.id;
    const role = session.user.role;

    const tasks = await prisma.task.findMany({
      where: role === "CLIENT" ? { clientId: userId } : { userId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        client: {
          select: { id: true, name: true, email: true },
        },
        dependsOn: {
          select: { id: true, title: true, status: true },
        },
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("My tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch my tasks" }, { status: 500 });
  }
}