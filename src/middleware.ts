/**
 * =============================================================================
 * SRIKANDI-Lite - Auth Middleware
 * =============================================================================
 * Middleware untuk melindungi halaman yang memerlukan autentikasi.
 * Redirect ke /login jika user belum login.
 * =============================================================================
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Gunakan getSession() untuk membaca session dari cookies
  // getUser() memerlukan request ke Supabase server yang bisa menyebabkan masalah
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;

  // Daftar halaman yang tidak memerlukan autentikasi
  const publicPaths = ["/login"];
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  // Jika user belum login dan mencoba akses halaman protected
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Jika user sudah login dan mencoba akses halaman login
  if (user && isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

// -----------------------------------------------------------------------------
// Konfigurasi path yang akan diproses oleh middleware
// -----------------------------------------------------------------------------
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
