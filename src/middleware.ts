import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { routeAccessMap } from "./lib/settings";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/api(.*)']);
const matchers = Object.keys(routeAccessMap).map((route) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: routeAccessMap[route],
}));

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  const { sessionClaims, userId } = await auth();

  console.log(userId)
  
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  const role = (sessionClaims?.metadata as { role?: string })?.role

  for (const { matcher, allowedRoles } of matchers) {
   if (matcher(req) && role && !allowedRoles.includes(role)) {
  return NextResponse.redirect(new URL(`/${role}`, req.url));
}
  
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};