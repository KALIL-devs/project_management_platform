import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    if (!userId) {
      return NextResponse.json({ error: "User ID not found in session" }, { status: 401 });
    }

    const attendances = await prisma.attendance.findMany({
      where: { userId },
      orderBy: { punchIn: "desc" },
    });

    const activePunch = attendances.find((a) => a.status === "PUNCHED_IN") || null;

    return NextResponse.json({
      attendances,
      activePunch,
      isPunchedIn: !!activePunch,
    });
  } catch (error) {
    console.error("My Attendance GET error:", error);
    return NextResponse.json({ error: "Failed to fetch attendance history" }, { status: 500 });
  }
}
