/**
 * Copy overrides for Clerk's components.
 *
 * design.md §5 forbids exclamation marks; Clerk's stock subtitles use them
 * ("Welcome back! Please sign in to continue"). Strings are not reachable
 * through `appearance` — this is the lever, and it is a ClerkProvider option
 * rather than a per-component prop.
 *
 * Only the lines the auth design actually changes are here. Everything else
 * keeps Clerk's default.
 */
export const clerkLocalization = {
  signIn: {
    start: {
      subtitle: "Welcome back. Sign in to pick up your queue.",
    },
  },
  signUp: {
    start: {
      title: "Create your Synergy account",
      subtitle: "Create an account, then write your North Star.",
    },
  },
};
