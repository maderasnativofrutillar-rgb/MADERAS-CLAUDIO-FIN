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
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Home
      </Link>
      <Link
        href="/about"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Sobre Nosotros
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary p-0 h-auto">
                Tienda
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem asChild><Link href="/#products">Todos los Productos</Link></DropdownMenuItem>
            <DropdownMenuItem>Cocina</DropdownMenuItem>
            <DropdownMenuItem>Decoración</DropdownMenuItem>
            <DropdownMenuItem>Muebles</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Link
        href="/empresas"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Empresas
      </Link>
      <Link
        href="/contacto"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Contacto
      </Link>
    </nav>
  )
}
