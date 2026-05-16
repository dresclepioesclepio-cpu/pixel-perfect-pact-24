import { Activity } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[image:var(--gradient-primary)] text-primary-foreground">
                <Activity className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
              <span className="font-display text-lg">Asclepio User</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Orientação inicial de sintomas. Não realiza diagnóstico, não prescreve e não
              substitui avaliação de um profissional de saúde.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <p className="font-medium text-foreground">Produto</p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li><a href="#como-funciona" className="hover:text-foreground">Como funciona</a></li>
                <li><a href="#seguranca" className="hover:text-foreground">Segurança</a></li>
                <li><a href="#limites" className="hover:text-foreground">Limites</a></li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground">Confiança</p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li>Privacidade</li>
                <li>LGPD</li>
                <li>Auditoria</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground">Emergência</p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li>SAMU 192</li>
                <li>Bombeiros 193</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Asclepio User · Em risco imediato, procure atendimento de emergência.
        </div>
      </div>
    </footer>
  );
}
