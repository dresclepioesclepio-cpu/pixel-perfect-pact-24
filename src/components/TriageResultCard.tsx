import { TriangleAlert as AlertTriangle, Phone, ShieldAlert, ArrowRight, Clock, CircleCheck as CheckCircle2 } from "lucide-react";

const LABELS: Record<string, {
  title: string;
  description: string;
  tone: "calm" | "warn" | "danger" | "info";
  urgencyBadge: string;
  urgencyBadgeClass: string;
  cta?: { label: string; href: string };
}> = {
  autocuidado: {
    title: "Autocuidado em casa",
    description: "Seus sintomas sugerem cuidados simples que podem ser manejados em casa.",
    tone: "calm",
    urgencyBadge: "Urgência baixa",
    urgencyBadgeClass: "bg-mint/20 text-mint-foreground border-mint/30",
  },
  teleconsulta: {
    title: "Teleconsulta recomendada",
    description: "Vale conversar com um profissional de saúde online para uma avaliação mais detalhada.",
    tone: "info",
    urgencyBadge: "Urgência baixa",
    urgencyBadgeClass: "bg-primary/10 text-primary border-primary/20",
  },
  ubs: {
    title: "Procure uma UBS",
    description: "Recomendamos avaliação presencial em uma Unidade Básica de Saúde nas próximas 24–48h.",
    tone: "info",
    urgencyBadge: "Urgência moderada",
    urgencyBadgeClass: "bg-primary/10 text-primary border-primary/20",
  },
  upa_pronto_socorro: {
    title: "Procure UPA / Pronto-Socorro",
    description: "O quadro precisa de avaliação médica hoje. Vá a uma UPA ou Pronto-Socorro.",
    tone: "warn",
    urgencyBadge: "Urgência alta",
    urgencyBadgeClass: "bg-warning/20 text-warning-foreground border-warning/30",
  },
  samu_192: {
    title: "Emergência — Ligue 192 agora",
    description: "Os sinais relatados são compatíveis com uma emergência médica. Acione o SAMU imediatamente.",
    tone: "danger",
    urgencyBadge: "Emergência",
    urgencyBadgeClass: "bg-destructive/15 text-destructive border-destructive/30",
    cta: { label: "Ligar 192 — SAMU", href: "tel:192" },
  },
};

const URGENCY_OVERRIDE: Record<string, { badge: string; cls: string }> = {
  baixa: { badge: "Urgência baixa", cls: "bg-mint/20 text-mint-foreground border-mint/30" },
  media: { badge: "Urgência moderada", cls: "bg-primary/10 text-primary border-primary/20" },
  alta: { badge: "Urgência alta", cls: "bg-warning/20 text-warning-foreground border-warning/30" },
  emergencia: { badge: "Emergência", cls: "bg-destructive/15 text-destructive border-destructive/30" },
};

type Props = {
  recommendation: string;
  urgencyLevel?: string;
  rationale?: string;
  nextSteps?: string[];
  alertSigns?: string[];
  redFlags?: { id: string; label: string; reason: string }[];
};

export function TriageResultCard({ recommendation, urgencyLevel, rationale, nextSteps, alertSigns, redFlags }: Props) {
  const meta = LABELS[recommendation] ?? LABELS.teleconsulta;

  const urgencyOverride = urgencyLevel ? URGENCY_OVERRIDE[urgencyLevel] : undefined;
  const badgeText = urgencyOverride?.badge ?? meta.urgencyBadge;
  const badgeClass = urgencyOverride?.cls ?? meta.urgencyBadgeClass;

  const containerClass = {
    calm: "border-mint/30 bg-mint/5",
    info: "border-primary/20 bg-primary/5",
    warn: "border-warning/30 bg-warning/10",
    danger: "border-destructive/40 bg-destructive/10",
  }[meta.tone];

  return (
    <div className={`my-4 rounded-2xl border ${containerClass} overflow-hidden`}>
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex flex-wrap items-start gap-3">
          {meta.tone === "danger" && (
            <div className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-destructive/15">
              <AlertTriangle className="h-4.5 w-4.5 text-destructive" />
            </div>
          )}
          {meta.tone === "warn" && (
            <div className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-warning/15">
              <Clock className="h-4 w-4 text-warning-foreground" />
            </div>
          )}
          {(meta.tone === "calm" || meta.tone === "info") && (
            <div className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-primary/10">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}>
                {badgeText}
              </span>
            </div>
            <h3 className="mt-1.5 font-display text-2xl leading-tight text-foreground">{meta.title}</h3>
            <p className="mt-1 text-sm text-foreground/80">{meta.description}</p>
          </div>
        </div>

        {meta.cta && (
          <a
            href={meta.cta.href}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-destructive px-5 py-3 text-sm font-semibold text-destructive-foreground shadow-sm hover:bg-destructive/90 transition-colors"
          >
            <Phone className="h-4 w-4" /> {meta.cta.label}
          </a>
        )}
      </div>

      {/* Divider */}
      {(rationale || (nextSteps && nextSteps.length > 0) || (alertSigns && alertSigns.length > 0) || (redFlags && redFlags.length > 0)) && (
        <div className="border-t border-current/10 opacity-20 mx-5" />
      )}

      {/* Body sections */}
      <div className="px-5 pb-5 space-y-4">
        {/* Rationale */}
        {rationale && (
          <div className="pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Por que essa recomendação</p>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">{rationale}</p>
          </div>
        )}

        {/* Next steps */}
        {nextSteps && nextSteps.length > 0 && (
          <div className={rationale ? "" : "pt-4"}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">O que fazer agora</p>
            <ul className="mt-2 space-y-1.5">
              {nextSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 flex-none text-primary" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Alert signs — when to seek immediate help */}
        {alertSigns && alertSigns.length > 0 && (
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-warning-foreground">
              <ShieldAlert className="h-3.5 w-3.5" />
              Sinais para procurar ajuda imediatamente
            </p>
            <ul className="mt-1.5 space-y-1 text-xs text-foreground/80">
              {alertSigns.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="mt-0.5 h-1 w-1 flex-none rounded-full bg-warning-foreground/60" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Red flags triggered by engine */}
        {redFlags && redFlags.length > 0 && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" />
              Sinais de alarme detectados pelo sistema
            </p>
            <ul className="mt-1.5 space-y-1 text-xs text-foreground/80">
              {redFlags.map((f) => (
                <li key={f.id} className="flex items-start gap-1.5">
                  <span className="mt-0.5 h-1 w-1 flex-none rounded-full bg-destructive/60" />
                  <span><span className="font-medium">{f.label}</span> — {f.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimer */}
        <div className={`${!(rationale || (nextSteps?.length) || (alertSigns?.length) || (redFlags?.length)) ? "pt-4" : ""} rounded-lg bg-muted/40 px-3 py-2`}>
          <p className="text-xs text-muted-foreground">
            Essa orientação não substitui uma avaliação médica profissional. Em caso de dúvida, procure atendimento.
          </p>
        </div>
      </div>
    </div>
  );
}
