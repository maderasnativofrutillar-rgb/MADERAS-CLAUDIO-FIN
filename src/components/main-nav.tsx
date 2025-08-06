'use client';

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Users, Store, Briefcase, Mail } from "lucide-react";

const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "Nosotros", icon: Users },
    { href: "/tienda", label: "Tienda", icon: Store },
    { href: "/empresas", label: "Empresas", icon: Briefcase },
    { href: "/contacto", label: "Contacto", icon: Mail },
];

export function MainNav() {
    const pathname = usePathname();
    const [indicatorStyle, setIndicatorStyle] = React.useState({});
    const navRef = React.useRef<HTMLDivElement>(null);
    const itemRefs = React.useRef<(HTMLAnchorElement | null)[]>([]);

    React.useEffect(() => {
        const activeItemIndex = navLinks.findIndex(link => pathname === link.href);
        const activeItemRef = itemRefs.current[activeItemIndex];

        if (activeItemRef && navRef.current) {
            const { offsetLeft, clientWidth } = activeItemRef;
            setIndicatorStyle({
                left: `${offsetLeft}px`,
                width: `${clientWidth}px`,
            });
        }
    }, [pathname]);

    return (
        <nav ref={navRef} className="relative bg-secondary-foreground p-2 rounded-full shadow-inner">
            <div 
                className="absolute top-2 bottom-2 bg-secondary rounded-full shadow-md transition-all duration-300 ease-in-out" 
                style={indicatorStyle}
            />
            <div className="relative flex items-center justify-center space-x-2">
                {navLinks.map(({ href, label, icon: Icon }, index) => (
                    <Link
                        key={href}
                        href={href}
                        ref={el => itemRefs.current[index] = el}
                        className={cn(
                            "relative z-10 flex flex-col items-center justify-center gap-1 w-20 h-12 rounded-full text-center transition-colors duration-300 ease-in-out",
                            "text-secondary hover:text-primary",
                            { "text-primary font-medium": pathname === href }
                        )}
                    >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs font-medium">{label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
