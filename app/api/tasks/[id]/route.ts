import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authHelpers";
import { Priority } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireAuth();
  if (errorResponse || !session) return errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, priority, title, description, userId, clientId, dependsOnId, dueDate, estimatedHours } = body;

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Client permission check
    if (
      session.user.role === "CLIENT" &&
      existingTask.clientId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden: Cannot update this task" }, { status: 403 });
    }

    // Employee permission check
    if (
      session.user.role === "EMPLOYEE" &&
      existingTask.userId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden: Cannot update this task" }, { status: 403 });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(priority && { priority: priority as Priority }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(userId !== undefined && { userId: userId || null }),
        ...(clientId !== undefined && { clientId: clientId || null }),
        ...(dependsOnId !== undefined && { dependsOnId: dependsOnId || null }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(estimatedHours !== undefined && { estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null }),
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

    return NextResponse.json(task);
  } catch (error) {
    console.error("Task PATCH error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireAuth();
  if (errorResponse || !session) return errorResponse;

  if (session.user.role === "CLIENT") {
    return NextResponse.json({ error: "Forbidden: Clients cannot delete tasks" }, { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Task DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}