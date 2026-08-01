import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { supabase } from "@/integrations/supabase/client";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/notifications")({
  component: Notifications,
});

function Notifications() {
  const qc = useQueryClient();
  const { data: list = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });

  useEffect(() => {
    const ch = supabase.channel("notif-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        qc.invalidateQueries({ queryKey: ["notifications"] });
        const n = payload.new as { title: string };
        toast(n.title, { icon: "🔔" });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const markAllRead = async () => {
    await supabase.from("notifications").update({ read: true }).eq("read", false);
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };
  const remove = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  return (
    <AdminShell title="Notifications">
      <div className="flex justify-between mb-4">
        <p className="text-sm text-muted-foreground">{list.filter((n) => !n.read).length} unread</p>
        <button onClick={markAllRead} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium"><CheckCheck className="h-4 w-4" /> Mark all read</button>
      </div>
      <div className="rounded-2xl border border-border bg-background divide-y divide-border">
        {list.map((n) => (
          <div key={n.id} className={`p-4 flex items-start gap-3 ${!n.read ? "bg-primary/5" : ""}`}>
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent shrink-0"><Bell className="h-4 w-4" /></div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{n.title}</div>
              <div className="text-xs text-muted-foreground">{n.body}</div>
              <div className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</div>


            </div>
            <button onClick={() => remove(n.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {list.length === 0 && <div className="p-12 text-center text-muted-foreground text-sm">No notifications.</div>}
      </div>
    </AdminShell>
  );
}
