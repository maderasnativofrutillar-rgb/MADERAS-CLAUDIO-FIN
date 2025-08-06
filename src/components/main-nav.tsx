'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Users, Store, Briefcase, Mail } from 'lucide-react';

export const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/about', label: 'Nosotros', icon: Users },
  { href: '/tienda', label: 'Tienda', icon: Store },
  { href: '/empresas', label: 'Empresas', icon: Briefcase },
  { href: '/contacto', label: 'Contacto', icon: Mail },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="relative bg-muted p-2 px-4 rounded-full shadow-inner">
      <div className="flex items-center justify-center space-x-2">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              data-active={isActive}
              className={cn(
                'group relative flex flex-col items-center justify-center gap-1 w-20 h-12 rounded-full text-center transition-colors duration-300 ease-in-out',
                'text-muted-foreground hover:text-primary',
                { 'text-primary': isActive }
              )}
            >
              <div 
                className={cn(
                  'absolute inset-0 bg-background rounded-full shadow-md transition-transform transform scale-0 origin-center',
                  'group-hover:scale-100',
                  { 'scale-100': isActive }
                )}
              />
              <Icon className="relative z-10 h-5 w-5" />
              <span className="relative z-10 text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
