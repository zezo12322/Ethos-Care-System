import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cairo } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const dinNext = localFont({
  src: "./fonts/DINNextLTArabic-Regular.ttf",
  variable: "--font-din-next-lt-arabic",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "أجيال أجيال صناع الحياة - نظام إدارة الحالات",
  description: "نظام إدارة الحالات والطلبات لجمعية أجيال صناع الحياة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${jakarta.variable} ${cairo.variable} ${dinNext.variable}`}>
      <body className="min-h-screen bg-background font-body text-on-surface antialiased flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
