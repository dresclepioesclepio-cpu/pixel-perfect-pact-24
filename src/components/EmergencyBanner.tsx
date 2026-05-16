import { AlertTriangle } from "lucide-react";

export function EmergencyBanner() {
  return (
    <div className="border-b border-destructive/20 bg-destructive/5">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
        <AlertTriangle className="h-4 w-4 flex-none text-destructive" />
        <p className="text-xs leading-relaxed text-foreground/80">
          <span className="font-medium text-destructive">Em risco imediato?</span>{" "}
          Procure atendimento de emergência ou ligue para o{" "}
          <span className="font-medium">SAMU 192</span>. Esta plataforma não substitui emergência.
        </p>
      </div>
    </div>
  );
}
