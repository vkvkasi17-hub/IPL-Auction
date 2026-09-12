import type { Metadata } from "next";
import "./globals.css";

export const viewport = {width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#182541'};

export const metadata: Metadata = {
  title: "IPL Mock Auction — The Grand Cricket Auction",
  description: "Build your dream cricket squad in a colorful fantasy IPL auction. Play with friends or challenge computer opponents.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
