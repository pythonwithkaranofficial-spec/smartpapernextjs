import React from "react";
import { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { SyllabusExplorer } from "@/components/syllabus/SyllabusExplorer";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "CBSE Syllabus & Exam Blueprints 2026 | Smart Paper AI",
  description: "Browse official CBSE Class 6-12 syllabi, unit mark weightages, chapter lists, and question paper blueprints for 2026 board exams.",
};

export default function SyllabusPage() {
  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <main className="flex-grow pt-28 pb-16 min-h-screen">
        <SyllabusExplorer />
      </main>
      <Footer />
    </>
  );
}
