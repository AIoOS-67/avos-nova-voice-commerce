import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AVOS — AI Voice Ordering System | Powered by Amazon Nova",
  description:
    "Real-time bilingual voice ordering for Chinese restaurants. Powered by Amazon Nova 2 Sonic and Nova 2 Lite with patent-pending Tool-Call-to-UI Bridge technology.",
  keywords: ["Amazon Nova", "Voice AI", "Chinese Restaurant", "Voice Ordering", "AVOS"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased bg-[#0a0a0a] text-white`}>
        {children}
      </body>
    </html>
  );
}
