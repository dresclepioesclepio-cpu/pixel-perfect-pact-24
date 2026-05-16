import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessagesSquare, History, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/app/")({
  component: AppHome,
  head: () => ({ meta: [{ title: "Início — Asclepio User" }] }),
});

function AppHome() {
  const { user } = useAuth();
  const greeting = (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? "Olá";

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Bem-vindo</p>
        <h1 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">
          {greeting}, como você está se sentindo hoje?
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Inicie uma nova orientação ou revise sessões anteriores. Lembre-se: este é um suporte
          inicial e não substitui avaliação médica.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-border bg-[image:var(--gradient-primary)] p-8 text-primary-foreground sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" /> Nova sessão
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl">Iniciar orientação de sintomas</h2>
          <p className="mt-2 text-sm text-primary-foreground/85">
            Conte o que está sentindo em linguagem natural. Vamos organizar tudo e indicar o próximo passo.
          </p>
          <Button asChild size="lg" className="mt-6 h-12 bg-card px-6 text-foreground hover:bg-card/90">
            <Link to="/app/intake">
              Começar agora <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <ActionCard
          to="/app/intake"
          icon={MessagesSquare}
          title="Nova orientação"
          desc="Inicie um novo relato de sintomas."
        />
        <ActionCard
          to="/app/history"
          icon={History}
          title="Histórico"
          desc="Veja sessões anteriores e resumos."
        />
        <ActionCard
          to="/app/profile"
          icon={FileText}
          title="Perfil clínico"
          desc="Atualize idade e condições crônicas."
        />
      </div>
    </div>
  );
}

function ActionCard({ to, icon: Icon, title, desc }: { to: string; icon: typeof MessagesSquare; title: string; desc: string }) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
    >
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <span className="mt-4 inline-flex items-center text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Abrir <ArrowRight className="ml-1 h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
