import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authHelpers";

export async function GET(request: Request) {
  const { session, errorResponse } = await requireAuth();
  if (errorResponse || !session) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get("userId");

    // Non-admin employees/clients can only query their own attendance
    if (session.user.role !== "ADMIN") {
      userId = session.user.id;
    }

    const whereClause: Record<string, any> = {};
    if (userId) {
      whereClause.userId = userId;
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      orderBy: { punchIn: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(attendances);
  } catch (error) {
    console.error("Attendance GET error:", error);
    return NextResponse.json({ error: "Failed to fetch attendance records" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { session, errorResponse } = await requireAuth();
  if (errorResponse || !session) return errorResponse;

  try {
    const body = await request.json();
    const { action, notes } = body;
    let { userId } = body;

    // Prevent identity impersonation: non-admin users can only punch for themselves
    if (session.user.role !== "ADMIN" || !userId) {
      userId = session.user.id;
    }

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    if (action === "PUNCH_IN") {
      // Check if user already has an active punch session
      const existingActive = await prisma.attendance.findFirst({
        where: {
          userId,
          status: "PUNCHED_IN",
        },
      });

      if (existingActive) {
        return NextResponse.json(
          { error: "User is already punched in", record: existingActive },
          { status: 400 }
        );
      }

      const newRecord = await prisma.attendance.create({
        data: {
          userId,
          date: startOfDay,
          punchIn: now,
          status: "PUNCHED_IN",
          notes: notes ? notes.trim() : null,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return NextResponse.json(newRecord, { status: 201 });
    }

    if (action === "PUNCH_OUT") {
      // Find current active punch in record
      const activeRecord = await prisma.attendance.findFirst({
        where: {
          userId,
          status: "PUNCHED_IN",
        },
        orderBy: { punchIn: "desc" },
      });

      if (!activeRecord) {
        return NextResponse.json(
          { error: "No active punch-in session found for this user" },
          { status: 400 }
        );
      }

      const diffMs = now.getTime() - new Date(activeRecord.punchIn).getTime();
      const totalMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));

      const updatedRecord = await prisma.attendance.update({
        where: { id: activeRecord.id },
        data: {
          punchOut: now,
          totalMinutes,
          status: "PUNCHED_OUT",
          notes: notes
            ? activeRecord.notes
              ? `${activeRecord.notes} | ${notes.trim()}`
              : notes.trim()
            : activeRecord.notes,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return NextResponse.json(updatedRecord);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Attendance POST error:", error);
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 });
  }
}
