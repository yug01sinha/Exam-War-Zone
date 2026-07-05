import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ExamWarRoom - AI Study Companion for CBSE Class 10",
  description:
    "India's smartest AI study companion for CBSE Class 10. Solve doubts, crack mock tests, and excel in your board exams.",
  icons: {
    icon: "/Logo.jpeg",
    shortcut: "/Logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
