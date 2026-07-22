import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { CustomCursor } from "@/components/shared/CustomCursor";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Paper Generator AI - Create CBSE Question Papers",
  description: "Generate CBSE Class 9, 10, 11, and 12 question papers in seconds using our advanced AI. Fully aligned to latest CBSE curriculum.",
  keywords: ["CBSE", "Question Paper Generator", "AI Generator", "Teacher Tools", "Karan Saini", "Class Test Generator"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <EmailVerificationBanner />
              {children}
              <AuthModal />
              <CustomCursor />
              <Toaster position="top-right" richColors />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
