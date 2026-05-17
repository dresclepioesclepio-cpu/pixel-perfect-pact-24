import { createFileRoute, Link } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
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

function ChatWindow({ sessionId, initialMessages }: { sessionId: string; initialMessages: UIMessage[] }) {
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

  useEffect(() => {
    textareaRef.current?.focus();
  }, [sessionId, status]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, status]);

  const submit = () => {
    const text = input.trim();
    if (!text || isBusy) return;
    setInput("");
    void sendMessage({ text });
  };

  return (
    <div className="-mx-4 -my-8 flex h-[calc(100vh-9rem)] flex-col sm:-mx-6 sm:-my-12">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/app">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        </Button>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Sessão de orientação</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
              <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="mt-4 font-display text-2xl text-foreground">Como posso te ajudar?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Descreva em linguagem natural o que você está sentindo. Vamos organizar tudo juntos.
              </p>
            </div>
          )}

          {messages.map((m) => (
            <MessageRow key={m.id} message={m} />
          ))}

          {status === "submitted" && (
            <div className="pl-1">
              <Shimmer>Asclepio está analisando…</Shimmer>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-[var(--shadow-soft)]">
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
              placeholder="Conte o que está sentindo…"
              rows={2}
              className="min-h-[44px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
              disabled={isBusy}
            />
            <Button onClick={submit} disabled={!input.trim() || isBusy} size="icon" className="h-10 w-10 flex-none rounded-xl">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Pressione Enter para enviar · Shift+Enter para nova linha
          </p>
        </div>
      </div>
    </div>
  );
}

function MessageRow({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={isUser ? "flex justify-end" : ""}>
      <div className={isUser ? "max-w-[85%]" : "w-full"}>
        {message.parts.map((part, i) => {
          if (part.type === "text") {
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
              <p key={i} className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
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
              red_flags?: { id: string; label: string; reason: string }[];
            };
            return (
              <TriageResultCard
                key={i}
                recommendation={out.recommendation}
                urgencyLevel={out.urgency_level}
                rationale={out.rationale}
                nextSteps={out.next_steps}
                redFlags={out.red_flags}
              />
            );
          }

          if (part.type === "tool-extract_symptoms") {
            return (
              <details key={i} className="my-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs">
                <summary className="cursor-pointer text-muted-foreground">
                  Dados estruturados extraídos
                </summary>
                <pre className="mt-2 overflow-x-auto text-[11px] text-foreground/80">
                  {JSON.stringify("input" in part ? part.input : null, null, 2)}
                </pre>
              </details>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
