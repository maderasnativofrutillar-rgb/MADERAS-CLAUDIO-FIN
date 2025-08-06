'use client';

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "Sobre Nosotros" },
    { href: "/tienda", label: "Tienda" },
    { href: "/empresas", label: "Empresas" },
    { href: "/contacto", label: "Contacto" },
];

export function MainNav() {
    const pathname = usePathname();

    return (
       <NavigationMenu>
        <NavigationMenuList>
            {navLinks.map(({ href, label }) => (
                 <NavigationMenuItem key={href}>
                    <NavigationMenuLink asChild active={pathname === href} className={cn(navigationMenuTriggerStyle(), "group relative bg-transparent text-foreground/60 hover:text-foreground/80")}>
                        <Link href={href}>
                           {label}
                            <span
                                className={cn(
                                    "absolute inset-x-0 bottom-0 h-0.5 bg-primary transition-all duration-300 ease-out",
                                    "w-0 group-hover:w-full",
                                    { "w-full": pathname === href }
                                )}
                            />
                        </Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
            ))}
        </NavigationMenuList>
        </NavigationMenu>
    );
}
