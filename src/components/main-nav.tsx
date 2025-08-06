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
  import { cn } from "@/lib/utils";
  
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
              <NavigationMenuLink active={pathname === href} className={navigationMenuTriggerStyle()}>
                {label}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}