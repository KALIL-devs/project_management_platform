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

    const employeeId = (session.user as any).id;

    const tasks = await prisma.roadmapTask.findMany({
      where: { employeeId },
      orderBy: { dueDay: "asc" },
      include: {
        module: {
          include: {
            month: {
              include: {
                roadmap: {
                  include: {
                    client: {
                      select: { id: true, name: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("My roadmap tasks error:", error);
    return NextResponse.json([], { status: 200 });
  }
}