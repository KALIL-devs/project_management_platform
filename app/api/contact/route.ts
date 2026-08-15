import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authHelpers";

export async function GET() {
  const { errorResponse } = await requireRole(["ADMIN"]);
  if (errorResponse) return errorResponse;

  try {
    const messages = await prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Contact GET error:", error);
    return NextResponse.json({ error: "Failed to fetch contact messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, service, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email and message are required" },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone: phone || null,
        service: service || null,
        message,
      },
    });

    return NextResponse.json({ success: true, contact }, { status: 201 });
  } catch (error) {
    console.error("Contact POST error:", error);
    return NextResponse.json(
      { error: "Something went wrong sending your message" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const { errorResponse } = await requireRole(["ADMIN"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { id, read } = body;

    if (!id || typeof read !== "boolean") {
      return NextResponse.json({ error: "ID and read state required" }, { status: 400 });
    }

    const updated = await prisma.contact.update({
      where: { id },
      data: { read },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Contact PATCH error:", error);
    return NextResponse.json({ error: "Failed to update message status" }, { status: 500 });
  }
}