import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames, skipping internal Next.js assets, public fonts/icons, and offline fallback
  matcher: [
    "/",
    "/(as|bn|brx|en|hi|mni)/:path*",
    "/((?!_next|_vercel|~offline|fonts|icons|.*\\..*).*)",
  ],
};
