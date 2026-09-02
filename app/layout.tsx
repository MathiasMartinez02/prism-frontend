import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Fuente sans para UI, mono para datos/codigo.
const plexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PRISM",
  description: "AI Code Reviewer — analiza Pull Requests con AI y muestra findings y score.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
