import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authHelpers";
import { Priority } from "@prisma/client";

export async function GET() {
  const { session, errorResponse } = await requireAuth();
  if (errorResponse || !session) return errorResponse;

  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
        client: {
          select: { id: true, name: true, email: true, role: true },
        },
        dependsOn: {
          select: { id: true, title: true, status: true },
        },
      },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Tasks GET error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { session, errorResponse } = await requireAuth();
  if (errorResponse || !session) return errorResponse;

  if (session.user.role === "CLIENT") {
    return NextResponse.json({ error: "Forbidden: Clients cannot create tasks" }, { status: 403 });
  }

  try {
    const body = await request.json();
    let { title, description, userId, clientId, priority, dependsOnId, dueDate, estimatedHours } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Employees can create tasks for themselves or leave userId as their own id
    if (session.user.role === "EMPLOYEE") {
      userId = session.user.id;
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        userId: userId || null,
        clientId: clientId || null,
        priority: priority ? (priority as Priority) : undefined,
        dependsOnId: dependsOnId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
        client: {
          select: { id: true, name: true, email: true, role: true },
        },
        dependsOn: {
          select: { id: true, title: true, status: true },
        },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Tasks POST error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}