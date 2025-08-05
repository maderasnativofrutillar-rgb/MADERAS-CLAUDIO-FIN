import Link from "next/link"
import { TreePine } from "lucide-react"

import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  import { Button } from "./ui/button"
  
const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <Link href={href} className="group text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        <span>{children}</span>
        <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-primary"></span>
    </Link>
);


export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link href="/" className="flex items-center space-x-2 mr-6">
        <TreePine className="h-6 w-6 text-primary" />
        <span className="inline-block font-bold font-headline">Madera Nativo Sur</span>
      </Link>
      <Link
        href="/"
        className="group text-sm font-medium transition-colors hover:text-primary"
      >
        <span>Home</span>
        <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-primary"></span>
      </Link>
      <NavLink href="/about">Sobre Nosotros</NavLink>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="group text-sm font-medium text-muted-foreground transition-colors hover:text-primary p-0 h-auto focus:ring-0 focus:ring-offset-0 hover:bg-transparent focus-visible:ring-offset-0 focus-visible:ring-0">
                <div className="flex flex-col">
                    <span>Tienda</span>
                    <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-primary"></span>
                </div>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem asChild><Link href="/#products">Todos los Productos</Link></DropdownMenuItem>
            <DropdownMenuItem>Cocina</DropdownMenuItem>
            <DropdownMenuItem>Decoración</DropdownMenuItem>
            <DropdownMenuItem>Muebles</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <NavLink href="/empresas">Empresas</NavLink>
      <NavLink href="/contacto">Contacto</NavLink>
    </nav>
  )
}