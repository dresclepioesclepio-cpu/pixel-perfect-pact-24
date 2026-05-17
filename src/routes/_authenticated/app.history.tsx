import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Activity, ArrowRight, Clock } from "lucide-react";
import { listIntakeSessions } from "@/lib/intake.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/app/history")({
  component: HistoryPage,
  head: () => ({ meta: [{ title: "Histórico — Asclepio" }] }),
});

const REC_LABELS: Record<string, string> = {
  autocuidado: "Autocuidado",
  teleconsulta: "Teleconsulta",
  ubs: "UBS",
  upa_pronto_socorro: "UPA / PS",
  samu_192: "SAMU 192",
};

const URG_TONE: Record<string, string> = {
  baixa: "bg-mint/15 text-mint-foreground",
  media: "bg-primary/10 text-primary",
  alta: "bg-warning/20 text-warning-foreground",
  emergencia: "bg-destructive/15 text-destructive",
};

function HistoryPage() {
  const fetchSessions = useServerFn(listIntakeSessions);
  const { data, isLoading } = useQuery({
    queryKey: ["intake-sessions"],
    queryFn: () => fetchSessions({}),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Histórico</p>
          <h1 className="mt-1 font-display text-3xl text-foreground sm:text-4xl">Suas orientações</h1>
        </div>
        <Button asChild>
          <Link to="/app/intake">Nova orientação</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Carregando…
        </div>
      ) : (data?.sessions ?? []).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <Activity className="h-5 w-5" />
          </div>
          <p className="mt-4 font-medium text-foreground">Nenhuma orientação ainda</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Comece uma nova sessão para receber orientação inicial.
          </p>
          <Button asChild className="mt-5">
            <Link to="/app/intake">Iniciar agora</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {data!.sessions.map((s) => (
            <li key={s.id}>
              <Link
                to="/app/intake/$sessionId"
                params={{ sessionId: s.id }}
                className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
              >
                <div className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-primary/10 text-primary">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {s.recommendation && (
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${URG_TONE[s.urgency_level ?? "baixa"] ?? "bg-muted text-muted-foreground"}`}>
                        {REC_LABELS[s.recommendation] ?? s.recommendation}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(s.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </div>
                  <p className="mt-1.5 truncate text-sm text-foreground">
                    {s.chief_complaint ?? <span className="text-muted-foreground italic">Sem queixa registrada</span>}
                  </p>
                </div>
                <ArrowRight className="mt-3 h-4 w-4 flex-none text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
