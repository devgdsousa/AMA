import { type NextRequest } from "next/server";
import { updateSession } from "@/app/src/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/cadastros/:path*",
    "/dashboard/:path*",
  ],
};
