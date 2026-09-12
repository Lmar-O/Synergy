import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { AppHeaderGate } from "@/components/app-header-gate";
import { clerkLocalization } from "@/lib/clerk-localization";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// The display face. Lives at the root rather than on the landing page so auth
// (and later /app) can reach var(--font-object-sans) — design.md §9.
const objectSans = localFont({
  src: "./fonts/object-sans.ttf",
  variable: "--font-object-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Synergy",
  description:
    "Tell Synergy what you're building. It writes the sprint, tracks progress, and keeps you moving.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // landing.css scrolls <html> smoothly for the #pricing anchor. Since
      // Next 16, this attribute is what makes the router suspend that across
      // navigations, so changing pages jumps instead of gliding to the top.
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${objectSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider localization={clerkLocalization}>
          <AppHeaderGate>
            <header className="flex items-center justify-between border-b border-black/10 px-6 py-3 dark:border-white/15">
              <Link href="/" className="font-semibold tracking-tight">
                Synergy
              </Link>
              <nav className="flex items-center gap-3 text-sm">
                <Show when="signed-out">
                  <SignInButton />
                  <SignUpButton />
                </Show>
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </nav>
            </header>
          </AppHeaderGate>
          <div className="flex flex-1 flex-col">{children}</div>
        </ClerkProvider>
      </body>
    </html>
  );
}
