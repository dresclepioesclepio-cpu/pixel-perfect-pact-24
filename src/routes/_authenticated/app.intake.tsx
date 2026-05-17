import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { createIntakeSession } from "@/lib/intake.functions";

export const Route = createFileRoute("/_authenticated/app/intake")({
  component: NewIntake,
  head: () => ({ meta: [{ title: "Nova orientação — Asclepio" }] }),
});

function NewIntake() {
  const navigate = useNavigate();
  const create = useServerFn(createIntakeSession);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    create({})
      .then(({ id }) => navigate({ to: "/app/intake/$sessionId", params: { sessionId: id }, replace: true }))
      .catch(() => navigate({ to: "/app", replace: true }));
  }, [create, navigate]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-24 text-center text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p>Preparando sua sessão…</p>
    </div>
  );
}
