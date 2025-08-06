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
                    <Link href={href} legacyBehavior passHref>
                        <NavigationMenuLink active={pathname === href} className={cn(navigationMenuTriggerStyle(), "relative group", pathname === href ? "text-foreground/60" : "text-foreground/60")}>
                           {label}
                           <span
                                className={cn(
                                    "absolute left-0 -bottom-1 h-0.5 bg-primary transition-all duration-300",
                                    "w-0 group-hover:w-full"
                                )}
                            />
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
            ))}
        </NavigationMenuList>
        </NavigationMenu>
    );
}
