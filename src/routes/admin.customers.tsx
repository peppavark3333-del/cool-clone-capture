import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/hooks/use-admin";
import { toast } from "sonner";
import { Plus, Trash2, Mail, Phone, Calendar } from "lucide-react";

export const Route = createFileRoute("/admin/customers")({
  component: Customers,
});

type Customer = {
  id: string; name: string; email: string | null; phone: string | null;
  address: string | null; notes: string | null; follow_up_date: string | null; created_at: string;
};

function Customers() {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", notes: "", follow_up_date: "" });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Customer[];
    },
  });

  const { data: quoteHistory } = useQuery({
    queryKey: ["customer-history"],
    queryFn: async () => {
      const { data } = await supabase.from("quotes").select("email,service_type,status,created_at");
      const map = new Map<string, { count: number; last: string }>();
      (data ?? []).forEach((q) => {
        if (!q.email) return;
        const prev = map.get(q.email.toLowerCase());
        if (!prev || prev.last < q.created_at) map.set(q.email.toLowerCase(), { count: (prev?.count ?? 0) + 1, last: q.created_at });
      });
      return map;
    },
  });

  const create = async () => {
    if (!form.name) return toast.error("Name is required");
    const { error } = await supabase.from("customers").insert({
      name: form.name, email: form.email || null, phone: form.phone || null,
      address: form.address || null, notes: form.notes || null,
      follow_up_date: form.follow_up_date || null,
    });
    if (error) return toast.error(error.message);
    await logAudit("customer_create", "customer", undefined, { name: form.name });
    toast.success("Customer added");
    setForm({ name: "", email: "", phone: "", address: "", notes: "", follow_up_date: "" });
    setAdding(false);
    qc.invalidateQueries({ queryKey: ["customers"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete customer?")) return;
    await supabase.from("customers").delete().eq("id", id);
    await logAudit("customer_delete", "customer", id);
    qc.invalidateQueries({ queryKey: ["customers"] });
  };

  return (
    <AdminShell title="Customers">
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-muted-foreground">{customers.length} customer{customers.length === 1 ? "" : "s"} in database</p>
        <button onClick={() => setAdding(!adding)} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" /> {adding ? "Cancel" : "Add customer"}</button>
      </div>

      {adding && (
        <div className="mb-5 rounded-2xl border border-border bg-background p-5 grid gap-3 sm:grid-cols-2">
          <input placeholder="Full name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-md border border-border bg-card px-3 py-2 text-sm" />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-md border border-border bg-card px-3 py-2 text-sm" />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-md border border-border bg-card px-3 py-2 text-sm" />
          <input type="date" value={form.follow_up_date} onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })} className="rounded-md border border-border bg-card px-3 py-2 text-sm" />
          <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="sm:col-span-2 rounded-md border border-border bg-card px-3 py-2 text-sm" />
          <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="sm:col-span-2 rounded-md border border-border bg-card px-3 py-2 text-sm" rows={2} />
          <button onClick={create} className="sm:col-span-2 rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium">Save customer</button>
        </div>
      )}

      <div className="grid gap-3">
        {customers.map((c) => {
          const hist = c.email ? quoteHistory?.get(c.email.toLowerCase()) : undefined;
          return (
            <div key={c.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display font-bold">{c.name}</h3>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {c.email && <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 hover:text-primary"><Mail className="h-3 w-3" />{c.email}</a>}
                    {c.phone && <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 hover:text-primary"><Phone className="h-3 w-3" />{c.phone}</a>}
                    {c.follow_up_date && <span className="inline-flex items-center gap-1 text-orange-600"><Calendar className="h-3 w-3" />Follow up: {c.follow_up_date}</span>}
                  </div>
                  {c.address && <div className="mt-1 text-xs text-muted-foreground">{c.address}</div>}
                  {c.notes && <p className="mt-2 text-sm">{c.notes}</p>}
                  {hist && <div className="mt-2 text-xs text-primary">{hist.count} quote request{hist.count === 1 ? "" : "s"} · last {new Date(hist.last).toLocaleDateString()}</div>}
                </div>
                <button onClick={() => remove(c.id)} className="text-destructive p-2 hover:bg-destructive/10 rounded-lg"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          );
        })}
        {customers.length === 0 && <div className="rounded-2xl border border-dashed border-border bg-background p-12 text-center text-muted-foreground">No customers yet.</div>}
      </div>
    </AdminShell>
  );
}
