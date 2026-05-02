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

    const profile = await prisma.clientProfile.findUnique({
      where: { userId: (session.user as any).id },
    });

    return NextResponse.json(profile || {});
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { businessName, phone, website, facebook, instagram, twitter, notes } = body;

    const profile = await prisma.clientProfile.upsert({
      where: { userId: (session.user as any).id },
      update: { businessName, phone, website, facebook, instagram, twitter, notes },
      create: {
        userId: (session.user as any).id,
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
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}