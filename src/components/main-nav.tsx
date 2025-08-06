import React from "react"
import Link from "next/link"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
  } from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <Link href={href} legacyBehavior passHref>
        <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "group relative bg-transparent text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:bg-transparent focus:bg-transparent focus:text-primary active:bg-transparent")}>
          <a>
            {children}
            <span className="absolute bottom-0 left-0 block h-0.5 bg-primary transition-all duration-300 max-w-0 group-hover:max-w-full"></span>
          </a>
        </NavigationMenuLink>
    </Link>
);
  
const categories = [
    { title: "Tablas para Servir", href: "/tienda?categoria=tablas-para-servir" },
    { title: "Regalos Personalizados", href: "/tienda?categoria=regalos-personalizados"},
    { title: "Tablas de Cocina", href: "/tienda?categoria=tablas-de-cocina" },
    { title: "Platos y Accesorios", href: "/tienda?categoria=platos-y-accesorios"},
    { title: "Empresas y Regalos Corporativos", href: "/tienda?categoria=empresas" },
    { title: "Tablas de Picoteo", href: "/tienda?categoria=tablas-de-picoteo" },
    { title: "Despedida de Soltera", href: "/tienda?categoria=despedida-de-soltera" },
];

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <NavigationMenu {...props}>
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
                     <ul className="grid w-[250px] gap-1 p-4 md:w-[300px]">
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
