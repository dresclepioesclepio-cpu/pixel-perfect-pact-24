import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { UIMessage } from "ai";

export const createIntakeSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("intake_sessions")
      .insert({ user_id: userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: data.id };
  });

export const listIntakeSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("intake_sessions")
      .select("id, status, chief_complaint, recommendation, urgency_level, created_at, completed_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return { sessions: data ?? [] };
  });

export const getIntakeSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { sessionId: string }) =>
    z.object({ sessionId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const [{ data: session, error: sErr }, { data: messages, error: mErr }] = await Promise.all([
      supabase.from("intake_sessions").select("*").eq("id", data.sessionId).single(),
      supabase
        .from("intake_messages")
        .select("id, role, parts, created_at")
        .eq("session_id", data.sessionId)
        .order("created_at", { ascending: true }),
    ]);
    if (sErr) throw new Error(sErr.message);
    if (mErr) throw new Error(mErr.message);

    const uiMessages: UIMessage[] = (messages ?? []).map((m) => ({
      id: m.id,
      role: m.role as UIMessage["role"],
      parts: (m.parts as UIMessage["parts"]) ?? [],
    }));
    return { session, messages: uiMessages };
  });
