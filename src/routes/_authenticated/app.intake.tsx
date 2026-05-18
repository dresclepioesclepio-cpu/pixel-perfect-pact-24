import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/app/intake")({
  component: Outlet,
  head: () => ({ meta: [{ title: "Nova orientação — Asclepio" }] }),
});
