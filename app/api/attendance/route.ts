import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

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
  try {
    const body = await request.json();
    const { userId, action, notes } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: "User ID and action are required" }, { status: 400 });
    }

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    if (action === "PUNCH_IN") {
      // Check if user already has an active punch today
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
          notes: notes || null,
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
      const totalMinutes = Math.round(diffMs / (1000 * 60));

      const updatedRecord = await prisma.attendance.update({
        where: { id: activeRecord.id },
        data: {
          punchOut: now,
          totalMinutes,
          status: "PUNCHED_OUT",
          notes: notes ? `${activeRecord.notes ? activeRecord.notes + " | " : ""}${notes}` : activeRecord.notes,
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
