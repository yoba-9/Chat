// app/layout.tsx
import { ThemeProvider } from "@/utils/theme-provider";
import { Inter } from "next/font/google";
import "./globals.css";
import { FrontendProvider } from "@/components/providers";
import { Divide } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Zemenay Chat App",
  description: "A modern chat application with theme switching",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <FrontendProvider>{children}</FrontendProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
