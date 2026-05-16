import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "./app.intake";

export const Route = createFileRoute("/_authenticated/app/history")({
  component: () => <Placeholder title="Histórico de sessões" desc="Suas orientações anteriores aparecerão aqui." />,
});
