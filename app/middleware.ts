// middleware.ts na raiz
import { type NextRequest } from "next/server";
import { updateSession } from "@/app/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/cadastros/:path*",
    "/dashboard/:path*",
    "/PessoaTEA/:path*",
    "/editar/:path*",
    "/admin/usuarios/:path*",
    "/relatorios/:path*", 
    "/consulta:path*"  
  ],
};
