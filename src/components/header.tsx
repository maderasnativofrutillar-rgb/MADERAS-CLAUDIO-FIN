
'use client';

import Link from "next/link";
import { TreePine, User, Menu, LogOut, Mail, Phone } from "lucide-react";
import { MainNav } from "./main-nav";
import { CartSheet } from "./cart-sheet";
import { AnnouncementBar } from "./announcement-bar";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { navLinks } from "./main-nav";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SiteHeaderProps {
  logo?: string;
}

export function SiteHeader({ logo }: SiteHeaderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
      router.push("/");
    } catch (error) {
       toast({
        title: "Error",
        description: "No se pudo cerrar la sesión.",
        variant: "destructive"
      });
    }
  };


  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <AnnouncementBar />
      <div className="container flex h-24 items-center">
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
                      {logo ? (
                        <div className="relative h-10 w-10">
                          <Image src={logo} alt="Logo de la empresa" fill className="object-contain" />
                        </div>
                      ) : (
                        <TreePine className="h-6 w-6 text-primary" />
                      )}
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
          {logo ? (
              <Image src={logo} alt="Logo Madera Nativo Sur" width={140} height={56} className="object-contain" />
          ) : (
            <>
              <TreePine className="h-8 w-8 text-primary" />
            </>
          )}
        </Link>
        <div className="hidden md:flex flex-1 justify-center">
          <MainNav />
        </div>
        <div className="flex items-center justify-end space-x-2 ml-auto">
           <div className="hidden lg:flex items-center space-x-4 border-r pr-4 mr-2">
              <a href="mailto:morenosasesorias@gmail.com" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                  <Mail className="h-5 w-5" />
                  <span className="font-medium">morenosasesorias@gmail.com</span>
              </a>
              <a href="https://wa.me/56912345678" target="_blank" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                  <Phone className="h-5 w-5" />
                  <span className="font-medium">+56 9 1234 5678</span>
              </a>
          </div>

          {user ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-5 w-5" />
                 </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Admin</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                        </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/admin/dashboard')}>
                    <Menu className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar sesión</span>
                  </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link
                          href="/login"
                          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                        >
                          <User className="h-5 w-5" />
                          <span className="sr-only">Login</span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Acceso Admin</p>
                    </TooltipContent>
                </Tooltip>
             </TooltipProvider>
          )}
          <CartSheet />
        </div>
      </div>
    </header>
  );
}
