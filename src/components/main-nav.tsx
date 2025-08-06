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
    <NavigationMenuItem>
        <Link href={href} legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                {children}
            </NavigationMenuLink>
        </Link>
    </NavigationMenuItem>
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
                <NavLink href="/">Home</NavLink>
                <NavLink href="/about">Sobre Nosotros</NavLink>
                <NavigationMenuItem>
                <NavigationMenuTrigger>
                    Tienda
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                     <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                        <li className="row-span-3">
                             <NavigationMenuLink asChild>
                                <a
                                className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                href="/tienda"
                                >
                                <div className="mb-2 mt-4 text-lg font-medium font-headline">
                                    Todos los Productos
                                </div>
                                <p className="text-sm leading-tight text-muted-foreground">
                                    Explora nuestra colección completa de artesanías en madera.
                                </p>
                                </a>
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
                <NavLink href="/empresas">Empresas</NavLink>
                <NavLink href="/contacto">Contacto</NavLink>
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
