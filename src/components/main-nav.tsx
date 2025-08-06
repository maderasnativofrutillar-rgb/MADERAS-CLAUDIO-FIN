import React from "react"
import Link from "next/link"
import { TreePine } from "lucide-react"

import { cn } from "@/lib/utils"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
  } from "@/components/ui/navigation-menu"
  
const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <NavigationMenuLink asChild>
        <Link href={href} className={cn(navigationMenuTriggerStyle(), "group relative bg-transparent text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:bg-transparent focus:bg-transparent focus:text-primary active:bg-transparent")}>
            {children}
            <span className="absolute bottom-0 left-0 block h-0.5 bg-primary transition-all duration-300 max-w-0 group-hover:max-w-full"></span>
        </Link>
    </NavigationMenuLink>
);

const categories = [
    { title: "Tablas para Servir", href: "/tienda?categoria=tablas-para-servir", description: "Ideales para presentar tus aperitivos con estilo." },
    { title: "Regalos Personalizados", href: "/tienda?categoria=regalos-personalizados", description: "Crea un regalo único con grabado láser." },
    { title: "Tablas de Cocina", href: "/tienda?categoria=tablas-de-cocina", description: "Tablas robustas para el uso diario." },
    { title: "Platos y Accesorios", href: "/tienda?categoria=platos-y-accesorios", description: "Complementa tu mesa con nuestros accesorios." },
    { title: "Empresas", href: "/tienda?categoria=empresas", description: "Regalos corporativos que marcan la diferencia." },
    { title: "Tablas de Picoteo", href: "/tienda?categoria=tablas-de-picoteo", description: "Perfectas para compartir con amigos." },
    { title: "Despedida de Soltera", href: "/tienda?categoria=despedida-de-soltera", description: "Regalos originales para un día especial." },
];

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <NavigationMenu>
        <div className={cn("flex items-center", className)}>
            <Link href="/" className="flex items-center space-x-2 mr-6">
                <TreePine className="h-6 w-6 text-primary" />
                <span className="inline-block font-bold font-headline">Madera Nativo Sur</span>
            </Link>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavLink href="/">Home</NavLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavLink href="/about">Sobre Nosotros</NavLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                <NavigationMenuTrigger className="group relative bg-transparent text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:bg-transparent focus:bg-transparent focus:text-primary active:bg-transparent p-0 h-auto px-4 py-2">
                    Tienda
                    <span className="absolute bottom-0 left-0 block h-0.5 bg-primary transition-all duration-300 max-w-0 group-hover:max-w-full"></span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                     <ul className="grid w-[300px] gap-1 p-4 md:w-[400px]">
                        <li className="mb-2">
                             <NavigationMenuLink asChild>
                                <Link href="/tienda" className="font-headline font-bold text-lg hover:text-primary transition-colors">
                                    Todos los Productos
                                </Link>
                             </NavigationMenuLink>
                        </li>
                        {categories.map((component) => (
                            <ListItem
                                key={component.title}
                                title={component.title}
                                href={component.href}
                            />
                        ))}
                    </ul>
                </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavLink href="/empresas">Empresas</NavLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavLink href="/contacto">Contacto</NavLink>
                </NavigationMenuItem>
            </NavigationMenuList>
        </div>
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "group/item relative block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors text-muted-foreground hover:text-accent-foreground focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <span className="absolute left-0 top-0 h-full bg-primary/20 transition-all duration-300 ease-in-out w-0 group-hover/item:w-full"></span>
          <div className="relative text-sm font-medium leading-none">{title}</div>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
