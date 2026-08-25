import { Navbar } from "@/components/Navbar";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = "https://dailyui.spencercraigie.com";
const title = "Daily UI Challenge | Spencer Craigie";
const description =
  "A 100-day challenge exploring frontend UI design and development, inspired by dailyui.co.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | Daily UI Challenge",
  },
  description,
  keywords: [
    "Daily UI",
    "UI design challenge",
    "frontend development",
    "Spencer Craigie",
    "web design",
  ],
  authors: [{ name: "Spencer Craigie" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "Daily UI Challenge",
    images: [{ url: "/dailyui-icon.png" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: ["/dailyui-icon.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={"flex h-screen flex-col " + inter.className}>
        <Navbar />
        <div className="flex flex-1 flex-col ">{children}</div>
      </body>
    </html>
  );
}
