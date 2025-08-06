'use client';

import * as React from "react"
import Link from "next/link"
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { usePathname } from "next/navigation";

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
                        <NavigationMenuLink
                            asChild
                            active={pathname === href}
                            className={navigationMenuTriggerStyle()}
                        >
                            <Link href={href}>
                                {label}
                            </Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    );
}