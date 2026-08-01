import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, Image, Settings, Bell, BarChart3,
  Shield, Server, LogOut, Menu, X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/rybus-logo.jpeg";

const nav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/customers", label: "Customers", icon: Users },

  { to: "/admin/gallery", label: "Gallery", icon: Image },
  { to: "/admin/content", label: "Content", icon: Settings },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/audit", label: "Audit logs", icon: Shield },
  { to: "/admin/status", label: "System status", icon: Server },
];

export function AdminShell({ children, title }: { children: ReactNode; title: string }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("read", false);
      setUnread(count ?? 0);
    };
    load();
    const ch = supabase
      .channel("notif-count")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin-login" });
  };

  return (
    <div className="min-h-screen bg-secondary flex">
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-background border-r border-border transform ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform`}>
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <img src={logo} alt="Rybus" className="h-9 w-9 rounded-lg object-contain bg-white" />
          <div>
            <div className="font-display font-bold leading-tight">Rybus</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Admin</div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {nav.map((n) => {
            const active = n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}
              >
                <n.icon className="h-4 w-4" />
                <span className="flex-1">{n.label}</span>
                {n.to === "/admin/notifications" && unread > 0 && (
                  <span className="rounded-full bg-accent text-accent-foreground text-[10px] font-bold px-1.5 py-0.5 min-w-[18px] text-center">{unread}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border space-y-1">
          <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" /> Back to site
          </Link>
          <button onClick={signOut} className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {open && <div onClick={() => setOpen(false)} className="lg:hidden fixed inset-0 z-30 bg-black/40" />}

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 bg-background/85 backdrop-blur border-b border-border px-6 py-4 flex items-center gap-3">
          <button onClick={() => setOpen(true)} className="lg:hidden p-2 -ml-2"><Menu className="h-5 w-5" /></button>
          <h1 className="font-display text-xl font-bold">{title}</h1>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

export function AdminGate({ children }: { children: ReactNode }) {
  // Simple client-side gate (RLS enforces real security on the backend)
  const [state, setState] = useState<"loading" | "denied" | "ok">("loading");
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { navigate({ to: "/admin-login" }); return; }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
      if (!data) { setState("denied"); return; }
      setState("ok");
    };
    check();
  }, [navigate]);

  if (state === "loading") return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (state === "denied") return (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <div>
        <h1 className="font-display text-2xl font-bold">Access denied</h1>
        <p className="mt-2 text-muted-foreground">Your account does not have admin privileges.</p>
        <button onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/admin-login" }); }} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Sign out</button>
      </div>
    </div>
  );
  return <>{children}</>;
}
