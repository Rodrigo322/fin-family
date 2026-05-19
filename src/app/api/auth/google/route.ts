import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const GOOGLE_STATE_COOKIE = "controle_familiar_google_state";

function callbackUrl(request: NextRequest) {
  return new URL("/api/auth/callback/google", request.url).toString();
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.redirect(new URL("/login?error=google-config", request.url));
  }

  const state = randomBytes(32).toString("hex");
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", callbackUrl(request));
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60,
    path: "/",
  });

  return response;
}
