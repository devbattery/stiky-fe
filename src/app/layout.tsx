import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Stiky",
    template: "%s | Stiky",
  },
  description: "Stiky blog platform",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Stiky",
    description: "인기 있는 글들을 경험하고, 자신만의 블로그를 만들어 보세요!",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    siteName: "Stiky",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="min-h-full">
    <body className="bg-background text-foreground antialiased">
    <Providers>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 bg-background">{children}</main>
        <SiteFooter />
      </div>
    </Providers>
    </body>
    </html>
  );
}
