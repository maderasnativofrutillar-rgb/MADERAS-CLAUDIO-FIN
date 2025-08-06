'use client';

import Link from "next/link";
import { TreePine, User } from "lucide-react";
import { MainNav } from "./main-nav";
import { CartSheet } from "./cart-sheet";
import { Button } from "./ui/button";
import { AnnouncementBar } from "./announcement-bar";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <AnnouncementBar />
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center space-x-2 mr-6">
          <TreePine className="h-6 w-6 text-primary" />
          <span className="inline-block font-bold font-headline">Madera Nativo Sur</span>
        </Link>
        <div className="flex flex-1 justify-center">
          <MainNav />
        </div>
        <div className="flex items-center justify-end space-x-1">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            <User className="h-5 w-5" />
            <span className="sr-only">Login</span>
          </Link>
          <CartSheet />
        </div>
      </div>
    </header>
  );
}