import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const body = await request.json();
    const { status, priority, employeeId, title, description } = body;

    const task = await prisma.roadmapTask.update({
      where: { id: taskId },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(employeeId !== undefined && { employeeId: employeeId || null }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Roadmap task PATCH error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}