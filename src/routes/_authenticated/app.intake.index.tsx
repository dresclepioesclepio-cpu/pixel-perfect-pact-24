import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CircleAlert as AlertCircle, Loader as Loader2 } from "lucide-react";
import { createIntakeSession } from "@/lib/intake.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/app/intake/")({
  component: NewIntake,
  head: () => ({ meta: [{ title: "Nova orientação — Asclepio" }] }),
});

function NewIntake() {
  const navigate = useNavigate();
  const create = useServerFn(createIntakeSession);
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      try {
        const res = await create({ data: undefined as never });
        await navigate({
          to: "/app/intake/$sessionId",
          params: { sessionId: res.id },
          replace: true,
        });
      } catch (e) {
        console.error("[intake] createIntakeSession failed", e);
        setError(e instanceof Error ? e.message : "Falha ao criar sessão");
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div>
          <p className="font-display text-xl text-foreground">Não foi possível iniciar</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              started.current = false;
              setError(null);
            }}
          >
            Tentar novamente
          </Button>
          <Button variant="outline" onClick={() => navigate({ to: "/app" })}>
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-24 text-center text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p>Preparando sua sessão…</p>
    </div>
  );
}