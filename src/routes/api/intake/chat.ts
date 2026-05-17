import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import { INTAKE_SYSTEM_PROMPT } from "@/lib/intake-prompt";
import { detectRedFlags } from "@/lib/red-flags";
import type { Database } from "@/integrations/supabase/types";

const RECOMMENDATIONS = ["autocuidado", "teleconsulta", "ubs", "upa_pronto_socorro", "samu_192"] as const;
const URGENCIES = ["baixa", "media", "alta", "emergencia"] as const;

export const Route = createFileRoute("/api/intake/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const body = (await request.json()) as { sessionId?: string; messages?: UIMessage[] };
        const sessionId = body.sessionId;
        const messages = body.messages;
        if (!sessionId || !Array.isArray(messages)) {
          return new Response("Bad request", { status: 400 });
        }

        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = authHeader.slice(7);

        const SUPABASE_URL = process.env.SUPABASE_URL!;
        const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
        const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
        if (claimsErr || !claims?.claims?.sub) {
          return new Response("Unauthorized", { status: 401 });
        }
        const userId = claims.claims.sub;

        // Verify session belongs to user
        const { data: sess } = await supabase
          .from("intake_sessions")
          .select("id, user_id, status")
          .eq("id", sessionId)
          .single();
        if (!sess || sess.user_id !== userId) {
          return new Response("Forbidden", { status: 403 });
        }

        // Load profile context (best-effort)
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, age, is_pregnant, chronic_conditions")
          .eq("id", userId)
          .maybeSingle();

        // Red flag check on latest user message
        const lastUserText = [...messages]
          .reverse()
          .find((m) => m.role === "user")
          ?.parts.map((p) => (p.type === "text" ? p.text : ""))
          .join(" ") ?? "";
        const triggeredFlags = detectRedFlags(lastUserText);

        const provider = createLovableAiGatewayProvider(process.env.LOVABLE_API_KEY!);
        const model = provider("google/gemini-3-flash-preview");

        const profileLine = profile
          ? `Perfil do usuário: ${profile.full_name ?? "—"}, idade ${profile.age ?? "não informada"}${profile.is_pregnant ? ", gestante" : ""}${profile.chronic_conditions ? `, condições: ${profile.chronic_conditions}` : ""}.`
          : "Perfil do usuário: não preenchido.";

        const flagLine = triggeredFlags.length
          ? `\n\nALERTA — Red flags detectadas pelo motor de regras: ${triggeredFlags.map((f) => f.label).join("; ")}. Encerre a coleta, oriente SAMU 192 e chame triage_decision com recommendation="samu_192" e urgency_level="emergencia".`
          : "";

        const tools = {
          extract_symptoms: tool({
            description:
              "Registre de forma estruturada o que foi coletado até agora sobre o quadro do paciente. Chame quando tiver informação suficiente para decidir o destino.",
            inputSchema: z.object({
              chief_complaint: z.string().describe("Queixa principal em uma frase."),
              onset: z.string().optional().describe("Quando começou."),
              duration: z.string().optional(),
              intensity: z.number().min(0).max(10).optional(),
              location: z.string().optional(),
              associated_symptoms: z.array(z.string()).optional(),
              aggravating_factors: z.array(z.string()).optional(),
              relieving_factors: z.array(z.string()).optional(),
              red_flags: z.array(z.string()).optional(),
            }),
            execute: async (input) => ({ ok: true, ...input }),
          }),
          triage_decision: tool({
            description:
              "Decida o destino de cuidado com base no que foi coletado. Em dúvida, escale para o nível mais conservador.",
            inputSchema: z.object({
              recommendation: z.enum(RECOMMENDATIONS),
              urgency_level: z.enum(URGENCIES),
              rationale: z.string().describe("Justificativa curta em PT-BR."),
              next_steps: z.array(z.string()).describe("Próximos passos práticos para o usuário."),
            }),
            execute: async (input) => {
              // Persist decision on the session
              const finalRec = triggeredFlags.length ? "samu_192" : input.recommendation;
              const finalUrgency = triggeredFlags.length ? "emergencia" : input.urgency_level;
              await supabase
                .from("intake_sessions")
                .update({
                  recommendation: finalRec,
                  urgency_level: finalUrgency,
                  rationale: input.rationale,
                  red_flags_triggered: triggeredFlags.map((f) => f.id),
                  status: finalRec === "samu_192" ? "escalated" : "completed",
                  completed_at: new Date().toISOString(),
                })
                .eq("id", sessionId);
              return { ...input, recommendation: finalRec, urgency_level: finalUrgency, red_flags: triggeredFlags };
            },
          }),
        } as const;

        const result = streamText({
          model,
          system: `${INTAKE_SYSTEM_PROMPT}\n\n${profileLine}${flagLine}`,
          messages: await convertToModelMessages(messages),
          tools,
          stopWhen: stepCountIs(50),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onFinish: async ({ messages: finalMessages }) => {
            // Persist any new messages (those without DB id yet)
            const newOnes = finalMessages.slice(messages.length);
            const userMsgsInBatch = messages.slice(-1).filter((m) => m.role === "user");
            const toPersist = [...userMsgsInBatch, ...newOnes];

            if (toPersist.length) {
              await supabase.from("intake_messages").insert(
                toPersist.map((m) => ({
                  session_id: sessionId,
                  user_id: userId,
                  role: m.role,
                  parts: m.parts as unknown as never,
                })),
              );
            }

            // Persist chief_complaint if missing
            if (!sess.status || sess.status === "active") {
              const userText = userMsgsInBatch[0]?.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join(" ")
                .trim();
              if (userText) {
                await supabase
                  .from("intake_sessions")
                  .update({ chief_complaint: userText.slice(0, 240) })
                  .eq("id", sessionId)
                  .is("chief_complaint", null);
              }
            }
          },
        });
      },
    },
  },
});
