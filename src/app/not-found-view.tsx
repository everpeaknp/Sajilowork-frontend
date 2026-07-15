"use client";

import Navbar from "@/components/common/navbar";
import Footer from "@/components/common/footer";
import { NotFoundPage } from "@/components/ui/404-page-not-found";

export default function NotFoundView() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
      <Navbar />
      <NotFoundPage className="flex-1" />
      <Footer />
    </div>
  );
}
