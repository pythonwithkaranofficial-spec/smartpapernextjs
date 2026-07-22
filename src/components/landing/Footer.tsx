"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Mail, Shield, BookOpen, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background/30 backdrop-blur-md py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="md:col-span-5 flex flex-col items-start gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-heading font-bold text-base">
                Smart Paper <span className="text-indigo-500">AI</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              Generate CBSE question papers aligned to standard syllabi in seconds. Built for school teachers, tutors, and coaching academies.
            </p>
          </div>

          {/* Links Column 1 */}
          <div className="md:col-span-3">
            <h4 className="font-heading font-bold text-sm mb-4 tracking-wide uppercase text-foreground/90">Navigation</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/#home" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-250">Home</Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-250">Features</Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-250">How It Works</Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-250">About Project</Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="md:col-span-4">
            <h4 className="font-heading font-bold text-sm mb-4 tracking-wide uppercase text-foreground/90">Contact & Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <a href="mailto:tpaofficial1999@gmail.com" className="hover:text-indigo-400 transition-colors">
                  tpaofficial1999@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Daily Paper Limits: 5 papers/day</span>
              </li>
              <li className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>CBSE Class 9, 10, 11, 12 Support</span>
              </li>
            </ul>
          </div>
          
        </div>

        {/* Bottom Area */}
        <div className="pt-8 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground text-center">
          <div>
            &copy; {currentYear} Smart Paper Generator AI. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
            <span>by</span>
            <span className="font-semibold text-foreground/80">Karan Sir</span>
            <span>(Computer Teacher)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
