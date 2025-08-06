'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Users, Store, Briefcase, Mail } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/about', label: 'Nosotros', icon: Users },
  { href: '/tienda', label: 'Tienda', icon: Store },
  { href: '/empresas', label: 'Empresas', icon: Briefcase },
  { href: '/contacto', label: 'Contacto', icon: Mail },
];

export function MainNav() {
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [indicatorStyle, setIndicatorStyle] = React.useState({});
  const navRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<(HTMLAnchorElement | null)[]>([]);

  React.useEffect(() => {
    const activeItemIndex = navLinks.findIndex((link) => link.href === pathname);
    const indexToUpdate = hoveredIndex ?? activeItemIndex;
    const activeItemRef = itemRefs.current[indexToUpdate];

    if (activeItemRef) {
      const { offsetLeft, clientWidth } = activeItemRef;
      setIndicatorStyle({
        left: `${offsetLeft}px`,
        width: `${clientWidth}px`,
      });
    }
  }, [pathname, hoveredIndex]);

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <nav 
      ref={navRef} 
      className="relative bg-muted p-2 px-4 rounded-full shadow-inner"
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="absolute top-2 bottom-2 bg-background rounded-full shadow-md transition-all duration-300 ease-in-out"
        style={indicatorStyle}
      />
      <div className="relative flex items-center justify-center space-x-2">
        {navLinks.map(({ href, label, icon: Icon }, index) => (
          <Link
            key={href}
            href={href}
            ref={(el) => (itemRefs.current[index] = el)}
            onMouseEnter={() => setHoveredIndex(index)}
            className={cn(
              'relative z-10 flex flex-col items-center justify-center gap-1 w-20 h-12 rounded-full text-center transition-colors duration-300 ease-in-out',
              'text-muted-foreground hover:text-primary',
              { 'text-primary font-medium': pathname === href || hoveredIndex === index }
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
