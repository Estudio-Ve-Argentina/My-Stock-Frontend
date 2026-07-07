import { NextResponse, type NextRequest } from "next/server";
import { TOKEN_COOKIE } from "@/lib/auth/session";
import { isTokenValid } from "@/lib/auth/jwt";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  if (!token || !isTokenValid(token)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/panel/:path*",
    "/cargar/:path*",
    "/productos/:path*",
    "/historial/:path*",
    "/mi-plan/:path*",
    "/cuenta/:path*",
    "/categorias/:path*",
    "/proveedores/:path*",
    "/sucursales/:path*",
    "/favoritos/:path*",
    "/metricas/:path*",
    "/informes/:path*",
    "/onboarding/:path*",
  ],
};
