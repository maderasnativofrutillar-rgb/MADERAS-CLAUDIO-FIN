import * as React from "react"
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
        <Link href={href} className={cn(navigationMenuTriggerStyle(), "group bg-transparent text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:bg-transparent focus:bg-transparent focus:text-primary active:bg-transparent")}>
            <div className="flex flex-col">
                <span>{children}</span>
                <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-primary"></span>
            </div>
        </Link>
    </NavigationMenuLink>
);

const categories = [
    { title: "Tablas para Servir", href: "/tienda?categoria=tablas-para-servir" },
    { title: "Regalos Personalizados", href: "/tienda?categoria=regalos-personalizados" },
    { title: "Tablas de Cocina", href: "/tienda?categoria=tablas-de-cocina" },
    { title: "Platos y Accesorios", href: "/tienda?categoria=platos-y-accesorios" },
    { title: "Empresas y Regalos Corporativos", href: "/tienda?categoria=empresas" },
    { title: "Tablas de Picoteo", href: "/tienda?categoria=tablas-de-picoteo" },
    { title: "Despedida de Soltera", href: "/tienda?categoria=despedida-de-soltera" },
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
                <NavigationMenuTrigger className="group bg-transparent text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:bg-transparent focus:bg-transparent focus:text-primary active:bg-transparent p-0 h-auto">
                    <div className="flex flex-col px-4 py-2">
                        <span>Tienda</span>
                        <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-primary"></span>
                    </div>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    <li className="row-span-7">
                        <NavigationMenuLink asChild>
                        <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            href="/tienda"
                        >
                            <TreePine className="h-6 w-6" />
                            <div className="mb-2 mt-4 text-lg font-medium">
                            Todos los Productos
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                            Explora nuestro catálogo completo de productos artesanales.
                            </p>
                        </Link>
                        </NavigationMenuLink>
                    </li>
                    {categories.slice(0, 7).map((component) => (
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
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
