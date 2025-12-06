import type { Metadata } from "next";
import { Red_Hat_Text } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/theme/ThemeProvider";

const redHatText = Red_Hat_Text({
  variable: "--font-red-hat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HabitFlow",
  description: "Minimal productivity hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={redHatText.variable} suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
