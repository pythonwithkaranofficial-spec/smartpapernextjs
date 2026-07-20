"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { buttonVariants } from "@/components/ui/button";
import { Sparkles, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Home", href: "/#home" },
  { name: "Features", href: "/#features" },
  { name: "How It Works", href: "/#how-it-works" },
  { name: "About", href: "/#about" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const isGeneratePage = pathname === "/generate" || pathname === "/preview";
  const [activeSection, setActiveSection] = useState(isGeneratePage ? "" : "Home");
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Sync state during render when route/pathname changes
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setActiveSection(isGeneratePage ? "" : "Home");
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Section scroll tracking for active link
      if (pathname === "/") {
        const sections = ["home", "features", "how-it-works", "about"];
        const scrollPosition = window.scrollY + 200;

        for (const section of sections) {
          const el = document.getElementById(section);
          if (el) {
            const top = el.offsetTop;
            const height = el.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
              const linkName = navLinks.find(l => l.href === `/#${section}`)?.name;
              if (linkName) setActiveSection(linkName);
            }
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return (
    <header
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-7xl transition-all duration-500 rounded-2xl border border-white/5 bg-background/35 backdrop-blur-md ${
        isScrolled
          ? "py-2.5 px-6 shadow-[0_12px_40px_rgba(0,0,0,0.3)] border-white/10"
          : "py-4 px-6 border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 via-purple-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] group-hover:scale-105 transition-all duration-300">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <span className="font-heading font-bold text-lg bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity duration-300">
            Smart Paper <span className="text-blue-500 group-hover:text-cyan-400 transition-colors duration-300">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full border border-border/50 bg-foreground/[0.03] backdrop-blur-sm relative">
          {navLinks.map((link) => {
            const isActive = activeSection === link.name;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setActiveSection(link.name)}
                className={`relative px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-300 z-10 ${
                  isActive ? "text-foreground" : "text-foreground/60 hover:text-foreground"
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.span
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full -z-10 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {!isGeneratePage ? (
            <Link
              href="/generate"
              className={cn(
                buttonVariants({ variant: "default" }),
                "rounded-full px-5 py-4 font-heading font-medium tracking-wide bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_4px_14px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.45)] hover:scale-[1.02] transition-all duration-300 border-none inline-flex items-center justify-center text-sm"
              )}
            >
              Generate Paper
            </Link>
          ) : (
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "rounded-full px-5 py-2 font-heading border-border/60 hover:bg-muted/40 inline-flex items-center justify-center text-muted-foreground hover:text-foreground"
              )}
            >
              Back to Home
            </Link>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger className="w-9 h-9 rounded-xl border border-border/50 glass hover:bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-all duration-300">
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="right" className="glass-strong border-l border-border/50 p-6 flex flex-col justify-between">
              <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <SheetTitle className="font-heading font-bold text-lg">Menu</SheetTitle>
                </div>
                
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-muted-foreground hover:text-foreground transition-all duration-300 py-1"
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="flex flex-col gap-3 pt-6 border-t border-border/40">
                {!isGeneratePage ? (
                  <Link
                    href="/generate"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "w-full rounded-xl py-5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white inline-flex items-center justify-center font-heading font-medium"
                    )}
                  >
                    Generate Paper
                  </Link>
                ) : (
                  <Link
                    href="/"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full rounded-xl py-5 border-border/60 inline-flex items-center justify-center text-muted-foreground hover:text-foreground font-heading"
                    )}
                  >
                    Back to Home
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
