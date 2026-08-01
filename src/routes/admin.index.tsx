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

      const [visitorsTotal, visitors24h, activeNow, quotesTotal, quotesPending, quotesAccepted, quotesCompleted, recent] = await Promise.all([
        supabase.from("page_views").select("session_id", { count: "exact", head: true }),
        supabase.from("page_views").select("id", { count: "exact", head: true }).gte("created_at", since24h),
        supabase.from("page_views").select("session_id", { count: "exact", head: true }).gte("created_at", since5m),
        supabase.from("quotes").select("id", { count: "exact", head: true }),
        supabase.from("quotes").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("quotes").select("id", { count: "exact", head: true }).eq("status", "accepted"),
        supabase.from("quotes").select("id", { count: "exact", head: true }).eq("status", "completed"),
        supabase.from("quotes").select("id,name,service_type,status,created_at").order("created_at", { ascending: false }).limit(8),
      ]);

      return {
        visitorsTotal: visitorsTotal.count ?? 0,
        visitors24h: visitors24h.count ?? 0,
        activeNow: activeNow.count ?? 0,
        quotesTotal: quotesTotal.count ?? 0,
        quotesPending: quotesPending.count ?? 0,
        quotesAccepted: quotesAccepted.count ?? 0,
        quotesCompleted: quotesCompleted.count ?? 0,
        recent: recent.data ?? [],
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

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={FileText} label="Total quotes" value={data?.quotesTotal ?? "…"} />
        <Stat icon={Clock} label="Pending" value={data?.quotesPending ?? "…"} hint="Awaiting review" />
        <Stat icon={CheckCircle2} label="Accepted" value={data?.quotesAccepted ?? "…"} />
        <Stat icon={DollarSign} label="Completed" value={data?.quotesCompleted ?? "…"} hint="Revenue events" />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-background">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-display font-bold">Recent activity</h2>
          <Link to="/admin/quotes" className="text-sm text-primary hover:underline">View all quotes</Link>
        </div>
        <div className="divide-y divide-border">
          {(data?.recent ?? []).map((q) => (
            <div key={q.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{q.name}</div>
                <div className="text-xs text-muted-foreground">{q.service_type ?? "—"} · {new Date(q.created_at).toLocaleString()}</div>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                q.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                q.status === "accepted" ? "bg-blue-100 text-blue-800" :
                q.status === "completed" ? "bg-green-100 text-green-800" :
                "bg-red-100 text-red-800"
              }`}>{q.status}</span>
            </div>
          ))}
          {data && data.recent.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">No quote requests yet.</div>}
        </div>
      </div>
    </AdminShell>
  );
}
