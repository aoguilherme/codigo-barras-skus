import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Allow all requests - auth is handled client-side
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
