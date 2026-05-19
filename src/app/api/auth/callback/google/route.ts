import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { createSessionRecord, hashPassword } from "@/lib/auth";
import { AUTH_COOKIE } from "@/lib/constants";
import { createStarterFamily, ensureProductionSchemaCompatibility } from "@/lib/onboarding";
import { getPrisma } from "@/lib/prisma";

const GOOGLE_STATE_COOKIE = "controle_familiar_google_state";

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleProfile = {
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
};

function callbackUrl(request: NextRequest) {
  return new URL("/api/auth/callback/google", request.url).toString();
}

function loginRedirect(request: NextRequest, error: string) {
  return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get(GOOGLE_STATE_COOKIE)?.value;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return loginRedirect(request, "google-config");
  }

  if (!code || !state || !storedState || state !== storedState) {
    return loginRedirect(request, "google-state");
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUrl(request),
      grant_type: "authorization_code",
    }),
  });
  const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;

  if (!tokenResponse.ok || !tokenData.access_token) {
    console.error("Google OAuth token exchange failed", tokenData.error, tokenData.error_description);
    return loginRedirect(request, "google-oauth");
  }

  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profile = (await profileResponse.json()) as GoogleProfile;
  const email = profile.email?.toLowerCase();

  if (!profileResponse.ok || !email || profile.email_verified === false) {
    return loginRedirect(request, "google-profile");
  }

  const prisma = getPrisma();
  await ensureProductionSchemaCompatibility();

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const displayName = profile.name || email.split("@")[0] || "Usuario";
    const passwordHash = await hashPassword(`google:${randomUUID()}`);

    user = await createStarterFamily({
      name: displayName,
      email,
      passwordHash,
      familyName: `Familia ${profile.given_name || displayName}`,
    });
  }

  const { token, expiresAt } = await createSessionRecord(user.id);
  const response = NextResponse.redirect(new URL("/dashboard", request.url));

  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
  response.cookies.delete(GOOGLE_STATE_COOKIE);

  return response;
}
