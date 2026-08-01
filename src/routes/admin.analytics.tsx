import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/admin-shell";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

export const Route = createFileRoute("/admin/analytics")({
  component: Analytics,
});

function Analytics() {
  const { data } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const since30d = new Date(Date.now() - 30 * 86400000).toISOString();
      const { data: views } = await supabase
        .from("page_views")
        .select("path,created_at")
        .gte("created_at", since30d)
        .limit(10000);

      const dayMap = new Map<string, number>();
      const monthMap = new Map<string, number>();
      const pathMap = new Map<string, number>();
      (views ?? []).forEach((v) => {
        const d = v.created_at.slice(0, 10);
        const m = v.created_at.slice(0, 7);
        dayMap.set(d, (dayMap.get(d) ?? 0) + 1);
        monthMap.set(m, (monthMap.get(m) ?? 0) + 1);
        pathMap.set(v.path, (pathMap.get(v.path) ?? 0) + 1);
      });

      const daily = Array.from(dayMap.keys()).sort().map((k) => ({ date: k.slice(5), visitors: dayMap.get(k) ?? 0 }));
      const monthly = Array.from(monthMap.entries()).sort().map(([month, v]) => ({ month, visitors: v }));
      const topPages = Array.from(pathMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([path, v]) => ({ path, views: v }));

      const totalVisitors = views?.length ?? 0;
      const uniquePages = pathMap.size;

      return { daily, monthly, topPages, totalVisitors, uniquePages };
    },
  });

  return (
    <AdminShell title="Analytics">
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Kpi label="Visitors (30d)" value={data?.totalVisitors ?? "…"} />
        <Kpi label="Pages tracked" value={data?.uniquePages ?? "…"} />
        <Kpi label="Avg. views / day" value={data ? Math.round(data.totalVisitors / Math.max(data.daily.length, 1)) : "…"} />
      </div>

      <Card title="Daily traffic (last 30 days)">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.daily ?? []}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Line type="monotone" dataKey="visitors" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>


      <div className="grid gap-4 lg:grid-cols-2 mt-4">
        <Card title="Monthly visitors">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthly ?? []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="visitors" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Most viewed pages">
          <div className="space-y-2">
            {(data?.topPages ?? []).map((p) => (
              <div key={p.path} className="flex items-center justify-between gap-3">
                <span className="text-sm truncate flex-1">{p.path}</span>
                <span className="text-sm font-semibold">{p.views}</span>
              </div>
            ))}
            {data && data.topPages.length === 0 && <p className="text-sm text-muted-foreground">No page view data yet.</p>}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
    </div>
  );
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <h3 className="font-display font-bold mb-4">{title}</h3>
      {children}
    </div>
  );
}
