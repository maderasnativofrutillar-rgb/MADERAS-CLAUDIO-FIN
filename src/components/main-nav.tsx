'use client';

import Link from "next/link"
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
        <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map(({ href, label }) => (
                <Link
                    key={href}
                    href={href}
                    className={cn(
                        "transition-colors hover:text-primary relative group",
                        pathname === href ? "text-primary" : "text-foreground/60"
                    )}
                >
                    {label}
                    <span
                        className={cn(
                            "absolute left-0 -bottom-1 h-0.5 bg-primary transition-all duration-300",
                            "w-0 group-hover:w-full",
                            { "w-full": pathname === href }
                        )}
                    />
                </Link>
            ))}
        </nav>
    );
}
