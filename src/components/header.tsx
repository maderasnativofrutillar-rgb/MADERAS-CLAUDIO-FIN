'use client';

import Link from "next/link";
import { TreePine, User } from "lucide-react";
import { MainNav } from "./main-nav";
import { CartSheet } from "./cart-sheet";
import { Button } from "./ui/button";
import { AnnouncementBar } from "./announcement-bar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <AnnouncementBar />
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <Link href="/login">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Login</span>
              </Button>
            </Link>
            <CartSheet />
          </nav>
        </div>
      </div>
    </header>
  );
}
