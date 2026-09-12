import type { Metadata } from "next";
import { ClerkLoaded, ClerkLoading, SignIn } from "@clerk/nextjs";

import { AuthCardSkeleton } from "@/components/auth-card-skeleton";
import { AuthShell } from "@/components/auth-shell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata: Metadata = { title: "Sign in — Synergy" };

export default function SignInPage() {
  return (
    <AuthShell>
      <ClerkLoading>
        <AuthCardSkeleton />
      </ClerkLoading>
      <ClerkLoaded>
        <SignIn appearance={clerkAppearance} />
      </ClerkLoaded>
    </AuthShell>
  );
}
