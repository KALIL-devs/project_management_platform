import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE" | "CLIENT";
};

export async function getAuthSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return {
    ...session,
    user: session.user as SessionUser,
  };
}

export async function requireAuth() {
  const session = await getAuthSession();
  if (!session || !session.user) {
    return {
      session: null,
      errorResponse: NextResponse.json({ error: "Unauthorized access" }, { status: 401 }),
    };
  }
  return { session, errorResponse: null };
}

export async function requireRole(allowedRoles: Array<"ADMIN" | "EMPLOYEE" | "CLIENT">) {
  const { session, errorResponse } = await requireAuth();
  if (errorResponse || !session) {
    return { session: null, errorResponse };
  }

  if (!allowedRoles.includes(session.user.role)) {
    return {
      session: null,
      errorResponse: NextResponse.json({ error: "Forbidden: Insufficient privileges" }, { status: 403 }),
    };
  }

  return { session, errorResponse: null };
}
