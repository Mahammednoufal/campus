import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PRINCIPAL_EMAIL = "rikashrikash04@gmail.com";
const COMPLAINT_TEAM_EMAIL = "mohdnoupa2005@gmail.com";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;

  // 1. Public routes that don't require authentication
  const publicRoutes = ["/", "/report", "/track", "/login", "/access-denied", "/auth/callback"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const isApiRoute = pathname.startsWith("/api/");

  if (isPublicRoute || isApiRoute) {
    return supabaseResponse;
  }

  // Check demo/evaluation cookie first
  const demoCookie = request.cookies.get("scc_demo_user")?.value;
  let userEmail: string | null = null;

  if (demoCookie) {
    userEmail = decodeURIComponent(demoCookie).toLowerCase();
  }

  // If no demo cookie and Supabase URL is available, check Supabase auth
  if (!userEmail && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_supabase_project_url") {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value)
              );
              supabaseResponse = NextResponse.next({
                request,
              });
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              );
            },
          },
        }
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        userEmail = user.email.toLowerCase();
      }
    } catch (err) {
      console.warn("Supabase auth check skipped in middleware:", err);
    }
  }

  // Protected routes require authentication
  if (!userEmail) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Principal routes protection
  if (pathname.startsWith("/principal")) {
    if (userEmail !== PRINCIPAL_EMAIL.toLowerCase()) {
      if (userEmail === COMPLAINT_TEAM_EMAIL.toLowerCase()) {
        const url = request.nextUrl.clone();
        url.pathname = "/complaint-team";
        return NextResponse.redirect(url);
      }
      const url = request.nextUrl.clone();
      url.pathname = "/access-denied";
      return NextResponse.redirect(url);
    }
  }

  // Complaint team routes protection
  if (pathname.startsWith("/complaint-team")) {
    if (userEmail !== COMPLAINT_TEAM_EMAIL.toLowerCase()) {
      if (userEmail === PRINCIPAL_EMAIL.toLowerCase()) {
        const url = request.nextUrl.clone();
        url.pathname = "/principal";
        return NextResponse.redirect(url);
      }
      const url = request.nextUrl.clone();
      url.pathname = "/access-denied";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
