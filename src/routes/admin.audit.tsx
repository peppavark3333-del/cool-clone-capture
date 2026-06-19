import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/admin-shell";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/admin/audit")({
  component: Audit,
});

function Audit() {
  const { data: logs = [] } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const { data } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200);
      return data ?? [];
    },
  });

  return (
    <AdminShell title="Audit logs">
      <p className="text-sm text-muted-foreground mb-4">Latest 200 admin actions, newest first.</p>
      <div className="rounded-2xl border border-border bg-background divide-y divide-border">
        {logs.map((l) => (
          <div key={l.id} className="p-3 text-sm flex items-center gap-3">
            <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{l.action}</span>
              {l.entity && <span className="ml-2 text-muted-foreground">on {l.entity}</span>}
              {l.entity_id && <span className="ml-1 text-xs text-muted-foreground font-mono">#{String(l.entity_id).slice(0, 8)}</span>}
            </div>
            <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</span>
          </div>
        ))}
        {logs.length === 0 && <div className="p-10 text-center text-muted-foreground text-sm">No actions logged yet.</div>}
      </div>
    </AdminShell>
  );
}
