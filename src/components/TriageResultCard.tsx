import { AlertTriangle, Phone } from "lucide-react";

const LABELS: Record<string, { title: string; description: string; tone: "calm" | "warn" | "danger" | "info"; cta?: { label: string; href: string } }> = {
  autocuidado: {
    title: "Autocuidado em casa",
    description: "Seus sintomas sugerem cuidados simples. Observe a evolução e procure ajuda se piorar.",
    tone: "calm",
  },
  teleconsulta: {
    title: "Teleconsulta recomendada",
    description: "Vale conversar com um profissional online para uma avaliação mais detalhada.",
    tone: "info",
  },
  ubs: {
    title: "Procure uma UBS",
    description: "Recomendamos avaliação presencial em uma Unidade Básica de Saúde nas próximas 24-48h.",
    tone: "info",
  },
  upa_pronto_socorro: {
    title: "Procure UPA / Pronto-Socorro",
    description: "O quadro precisa de avaliação médica hoje. Vá a uma UPA ou Pronto-Socorro.",
    tone: "warn",
  },
  samu_192: {
    title: "Emergência — Ligue 192 agora",
    description: "Os sinais relatados são compatíveis com uma emergência. Ligue para o SAMU imediatamente.",
    tone: "danger",
    cta: { label: "Ligar 192", href: "tel:192" },
  },
};

type Props = {
  recommendation: string;
  urgencyLevel?: string;
  rationale?: string;
  nextSteps?: string[];
  redFlags?: { id: string; label: string; reason: string }[];
};

export function TriageResultCard({ recommendation, urgencyLevel, rationale, nextSteps, redFlags }: Props) {
  const meta = LABELS[recommendation] ?? LABELS.teleconsulta;
  const toneClass = {
    calm: "border-mint/30 bg-mint/5",
    info: "border-primary/20 bg-primary/5",
    warn: "border-warning/30 bg-warning/10",
    danger: "border-destructive/40 bg-destructive/10",
  }[meta.tone];

  return (
    <div className={`my-3 rounded-2xl border p-5 ${toneClass}`}>
      <div className="flex items-start gap-3">
        {meta.tone === "danger" && (
          <AlertTriangle className="h-5 w-5 flex-none text-destructive" />
        )}
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Recomendação{urgencyLevel ? ` · urgência ${urgencyLevel}` : ""}
          </p>
          <h3 className="mt-1 font-display text-2xl text-foreground">{meta.title}</h3>
          <p className="mt-1 text-sm text-foreground/85">{meta.description}</p>

          {rationale && (
            <p className="mt-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Por quê: </span>
              {rationale}
            </p>
          )}

          {nextSteps && nextSteps.length > 0 && (
            <ul className="mt-3 space-y-1.5 text-sm text-foreground/85">
              {nextSteps.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary">→</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          )}

          {redFlags && redFlags.length > 0 && (
            <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-xs font-medium text-destructive">Sinais de alarme detectados</p>
              <ul className="mt-1 space-y-0.5 text-xs text-foreground/80">
                {redFlags.map((f) => (
                  <li key={f.id}>• {f.label} — {f.reason}</li>
                ))}
              </ul>
            </div>
          )}

          {meta.cta && (
            <a
              href={meta.cta.href}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90"
            >
              <Phone className="h-4 w-4" /> {meta.cta.label}
            </a>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            Esta orientação não substitui avaliação médica presencial.
          </p>
        </div>
      </div>
    </div>
  );
}
