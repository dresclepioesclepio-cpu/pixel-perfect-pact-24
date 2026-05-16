import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/app/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Perfil clínico — Asclepio User" }] }),
});

const profileSchema = z.object({
  full_name: z.string().trim().max(120).optional().or(z.literal("")),
  age: z.number().int().min(0).max(130).nullable(),
  emergency_contact_name: z.string().trim().max(120).optional().or(z.literal("")),
  emergency_contact_phone: z.string().trim().max(40).optional().or(z.literal("")),
  chronic_conditions: z.string().trim().max(2000).optional().or(z.literal("")),
  is_pregnant: z.boolean(),
});

type ProfileForm = {
  full_name: string;
  age: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  chronic_conditions: string;
  is_pregnant: boolean;
};

const empty: ProfileForm = {
  full_name: "",
  age: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  chronic_conditions: "",
  is_pregnant: false,
};

function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState<ProfileForm>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error) {
        toast.error("Não foi possível carregar seu perfil.");
      } else if (data) {
        setForm({
          full_name: data.full_name ?? "",
          age: data.age?.toString() ?? "",
          emergency_contact_name: data.emergency_contact_name ?? "",
          emergency_contact_phone: data.emergency_contact_phone ?? "",
          chronic_conditions: data.chronic_conditions ?? "",
          is_pregnant: data.is_pregnant ?? false,
        });
      }
      setLoading(false);
    })();
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = profileSchema.safeParse({
      full_name: form.full_name,
      age: form.age === "" ? null : Number(form.age),
      emergency_contact_name: form.emergency_contact_name,
      emergency_contact_phone: form.emergency_contact_phone,
      chronic_conditions: form.chronic_conditions,
      is_pregnant: form.is_pregnant,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.full_name || null,
        age: parsed.data.age,
        emergency_contact_name: parsed.data.emergency_contact_name || null,
        emergency_contact_phone: parsed.data.emergency_contact_phone || null,
        chronic_conditions: parsed.data.chronic_conditions || null,
        is_pregnant: parsed.data.is_pregnant,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar. Tente novamente.");
      return;
    }
    toast.success("Perfil atualizado.");
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const update = <K extends keyof ProfileForm>(k: K, v: ProfileForm[K]) => setForm((s) => ({ ...s, [k]: v }));

  return (
    <div className="mx-auto max-w-2xl">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Perfil clínico</p>
        <h1 className="mt-2 font-display text-4xl">Seus dados</h1>
        <p className="mt-2 text-muted-foreground">
          Essas informações ajudam a personalizar a orientação. Você pode atualizar a qualquer momento.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <Section title="Identificação">
          <Field label="Nome completo">
            <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
          </Field>
          <Field label="Idade">
            <Input type="number" min={0} max={130} value={form.age} onChange={(e) => update("age", e.target.value)} />
          </Field>
        </Section>

        <Section title="Contato de emergência">
          <Field label="Nome">
            <Input value={form.emergency_contact_name} onChange={(e) => update("emergency_contact_name", e.target.value)} />
          </Field>
          <Field label="Telefone">
            <Input type="tel" value={form.emergency_contact_phone} onChange={(e) => update("emergency_contact_phone", e.target.value)} />
          </Field>
        </Section>

        <Section title="Contexto clínico">
          <Field label="Condições crônicas" full>
            <Textarea
              rows={3}
              placeholder="Ex.: hipertensão, diabetes, asma..."
              value={form.chronic_conditions}
              onChange={(e) => update("chronic_conditions", e.target.value)}
            />
          </Field>
          <div className="col-span-full flex items-center justify-between rounded-xl bg-secondary/50 p-4">
            <div>
              <Label className="text-sm font-medium">Estou grávida</Label>
              <p className="text-xs text-muted-foreground">Ativa regras específicas de cuidado.</p>
            </div>
            <Switch checked={form.is_pregnant} onCheckedChange={(v) => update("is_pregnant", v)} />
          </div>
        </Section>

        <Button type="submit" disabled={saving} className="w-full bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-95 sm:w-auto">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar alterações
        </Button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={`space-y-1.5 ${full ? "col-span-full" : ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
