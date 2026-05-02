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

    const clientId = (session.user as any).id;

    const roadmap = await prisma.roadmap.findUnique({
      where: { clientId },
      include: {
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

    return NextResponse.json(roadmap || null);
  } catch (error) {
    console.error("My roadmap GET error:", error);
    return NextResponse.json({ error: "Failed to fetch roadmap" }, { status: 500 });
  }
}