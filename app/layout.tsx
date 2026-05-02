import type { Metadata } from "next";
import "./globals.css";
import NextAuthProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "FixyAds Portal",
  description: "Manage your projects and tasks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}