import Link from "next/link"
import { TreePine } from "lucide-react"

import { cn } from "@/lib/utils"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link href="/" className="flex items-center space-x-2">
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
    </nav>
  )
}
