import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-soft)]">
            <Activity className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl text-foreground">Asclepio</span>
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            User
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#como-funciona" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Como funciona
          </a>
          <a href="#seguranca" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Segurança
          </a>
          <a href="#limites" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Limites
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            Entrar
          </Button>
          <Button size="sm" className="bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-95">
            Começar
          </Button>
        </div>
      </div>
    </header>
  );
}
