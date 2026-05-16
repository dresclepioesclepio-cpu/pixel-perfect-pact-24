import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  ScrollText,
  Sparkles,
  Lock,
  FileCheck2,
  Hospital,
  Phone,
  Home,
  Ambulance,
  AlertOctagon,
  MessagesSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmergencyBanner } from "@/components/EmergencyBanner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Asclepio User — Orientação inicial de sintomas com segurança" },
      {
        name: "description",
        content:
          "Plataforma de orientação inicial de sintomas. IA para linguagem, regras para segurança, guardrails para confiança. Não diagnostica nem prescreve.",
      },
      { property: "og:title", content: "Asclepio User — Orientação inicial de sintomas" },
      {
        property: "og:description",
        content:
          "Organize seus sintomas e descubra o próximo passo de cuidado com segurança e transparência.",
      },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <EmergencyBanner />
      <SiteHeader />

      <main>
        <Hero />
        <Principle />
        <HowItWorks />
        <Destinations />
        <Safety />
        <Limits />
        <FinalCta />
      </main>

      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[image:var(--gradient-hero)]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[380px] w-[380px] rounded-full bg-mint/15 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/70 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Orientação inicial, não diagnóstico
          </span>

          <h1 className="mt-6 font-display text-5xl leading-[1.05] text-foreground sm:text-6xl lg:text-7xl">
            Entenda seus sintomas.{" "}
            <span className="bg-gradient-to-r from-primary to-mint bg-clip-text text-transparent">
              Saiba o próximo passo.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            O Asclepio User organiza seu relato, identifica sinais de alerta por regras clínicas
            e indica o cuidado adequado — de casa ao pronto-socorro — com linguagem clara e
            humana.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="group h-12 bg-[image:var(--gradient-primary)] px-6 text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-95"
            >
              <Link to="/signup">
                Iniciar orientação
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="h-12 px-6">
              <a href="#como-funciona">Como funciona</a>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> LGPD por design
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Regras versionadas
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileCheck2 className="h-3.5 w-3.5" /> Logs auditáveis
            </span>
          </div>
        </div>

        <HeroCard />
      </div>
    </section>
  );
}

function HeroCard() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/15 via-mint/10 to-transparent blur-2xl" />
      <div className="relative rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-glow)]">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-mint" />
          Sessão segura · v1.0
        </div>

        <div className="mt-5 space-y-4">
          <Bubble role="user">
            Estou com dor de cabeça forte há 2 dias e um pouco de febre.
          </Bubble>
          <Bubble role="ai">
            Entendi. Posso te perguntar mais algumas coisas para entender melhor? A dor é em um lado
            só, há rigidez no pescoço ou sensibilidade à luz?
          </Bubble>
          <Bubble role="user">Sem rigidez. A luz incomoda um pouco.</Bubble>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-secondary/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Orientação
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-mint/15 px-2 py-0.5 text-xs font-medium text-primary">
              <Stethoscope className="h-3 w-3" /> Consulta médica
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground">
            Procure uma consulta médica em até 24h. Não identificamos sinais de emergência, mas seus
            sintomas merecem avaliação profissional.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Esta é uma orientação inicial e não substitui avaliação médica.
          </p>
        </div>
      </div>
    </div>
  );
}

function Bubble({ role, children }: { role: "user" | "ai"; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border border-border bg-background text-foreground"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function Principle() {
  const items = [
    { icon: MessagesSquare, title: "IA para linguagem", desc: "Entende seu relato em palavras simples." },
    { icon: ShieldCheck, title: "Regras para segurança", desc: "Red flags determinísticas e auditáveis." },
    { icon: Sparkles, title: "Guardrails para confiança", desc: "Sem diagnóstico, sem prescrição." },
    { icon: ScrollText, title: "Logs para auditoria", desc: "Toda decisão registrada e versionada." },
  ];
  return (
    <section className="border-y border-border/60 bg-secondary/30 py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-center font-display text-2xl text-foreground sm:text-3xl">
          Quatro princípios que tornam orientação inicial segura.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 font-medium text-foreground">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Conte o que você sente",
      desc: "Conversa natural ou formulário guiado. Sem termos técnicos.",
    },
    {
      n: "02",
      title: "Estruturamos os sintomas",
      desc: "Duração, intensidade, fatores de risco e sintomas associados.",
    },
    {
      n: "03",
      title: "Regras detectam red flags",
      desc: "Motor determinístico identifica sinais de alerta versionados.",
    },
    {
      n: "04",
      title: "Você recebe a orientação",
      desc: "Próximo passo de cuidado claro, com justificativa e sinais de alerta.",
    },
  ];
  return (
    <section id="como-funciona" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Como funciona
          </span>
          <h2 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">
            Um caminho transparente — do relato à decisão.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.n}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-[var(--shadow-soft)]"
            >
              <span className="font-display text-5xl text-primary/15 transition-colors group-hover:text-primary/30">
                {s.n}
              </span>
              <p className="mt-3 font-medium text-foreground">{s.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Destinations() {
  const dests = [
    { icon: Home, label: "Cuidado em casa", tone: "bg-mint/15 text-primary" },
    { icon: Stethoscope, label: "Consulta médica", tone: "bg-primary/10 text-primary" },
    { icon: Phone, label: "Teleconsulta", tone: "bg-accent text-accent-foreground" },
    { icon: Hospital, label: "Pronto atendimento", tone: "bg-warning/20 text-warning-foreground" },
    { icon: Ambulance, label: "Emergência / SAMU", tone: "bg-destructive/10 text-destructive" },
  ];
  return (
    <section className="border-y border-border/60 bg-secondary/30 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              5 destinos possíveis
            </span>
            <h2 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">
              Da casa à emergência, sempre com justificativa.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            O destino é definido por regras determinísticas. A IA explica — nunca decide sozinha em
            casos críticos.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {dests.map(({ icon: Icon, label, tone }) => (
            <div
              key={label}
              className="rounded-2xl border border-border bg-card p-5 transition-transform hover:-translate-y-0.5"
            >
              <div className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Safety() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Red Flag Engine",
      desc: "Sinais de AVC, dor torácica, sangramentos graves e mais — capturados por regras versionadas.",
    },
    {
      icon: Lock,
      title: "Privacidade por design",
      desc: "RLS em todas as tabelas, consentimento explícito e coleta mínima de dados.",
    },
    {
      icon: FileCheck2,
      title: "Auditoria completa",
      desc: "Cada sessão guarda entrada, regras acionadas, decisão e versão. Sem caixa-preta.",
    },
  ];
  return (
    <section id="seguranca" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              Segurança
            </span>
            <h2 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">
              Construído para falhar com segurança.
            </h2>
            <p className="mt-5 text-muted-foreground">
              A IA generativa nunca reduz o nível de risco definido pelas regras. Em sinais de
              emergência, a orientação é sempre buscar atendimento imediato.
            </p>
          </div>

          <div className="space-y-4">
            {items.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex gap-4 rounded-2xl border border-border bg-card p-6"
              >
                <div className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Limits() {
  const cans = [
    "Entender seu relato em linguagem natural",
    "Organizar sintomas em dados estruturados",
    "Fazer perguntas progressivas relevantes",
    "Explicar a orientação em linguagem simples",
    "Gerar resumo para levar ao médico",
  ];
  const cants = [
    "Diagnóstico definitivo",
    "Prescrição de medicamentos",
    "Reduzir risco definido pelo protocolo",
    "Afirmar ausência total de risco",
    "Substituir consulta ou emergência",
  ];
  return (
    <section id="limites" className="border-t border-border/60 bg-secondary/30 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Limites claros
          </span>
          <h2 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">
            O que a IA faz — e o que ela nunca fará.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-7">
            <p className="text-sm font-medium uppercase tracking-wider text-primary">A IA faz</p>
            <ul className="mt-5 space-y-3">
              {cans.map((c) => (
                <li key={c} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-mint" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-destructive/20 bg-destructive/[0.03] p-7">
            <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-destructive">
              <AlertOctagon className="h-4 w-4" /> A IA nunca faz
            </p>
            <ul className="mt-5 space-y-3">
              {cants.map((c) => (
                <li key={c} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-destructive" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-[image:var(--gradient-primary)] p-10 text-primary-foreground sm:p-16">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-mint/30 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">
              Comece sua orientação inicial agora.
            </h2>
            <p className="mt-4 text-primary-foreground/85">
              Leva poucos minutos. Privado, auditável e seguro — sempre com o disclaimer de que
              não substitui avaliação médica.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 bg-card px-6 text-foreground hover:bg-card/90"
              >
                <Link to="/signup">
                  Iniciar orientação
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="h-12 px-6 text-primary-foreground hover:bg-white/10"
              >
                <Link to="/login">Já tenho conta</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
