'use client';

import Link from "next/link";
import { TreePine, User, Menu } from "lucide-react";
import { MainNav } from "./main-nav";
import { CartSheet } from "./cart-sheet";
import { AnnouncementBar } from "./announcement-bar";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { navLinks } from "./main-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <AnnouncementBar />
      <div className="container flex h-16 items-center">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium mt-6">
                    <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
                        <TreePine className="h-6 w-6 text-primary" />
                        <span className="font-bold font-headline">Nativo Sur</span>
                    </Link>
                    {navLinks.map(({ href, label }) => (
                         <Link key={href} href={href} className="hover:text-primary">{label}</Link>
                    ))}
                </nav>
            </SheetContent>
          </Sheet>
        </div>
        <Link href="/" className="hidden md:flex items-center space-x-2 mr-6">
          <TreePine className="h-6 w-6 text-primary" />
          <span className="inline-block font-bold font-headline">Madera Nativo Sur</span>
        </Link>
        <div className="hidden md:flex flex-1 justify-center">
          <MainNav />
        </div>
        <div className="flex items-center justify-end space-x-1 ml-auto">
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
