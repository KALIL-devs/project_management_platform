import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const profile = await prisma.clientProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(profile || {});
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();
    const { businessName, phone, website, facebook, instagram, twitter, notes } = body;

    const profile = await prisma.clientProfile.upsert({
      where: { userId },
      update: { businessName, phone, website, facebook, instagram, twitter, notes },
      create: {
        userId,
        businessName,
        phone,
        website,
        facebook,
        instagram,
        twitter,
        notes,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}