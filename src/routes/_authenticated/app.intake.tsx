import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/intake")({
  component: () => <Placeholder title="Intake de sintomas" desc="Sprint 3: conversa guiada de relato e extração estruturada." />,
});

export function Placeholder({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-muted-foreground">
        <Construction className="h-6 w-6" />
      </div>
      <h1 className="mt-6 font-display text-3xl">{title}</h1>
      <p className="mt-2 text-muted-foreground">{desc}</p>
    </div>
  );
}
