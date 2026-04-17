import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/", "/terms", "/privacy", "/contact", "/tokushoho"];

function detectLocale(request: NextRequest): string {
  const cookie = request.cookies.get("locale")?.value;
  if (cookie === "ja" || cookie === "en") return cookie;

  const country =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry");
  if (country === "JP") return "ja";

  const acceptLang = request.headers.get("accept-language") || "";
  if (/^ja\b|,\s*ja\b/.test(acceptLang)) return "ja";

  return "en";
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  if (!request.cookies.get("locale")) {
    const locale = detectLocale(request);
    response.cookies.set("locale", locale, {
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
      sameSite: "lax",
    });
  }

  const supabase = createMiddlewareClient(request, response);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const pathname = request.nextUrl.pathname;
    const isPublic =
      PUBLIC_PATHS.includes(pathname) ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/auth");
    if (!isPublic) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login|auth).*)"],
};
