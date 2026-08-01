import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/admin-shell";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, Eye, Activity, TrendingUp,
} from "lucide-react";


export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Stat({ icon: Icon, label, value, hint, color = "primary" }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; hint?: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 font-display text-3xl font-bold">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-xl bg-${color}/10 text-${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const since24h = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const since5m = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const [visitorsTotal, visitors24h, activeNow] = await Promise.all([
        supabase.from("page_views").select("session_id", { count: "exact", head: true }),
        supabase.from("page_views").select("id", { count: "exact", head: true }).gte("created_at", since24h),
        supabase.from("page_views").select("session_id", { count: "exact", head: true }).gte("created_at", since5m),
      ]);

      return {
        visitorsTotal: visitorsTotal.count ?? 0,
        visitors24h: visitors24h.count ?? 0,
        activeNow: activeNow.count ?? 0,
      };
    },
    refetchInterval: 15000,
  });

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Eye} label="Total visitors" value={data?.visitorsTotal ?? "…"} hint="All-time page views" />
        <Stat icon={Activity} label="Active now" value={data?.activeNow ?? "…"} hint="Last 5 minutes" />
        <Stat icon={TrendingUp} label="Visitors (24h)" value={data?.visitors24h ?? "…"} />
        <Stat icon={Users} label="Active sessions today" value={data?.visitors24h ?? "…"} hint="Unique pageviews" />
      </div>
    </AdminShell>
  );
}

