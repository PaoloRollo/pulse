import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import localFont from "next/font/local";

const satoshi = localFont({
  src: [
    {
      path: "./fonts/Satoshi-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Satoshi-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Satoshi-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/Satoshi-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Satoshi-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  display: "swap",
});

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
    <html lang="en" className="light overflow-x-hidden">
      <head>
        <link rel="icon" href="/logo-pulse.png" sizes="any" />
      </head>
      <body className={satoshi.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
