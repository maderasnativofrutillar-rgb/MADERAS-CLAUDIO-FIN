
'use client';

import Link from "next/link";
import { TreePine, User, Menu, LogOut, Mail, Phone, ShieldCheck, UserCog } from "lucide-react";
import { MainNav } from "./main-nav";
import { CartSheet } from "./cart-sheet";
import { AnnouncementBar } from "./announcement-bar";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { navLinks } from "./main-nav";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
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
import { doc, getDoc } from "firebase/firestore";

interface SiteHeaderProps {
  logo?: string;
}

interface AppUser extends FirebaseUser {
    role?: string;
}

export function SiteHeader({ logo }: SiteHeaderProps) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  useEffect(() => {
    setIsClient(true);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            const userDocRef = doc(db, "users", currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            let role = null;
            if (userDocSnap.exists()) {
                role = userDocSnap.data().role || null;
            }
            setUser({ ...currentUser, role });
        } else {
            setUser(null);
        }
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
           <div className="hidden lg:flex flex-col items-start space-y-1 border-r pr-4 mr-2">
              <a href="mailto:morenosasesorias@gmail.com" className="flex items-center gap-2 text-xs group">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">morenosasesorias@gmail.com</span>
              </a>
              <a href="https://wa.me/56959328956" target="_blank" className="flex items-center gap-2 text-xs group">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">+56 9 5932 8956</span>
              </a>
          </div>

          {isClient && user ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-5 w-5" />
                 </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2">
                            {user.role === 'admin' ? <UserCog className="h-4 w-4 text-primary" /> : <ShieldCheck className="h-4 w-4 text-primary" />}
                            <p className="text-sm font-medium leading-none capitalize">{user.role || 'Supervisor'}</p>
                        </div>
                        <p className="text-xs leading-none text-muted-foreground pl-6">
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
