import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;

    const roadmap = await prisma.roadmap.findUnique({
      where: { clientId },
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
                      select: { id: true, name: true, email: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!roadmap) {
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(roadmap);
  } catch (error) {
    console.error("Roadmap GET error:", error);
    return NextResponse.json({ error: "Failed to fetch roadmap" }, { status: 500 });
  }
}