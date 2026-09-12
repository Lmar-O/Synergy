import type { Metadata } from "next";
import { ClerkLoaded, ClerkLoading, SignUp } from "@clerk/nextjs";

import { AuthCardSkeleton } from "@/components/auth-card-skeleton";
import { AuthShell } from "@/components/auth-shell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata: Metadata = { title: "Sign up — Synergy" };

export default function SignUpPage() {
  return (
    // Verbatim from the landing hero's closing line — the last promise the
    // landing made, repeated where it gets acted on.
    <AuthShell note="Free forever for solo founders · No credit card">
      <ClerkLoading>
        <AuthCardSkeleton />
      </ClerkLoading>
      <ClerkLoaded>
        <SignUp appearance={clerkAppearance} />
      </ClerkLoaded>
    </AuthShell>
  );
}
