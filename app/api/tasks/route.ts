import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
      },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Tasks GET error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, userId, clientId } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        userId: userId || null,
        clientId: clientId || null,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
        client: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Tasks POST error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}