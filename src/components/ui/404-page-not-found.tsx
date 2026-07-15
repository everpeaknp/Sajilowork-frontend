"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NotFoundPageProps = {
  className?: string;
  homeHref?: string;
};

export function NotFoundPage({ className, homeHref = "/" }: NotFoundPageProps) {
  return (
    <section
      className={cn(
        "flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white font-serif dark:bg-neutral-950",
        className,
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <div className="w-full text-center sm:w-10/12 md:w-8/12">
            <div
              className="flex h-[220px] items-center justify-center bg-gradient-to-br from-brand-emerald/10 via-white to-brand-dark/5 sm:h-[280px] md:h-[320px] dark:from-brand-emerald/20 dark:via-neutral-950 dark:to-brand-emerald/5"
              aria-hidden="true"
            >
              <h1 className="pt-6 text-center text-6xl text-black sm:pt-8 sm:text-7xl md:text-8xl dark:text-stone-100">
                404
              </h1>
            </div>

            <div className="-mt-[50px]">
              <h3 className="mb-4 text-2xl font-bold text-black sm:text-3xl dark:text-stone-100">
                Look like you&apos;re lost
              </h3>
              <p className="mb-6 text-black sm:mb-5 dark:text-neutral-300">
                The page you are looking for is not available!
              </p>

              <Button
                asChild
                variant="default"
                className="my-5 bg-brand-emerald text-white hover:bg-[#3d9665] dark:bg-brand-emerald dark:text-neutral-950 dark:hover:bg-emerald-400"
              >
                <Link href={homeHref}>Go to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
