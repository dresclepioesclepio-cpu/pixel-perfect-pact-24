import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { Activity, LogOut, LayoutDashboard, History, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { EmergencyBanner } from "@/components/EmergencyBanner";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;

    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      <EmergencyBanner />
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/app" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
              <Activity className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="font-display text-xl">Asclepio</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/app" icon={LayoutDashboard} label="Início" />
            <NavLink to="/app/history" icon={History} label="Histórico" />
            <NavLink to="/app/profile" icon={User} label="Perfil" />
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
        <div className="grid grid-cols-3">
          <BottomLink to="/app" icon={LayoutDashboard} label="Início" />
          <BottomLink to="/app/history" icon={History} label="Histórico" />
          <BottomLink to="/app/profile" icon={User} label="Perfil" />
        </div>
      </nav>
      <div className="h-16 md:hidden" />
    </div>
  );
}

function NavLink({ to, icon: Icon, label }: { to: string; icon: typeof Activity; label: string }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/app" }}
      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      activeProps={{ className: "bg-secondary text-foreground" }}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function BottomLink({ to, icon: Icon, label }: { to: string; icon: typeof Activity; label: string }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/app" }}
      className="flex flex-col items-center gap-1 py-2.5 text-xs text-muted-foreground"
      activeProps={{ className: "text-primary" }}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}
