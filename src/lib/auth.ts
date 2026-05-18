import "server-only";

import { randomBytes, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { compare, hash } from "bcryptjs";

import { getPrisma } from "@/lib/prisma";
import { AUTH_COOKIE } from "@/lib/constants";

const SESSION_DAYS = 30;
let authSchemaPromise: Promise<void> | null = null;

async function ensureAuthSchemaCompatibility() {
  if (!authSchemaPromise) {
    const prisma = getPrisma();

    authSchemaPromise = (async () => {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "AppSession" (
          "id" TEXT NOT NULL,
          "token" TEXT NOT NULL,
          "expiresAt" TIMESTAMP(3) NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "userId" TEXT NOT NULL,
          CONSTRAINT "AppSession_pkey" PRIMARY KEY ("id")
        )
      `);
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "AppSession_token_key" ON "AppSession"("token")`);
    })();
  }

  await authSchemaPromise;
}

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export async function createSession(userId: string) {
  const prisma = getPrisma();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await ensureAuthSchemaCompatibility();

  await prisma.session.create({
    data: { id: randomUUID(), token, userId, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (token) {
    await ensureAuthSchemaCompatibility();
    await getPrisma().session.deleteMany({ where: { token } });
  }

  cookieStore.delete(AUTH_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return null;
  }

  await ensureAuthSchemaCompatibility();

  const session = await getPrisma().session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          family: true,
          profile: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
