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

    const roadmaps = await prisma.roadmap.findMany({
      include: {
        client: {
          select: { id: true, name: true, email: true },
        },
        months: {
          orderBy: { monthNumber: "asc" },
          include: {
            modules: {
              orderBy: { order: "asc" },
              include: {
                tasks: {
                  orderBy: { dueDay: "asc" },
                  include: {
                    assignedTo: {
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

    return NextResponse.json(roadmaps);
  } catch (error) {
    console.error("Employee roadmap GET error:", error);
    return NextResponse.json([], { status: 200 });
  }
}