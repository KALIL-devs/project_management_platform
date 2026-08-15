import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authHelpers";
import bcrypt from "bcryptjs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireAuth();
  if (errorResponse || !session) return errorResponse;

  try {
    const { id } = await params;

    // Only Admin/Employee or the user themselves can view details
    if (session.user.role === "CLIENT" && session.user.id !== id) {
      return NextResponse.json({ error: "Forbidden: Access denied" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        assignedTasks: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            dueDate: true,
            estimatedHours: true,
            createdAt: true,
            updatedAt: true,
            client: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        roadmapTasks: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            dueDay: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        attendances: {
          orderBy: { punchIn: "desc" },
          select: {
            id: true,
            date: true,
            punchIn: true,
            punchOut: true,
            totalMinutes: true,
            status: true,
            notes: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("User GET error:", error);
    return NextResponse.json({ error: "Failed to fetch user details" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireAuth();
  if (errorResponse || !session) return errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, password, role } = body;

    // Only Admin can change another user's profile/role; non-admins can only update themselves
    if (session.user.role !== "ADMIN" && session.user.id !== id) {
      return NextResponse.json({ error: "Forbidden: Cannot edit another user" }, { status: 403 });
    }

    const dataToUpdate: Record<string, any> = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (role && session.user.role === "ADMIN") dataToUpdate.role = role;
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("User PATCH error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireAuth();
  if (errorResponse || !session) return errorResponse;

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Only Admin can delete users" }, { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
