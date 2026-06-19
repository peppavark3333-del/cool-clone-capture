import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, Activity } from "lucide-react";

export const Route = createFileRoute("/admin/status")({
  component: Status,
});

function Status() {
  const [pageLoad, setPageLoad] = useState<number | null>(null);

  useEffect(() => {
    if (typeof performance !== "undefined" && performance.timing) {
      const t = performance.timing;
      const load = t.loadEventEnd - t.navigationStart;
      if (load > 0) setPageLoad(load);
    }
  }, []);

  const { data } = useQuery({
    queryKey: ["status-check"],
    queryFn: async () => {
      const t0 = Date.now();
      const { error: dbErr } = await supabase.from("site_content").select("key").limit(1);
      const dbLatency = Date.now() - t0;
      const t1 = Date.now();
      const { error: apiErr } = await supabase.from("quotes").select("id", { count: "exact", head: true });
      const apiLatency = Date.now() - t1;
      return {
        databaseOk: !dbErr, dbLatency,
        apiOk: !apiErr, apiLatency,
        websiteOk: true,
        uptimeStart: localStorage.getItem("rybus_uptime_start") ?? new Date().toISOString(),
      };
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!localStorage.getItem("rybus_uptime_start")) {
      localStorage.setItem("rybus_uptime_start", new Date().toISOString());
    }
  }, []);

  const uptimeDays = data ? ((Date.now() - new Date(data.uptimeStart).getTime()) / 86400000).toFixed(1) : "…";

  return (
    <AdminShell title="System status">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Status1 label="Website" ok={data?.websiteOk ?? false} note="Frontend reachable" />
        <Status1 label="API" ok={data?.apiOk ?? false} note={data ? `${data.apiLatency}ms` : "checking…"} />
        <Status1 label="Database" ok={data?.databaseOk ?? false} note={data ? `${data.dbLatency}ms` : "checking…"} />
        <Card label="Page load speed" value={pageLoad ? `${pageLoad}ms` : "—"} />
        <Card label="Session uptime" value={`${uptimeDays} days`} />
        <Card label="Last backup" value="Continuous (Cloud)" />
      </div>
      <p className="mt-6 text-xs text-muted-foreground">Live health check refreshes every 30s. Database is continuously backed up by Lovable Cloud.</p>
    </AdminShell>
  );
}

function Status1({ label, ok, note }: { label: string; ok: boolean; note: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="flex items-center gap-3">
        {ok ? <CheckCircle2 className="h-8 w-8 text-green-600" /> : <XCircle className="h-8 w-8 text-destructive" />}
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="font-display text-lg font-bold">{ok ? "Online" : "Offline"}</div>
          <div className="text-xs text-muted-foreground">{note}</div>
        </div>
      </div>
    </div>
  );
}
function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="flex items-center gap-3">
        <Activity className="h-8 w-8 text-primary" />
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="font-display text-lg font-bold">{value}</div>
        </div>
      </div>
    </div>
  );
}
