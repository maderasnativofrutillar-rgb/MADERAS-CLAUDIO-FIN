'use client';

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { categories } from "@/lib/constants";
import { ListItem } from "./ListItem";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "Sobre Nosotros" },
    // Tienda se manejará por separado con el dropdown
    { href: "/empresas", label: "Empresas" },
    { href: "/contacto", label: "Contacto" },
];

function slugify(text: string) {
    return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

export function MainNav() {
    const pathname = usePathname();

    return (
       <NavigationMenu>
        <NavigationMenuList>
            {navLinks.map(({ href, label }) => (
                 <NavigationMenuItem key={href}>
                    <Link href={href} legacyBehavior passHref>
                        <NavigationMenuLink active={pathname === href} className={cn(navigationMenuTriggerStyle(), "relative group", pathname === href ? "text-primary" : "text-foreground/60")}>
                           {label}
                           <span
                                className={cn(
                                    "absolute left-0 -bottom-1 h-0.5 bg-primary transition-all duration-300",
                                    pathname === href ? "w-full" : "w-0 group-hover:w-full"
                                )}
                            />
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
            ))}
             <NavigationMenuItem>
                <NavigationMenuTrigger className={cn("relative group", pathname.startsWith('/tienda') ? "text-primary" : "text-foreground/60")}>
                    Tienda
                    <span
                        className={cn(
                            "absolute left-0 -bottom-1 h-0.5 bg-primary transition-all duration-300",
                            pathname.startsWith('/tienda') ? "w-full" : "w-0 group-hover:w-full"
                        )}
                    />
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    {categories.map((category) => (
                    <ListItem
                        key={category}
                        title={category}
                        href={`/tienda?categoria=${slugify(category)}`}
                    >
                    </ListItem>
                    ))}
                </ul>
                </NavigationMenuContent>
            </NavigationMenuItem>
        </NavigationMenuList>
        </NavigationMenu>
    );
}