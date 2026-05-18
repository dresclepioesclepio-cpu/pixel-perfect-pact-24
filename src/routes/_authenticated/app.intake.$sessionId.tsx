import { createFileRoute, Link } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Send, Stethoscope, TriangleAlert as AlertTriangle, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getIntakeSession } from "@/lib/intake.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { TriageResultCard } from "@/components/TriageResultCard";

export const Route = createFileRoute("/_authenticated/app/intake/$sessionId")({
  component: IntakeChat,
  head: () => ({ meta: [{ title: "Orientação — Asclepio" }] }),
});

const QUICK_SYMPTOMS = [
  { label: "Dor no peito", icon: "heart", urgent: true },
  { label: "Falta de ar", icon: "wind", urgent: true },
  { label: "Febre", icon: "thermometer", urgent: false },
  { label: "Dor abdominal", icon: "body", urgent: false },
  { label: "Dor de cabeça", icon: "head", urgent: false },
  { label: "Tontura ou desmaio", icon: "dizzy", urgent: true },
  { label: "Náusea ou vômito", icon: "nausea", urgent: false },
  { label: "Ansiedade / crise emocional", icon: "mind", urgent: false },
  { label: "Sintomas urinários", icon: "urine", urgent: false },
  { label: "Outro sintoma", icon: "other", urgent: false },
];

const STEP_LABELS = [
  "Queixa principal",
  "Duração e intensidade",
  "Sintomas associados",
  "Sinais de alarme",
  "Perfil",
  "Orientação final",
];

function estimateStep(messages: UIMessage[]): number {
  const userCount = messages.filter((m) => m.role === "user").length;
  if (userCount === 0) return 0;
  if (userCount === 1) return 1;
  if (userCount === 2) return 2;
  if (userCount === 3) return 3;
  if (userCount === 4) return 4;
  const hasDecision = messages.some((m) =>
    m.parts?.some((p) => p.type === "tool-triage_decision" && p.state === "output-available"),
  );
  if (hasDecision) return 6;
  return 5;
}

function TriageProgress({ step }: { step: number }) {
  if (step === 0) return null;
  const current = Math.min(step, STEP_LABELS.length);
  const pct = Math.round((current / STEP_LABELS.length) * 100);

  return (
    <div className="border-b border-border/60 bg-secondary/30 px-4 py-2.5 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              Etapa {current} de {STEP_LABELS.length}
            </span>
            {" — "}
            {STEP_LABELS[current - 1] ?? "Orientação final"}
          </p>
          <span className="text-xs font-medium text-primary">{pct}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-[image:var(--gradient-primary)] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function IntakeChat() {
  const { sessionId } = Route.useParams();
  const fetchSession = useServerFn(getIntakeSession);
  const { data: initial, isLoading } = useQuery({
    queryKey: ["intake-session", sessionId],
    queryFn: () => fetchSession({ data: { sessionId } }),
  });

  if (isLoading || !initial) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Carregando conversa…
      </div>
    );
  }

  return <ChatWindow sessionId={sessionId} initialMessages={initial.messages as UIMessage[]} />;
}

function ChatWindow({
  sessionId,
  initialMessages,
}: {
  sessionId: string;
  initialMessages: UIMessage[];
}) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/intake/chat",
        body: { sessionId },
        fetch: async (input, init) => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          const headers = new Headers(init?.headers);
          if (token) headers.set("Authorization", `Bearer ${token}`);
          return fetch(input, { ...init, headers });
        },
      }),
    [sessionId],
  );

  const { messages, sendMessage, status } = useChat({
    id: sessionId,
    messages: initialMessages,
    transport,
  });

  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isBusy = status === "submitted" || status === "streaming";
  const step = estimateStep(messages);

  const hasEmergency = messages.some((m) =>
    m.parts?.some(
      (p) =>
        p.type === "tool-triage_decision" &&
        p.state === "output-available" &&
        (p.output as { recommendation?: string })?.recommendation === "samu_192",
    ),
  );

  useEffect(() => {
    if (!isBusy) textareaRef.current?.focus();
  }, [sessionId, isBusy]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, status]);

  const submit = (text?: string) => {
    const t = (text ?? input).trim();
    if (!t || isBusy) return;
    setInput("");
    void sendMessage({ text: t });
  };

  return (
    <div className="-mx-4 -my-8 flex h-[calc(100vh-9rem)] flex-col sm:-mx-6 sm:-my-12">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/app">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Link>
          </Button>
          <div className="flex flex-1 items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-[image:var(--gradient-primary)] text-primary-foreground">
              <Stethoscope className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground leading-none">Asclepio</p>
              <p className="text-[11px] text-muted-foreground">Orientação inicial de sintomas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <TriageProgress step={step} />

      {/* Emergency banner */}
      {hasEmergency && (
        <div className="bg-destructive px-4 py-3 sm:px-6">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <AlertTriangle className="h-5 w-5 flex-none text-destructive-foreground" />
            <p className="flex-1 text-sm font-medium text-destructive-foreground">
              Sinal de emergência detectado. Acione o SAMU agora.
            </p>
            <a
              href="tel:192"
              className="inline-flex items-center gap-1.5 rounded-lg bg-destructive-foreground px-3 py-1.5 text-xs font-semibold text-destructive"
            >
              <Phone className="h-3.5 w-3.5" /> Ligar 192
            </a>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 sm:px-6">
          {messages.length === 0 && (
            <WelcomeScreen onQuickSymptom={(s) => submit(s)} isBusy={isBusy} />
          )}

          {messages.map((m) => (
            <MessageRow key={m.id} message={m} />
          ))}

          {(status === "submitted" || status === "streaming") && (
            <div className="flex items-center gap-2 pl-1">
              <div className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-primary/10 text-primary">
                <Stethoscope className="h-3.5 w-3.5" />
              </div>
              <Shimmer duration={1.5}>Asclepio está analisando…</Shimmer>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-[var(--shadow-soft)] focus-within:border-primary/40 transition-colors">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Descreva o que está sentindo…"
              rows={2}
              className="min-h-[44px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
              disabled={isBusy}
            />
            <Button
              onClick={() => submit()}
              disabled={!input.trim() || isBusy}
              size="icon"
              className="h-10 w-10 flex-none rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Enter para enviar · Shift+Enter para nova linha · Esta orientação não substitui avaliação
            médica
          </p>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({
  onQuickSymptom,
  isBusy,
}: {
  onQuickSymptom: (symptom: string) => void;
  isBusy: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Welcome card */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-foreground">Olá, sou a Asclepio.</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Vou te ajudar a entender o melhor próximo passo com base nos seus sintomas. A
              avaliação leva poucos minutos e segue etapas estruturadas.
            </p>
            <p className="mt-2 text-xs text-muted-foreground/70">
              Esta orientação não substitui avaliação médica profissional.
            </p>
          </div>
        </div>
      </div>

      {/* Quick symptom buttons */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Escolha um sintoma ou descreva abaixo
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {QUICK_SYMPTOMS.map((s) => (
            <button
              key={s.label}
              onClick={() => onQuickSymptom(s.label)}
              disabled={isBusy}
              className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 ${
                s.urgent
                  ? "border-destructive/30 bg-destructive/5 text-foreground hover:border-destructive/50 hover:bg-destructive/10"
                  : "border-border bg-card text-foreground hover:border-primary/30 hover:bg-primary/5"
              }`}
            >
              {s.urgent && (
                <span className="h-1.5 w-1.5 flex-none rounded-full bg-destructive" />
              )}
              {s.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
            Sintomas marcados exigem verificação de urgência prioritária.
          </span>
        </p>
      </div>
    </div>
  );
}

function ClinicalSummaryCard({ input }: { input: Record<string, unknown> }) {
  const fields: { label: string; key: string }[] = [
    { label: "Sintoma principal", key: "chief_complaint" },
    { label: "Início", key: "onset" },
    { label: "Duração", key: "duration" },
    { label: "Intensidade", key: "intensity" },
    { label: "Localização", key: "location" },
    { label: "Sintomas associados", key: "associated_symptoms" },
    { label: "Sinais de alerta", key: "red_flags" },
  ];

  const entries = fields.filter(({ key }) => {
    const v = input[key];
    return v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0);
  });

  if (entries.length === 0) return null;

  return (
    <div className="my-3 rounded-2xl border border-primary/20 bg-primary/5 p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-primary">
        Resumo do que entendi
      </p>
      <ul className="mt-3 space-y-1.5">
        {entries.map(({ label, key }) => {
          const v = input[key];
          const display = Array.isArray(v) ? v.join(", ") : String(v);
          return (
            <li key={key} className="flex gap-2 text-sm text-foreground">
              <span className="min-w-[120px] font-medium text-muted-foreground">{label}:</span>
              <span>{display}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        Se algo estiver incorreto, basta me avisar antes de continuar.
      </p>
    </div>
  );
}

function MessageRow({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={isUser ? "flex justify-end" : "flex items-start gap-3"}>
      {!isUser && (
        <div className="mt-0.5 grid h-7 w-7 flex-none place-items-center rounded-lg bg-primary/10 text-primary">
          <Stethoscope className="h-3.5 w-3.5" />
        </div>
      )}
      <div className={isUser ? "max-w-[85%]" : "min-w-0 flex-1"}>
        {message.parts.map((part, i) => {
          if (part.type === "text") {
            if (!part.text?.trim()) return null;
            if (isUser) {
              return (
                <div
                  key={i}
                  className="rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground whitespace-pre-wrap"
                >
                  {part.text}
                </div>
              );
            }
            return (
              <p
                key={i}
                className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground"
              >
                {part.text}
              </p>
            );
          }

          if (part.type === "tool-triage_decision" && part.state === "output-available") {
            const out = part.output as {
              recommendation: string;
              urgency_level?: string;
              rationale?: string;
              next_steps?: string[];
              alert_signs?: string[];
              red_flags?: { id: string; label: string; reason: string }[];
            };
            return (
              <TriageResultCard
                key={i}
                recommendation={out.recommendation}
                urgencyLevel={out.urgency_level}
                rationale={out.rationale}
                nextSteps={out.next_steps}
                alertSigns={out.alert_signs}
                redFlags={out.red_flags}
              />
            );
          }

          if (part.type === "tool-extract_symptoms" && part.state === "output-available") {
            const inp = "input" in part ? (part.input as Record<string, unknown>) : null;
            if (!inp) return null;
            return <ClinicalSummaryCard key={i} input={inp} />;
          }

          return null;
        })}
      </div>
    </div>
  );
}
