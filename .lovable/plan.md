## Sprint 3 — Intake conversacional com IA

Objetivo: substituir o placeholder de `/app/intake` por um fluxo conversacional que coleta o relato do usuário, extrai dados estruturados via IA, aplica o Red Flag Engine e gera uma recomendação de destino (autocuidado, teleconsulta, UBS, urgência, SAMU).

### Arquitetura

**Backend (TanStack server route + Lovable AI Gateway)**
- `src/routes/api/intake/chat.ts` — `streamText` com `google/gemini-3-flash-preview`, system prompt clínico-conservador em PT-BR, ferramentas:
  - `extract_symptoms` (tool com schema Zod: chief_complaint, duration, intensity 0-10, associated_symptoms[], onset, location, red_flags[])
  - `triage_decision` (autocuidado | teleconsulta | ubs | upa_pronto_socorro | samu_192 + justificativa + nivel_urgencia)
- Protegida com `requireSupabaseAuth`; recebe `sessionId` + `messages`.
- Red Flag Engine (regras determinísticas em `src/lib/red-flags.ts`) roda **antes** da resposta da IA: dor torácica + sudorese, déficit neurológico súbito, dispneia grave, sangramento ativo, gestante com sangramento, criança <3m com febre, etc. → força `samu_192` e interrompe o fluxo com banner vermelho.

**Banco de dados (nova migração)**
- `intake_sessions` — id, user_id, status (active|completed|escalated), chief_complaint, extracted_data jsonb, recommendation, urgency_level, red_flags_triggered[], created_at, completed_at
- `intake_messages` — id, session_id, role (user|assistant|system|tool), content, parts jsonb, created_at
- RLS: usuário só vê suas próprias sessões/mensagens.

**Frontend (`src/routes/_authenticated/app.intake.tsx`)**
- AI Elements: instalar via `bunx ai-elements@latest add conversation message prompt-input shimmer tool`
- `useChat` com `DefaultChatTransport({ api: '/api/intake/chat' })`, ID = sessionId da URL
- Rota dinâmica: `/app/intake/$sessionId` (cada intake = uma URL própria, persistido no banco) + `/app/intake` cria nova e redireciona
- Renderização de `message.parts`: texto + tool calls (extract_symptoms colapsado, triage_decision como card destacado)
- Loader "Asclepio está analisando…" com Shimmer durante `submitted`
- Banner vermelho fixo quando red flag dispara, com botão SAMU 192

**Dashboard atualizado**
- `/app/index` lista últimas 3 sessões e mostra CTA "Nova conversa" (cria sessão e navega para `/app/intake/$sessionId`)
- `/app/history` lista todas as sessões com chip de urgência e recomendação

### Arquivos a criar/editar

Criar:
- `supabase/migrations/...` — tabelas `intake_sessions` + `intake_messages` com RLS
- `src/lib/red-flags.ts` — regras determinísticas
- `src/lib/intake-prompt.ts` — system prompt + descrições das tools
- `src/lib/ai-gateway.ts` — provider helper (`createLovableAiGatewayProvider`)
- `src/lib/intake.functions.ts` — serverFns: `createIntakeSession`, `listIntakeSessions`, `getIntakeSession`
- `src/routes/api/intake/chat.ts` — endpoint de streaming
- `src/routes/_authenticated/app.intake.$sessionId.tsx` — UI conversacional
- `src/components/ai-elements/*` (via CLI)
- `src/components/TriageResultCard.tsx`

Editar:
- `src/routes/_authenticated/app.intake.tsx` → cria sessão e redireciona
- `src/routes/_authenticated/app.index.tsx` → CTA + últimas sessões
- `src/routes/_authenticated/app.history.tsx` → lista real

### Limites éticos no system prompt

- Nunca diagnostica, nunca prescreve, nunca interpreta exames
- Sempre encerra com: destino sugerido + "isso não substitui avaliação médica"
- Em dúvida → escalar para nível mais conservador
- Coleta máx 5-7 turnos antes de propor destino
- Toda recomendação fica logada em `intake_sessions.extracted_data` para auditoria

### O que **não** entra neste sprint

- Integração real com SAMU/UBS (apenas links/telefones)
- Voz/áudio
- Compartilhamento com profissional
- Export PDF do relato