import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Pulse",
  description: "Swipe your way through decentralized socials posts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`light overflow-x-hidden`}>
      <head>
        <link rel="icon" href="/logo-pulse.png" sizes="any" />
      </head>
      <body className={`overflow-x-hidden`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
