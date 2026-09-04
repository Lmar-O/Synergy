import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Everything behind the app shell requires a session. The landing page,
// sign-in, and sign-up stay public.
const isProtectedRoute = createRouteMatcher(["/app(.*)", "/onboarding(.*)"]);

// Next 16 renamed the `middleware` file convention to `proxy`. The file must
// export a single function as a default export, which is what clerkMiddleware
// returns.
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next internals and static files unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Clerk's auto-proxy path
    "/__clerk/:path*",
  ],
};
