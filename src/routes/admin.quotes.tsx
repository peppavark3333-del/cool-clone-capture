import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/hooks/use-admin";
import { toast } from "sonner";
import {
  CheckCircle2, XCircle, Clock, Trash2, Mail, FileDown, FileSpreadsheet, Phone, X,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/admin/quotes")({
  component: Quotes,
});

type Quote = {
  id: string; name: string; phone: string; email: string; address: string | null;
  service_type: string | null; property_size: string | null; message: string | null;
  status: "pending" | "accepted" | "rejected" | "completed";
  admin_notes: string | null; created_at: string;
};

function Quotes() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | Quote["status"]>("all");
  const [active, setActive] = useState<Quote | null>(null);

  const { data: quotes = [] } = useQuery({
    queryKey: ["quotes", filter],
    queryFn: async () => {
      let q = supabase.from("quotes").select("*").order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter);
      const { data, error } = await q;
      if (error) throw error;
      return data as Quote[];
    },
  });

  const setStatus = async (id: string, status: Quote["status"]) => {
    const { error } = await supabase.from("quotes").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    await logAudit("quote_status_change", "quote", id, { status });
    toast.success(`Marked ${status}`);
    qc.invalidateQueries({ queryKey: ["quotes"] });
    if (active?.id === id) setActive({ ...active, status });
  };

  const saveNotes = async (id: string, admin_notes: string) => {
    const { error } = await supabase.from("quotes").update({ admin_notes }).eq("id", id);
    if (error) return toast.error(error.message);
    await logAudit("quote_notes_update", "quote", id);
    toast.success("Notes saved");
    qc.invalidateQueries({ queryKey: ["quotes"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this quote? This cannot be undone.")) return;
    const { error } = await supabase.from("quotes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await logAudit("quote_delete", "quote", id);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["quotes"] });
    setActive(null);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Rybus — Quote Requests", 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [["Date", "Name", "Phone", "Email", "Service", "Status"]],
      body: quotes.map((q) => [
        new Date(q.created_at).toLocaleDateString(),
        q.name, q.phone, q.email, q.service_type ?? "—", q.status,
      ]),
    });
    doc.save(`rybus-quotes-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(quotes.map((q) => ({
      Date: new Date(q.created_at).toLocaleString(),
      Name: q.name, Phone: q.phone, Email: q.email,
      Address: q.address ?? "", Service: q.service_type ?? "",
      Size: q.property_size ?? "", Message: q.message ?? "",
      Status: q.status, Notes: q.admin_notes ?? "",
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Quotes");
    XLSX.writeFile(wb, `rybus-quotes-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const filters: { v: typeof filter; l: string }[] = [
    { v: "all", l: "All" }, { v: "pending", l: "Pending" },
    { v: "accepted", l: "Accepted" }, { v: "completed", l: "Completed" }, { v: "rejected", l: "Rejected" },
  ];

  return (
    <AdminShell title="Quote management">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button key={f.v} onClick={() => setFilter(f.v)} className={`rounded-full px-3 py-1.5 text-sm font-medium ${filter === f.v ? "bg-primary text-primary-foreground" : "bg-background border border-border"}`}>
              {f.l}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={exportPDF} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"><FileDown className="h-4 w-4" /> PDF</button>
          <button onClick={exportExcel} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"><FileSpreadsheet className="h-4 w-4" /> Excel</button>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-background overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold hidden md:table-cell">Service</th>
              <th className="px-4 py-3 font-semibold hidden lg:table-cell">Received</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {quotes.map((q) => (
              <tr key={q.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setActive(q)}>
                <td className="px-4 py-3">
                  <div className="font-medium">{q.name}</div>
                  <div className="text-xs text-muted-foreground">{q.email} · {q.phone}</div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">{q.service_type ?? "—"}</td>
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{new Date(q.created_at).toLocaleString()}</td>
                <td className="px-4 py-3"><StatusBadge status={q.status} /></td>
                <td className="px-4 py-3 text-right text-xs text-primary">View →</td>
              </tr>
            ))}
            {quotes.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No quotes in this filter.</td></tr>}
          </tbody>
        </table>
      </div>

      {active && <QuoteDrawer quote={active} onClose={() => setActive(null)} onStatus={setStatus} onSaveNotes={saveNotes} onDelete={remove} />}
    </AdminShell>
  );
}

function StatusBadge({ status }: { status: Quote["status"] }) {
  const map = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[status]}`}>{status}</span>;
}

function QuoteDrawer({ quote, onClose, onStatus, onSaveNotes, onDelete }: {
  quote: Quote; onClose: () => void;
  onStatus: (id: string, s: Quote["status"]) => void;
  onSaveNotes: (id: string, n: string) => void;
  onDelete: (id: string) => void;
}) {
  const [notes, setNotes] = useState(quote.admin_notes ?? "");
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-lg bg-background h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Quote #{quote.id.slice(0, 8)}</div>
            <h2 className="font-display text-xl font-bold">{quote.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6 space-y-5">
          <StatusBadge status={quote.status} />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Phone" value={quote.phone} href={`tel:${quote.phone}`} />
            <Info label="Email" value={quote.email} href={`mailto:${quote.email}`} />
            <Info label="Address" value={quote.address ?? "—"} />
            <Info label="Service" value={quote.service_type ?? "—"} />
            <Info label="Property size" value={quote.property_size ?? "—"} />
            <Info label="Received" value={new Date(quote.created_at).toLocaleString()} />
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Message</div>
            <p className="mt-1 text-sm whitespace-pre-wrap rounded-lg border border-border bg-card p-3">{quote.message || "—"}</p>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Internal notes</div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-border bg-card p-3 text-sm outline-none focus:border-primary" />
            <button onClick={() => onSaveNotes(quote.id, notes)} className="mt-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">Save notes</button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a href={`mailto:${quote.email}?subject=${encodeURIComponent("Your Rybus quote request")}`} className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium"><Mail className="h-4 w-4" /> Email customer</a>
            <a href={`tel:${quote.phone}`} className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium"><Phone className="h-4 w-4" /> Call</a>
          </div>

          <div className="border-t border-border pt-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Update status</div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => onStatus(quote.id, "accepted")} className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 text-white px-3 py-2 text-sm font-medium"><CheckCircle2 className="h-4 w-4" /> Accept</button>
              <button onClick={() => onStatus(quote.id, "rejected")} className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 text-white px-3 py-2 text-sm font-medium"><XCircle className="h-4 w-4" /> Reject</button>
              <button onClick={() => onStatus(quote.id, "completed")} className="inline-flex items-center justify-center gap-2 rounded-md bg-green-600 text-white px-3 py-2 text-sm font-medium"><CheckCircle2 className="h-4 w-4" /> Complete</button>
              <button onClick={() => onStatus(quote.id, "pending")} className="inline-flex items-center justify-center gap-2 rounded-md bg-yellow-500 text-white px-3 py-2 text-sm font-medium"><Clock className="h-4 w-4" /> Re-open</button>
            </div>
            <button onClick={() => onDelete(quote.id)} className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 text-destructive px-3 py-2 text-sm font-medium"><Trash2 className="h-4 w-4" /> Delete quote</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      {href ? <a href={href} className="text-sm text-primary hover:underline break-words">{value}</a> : <div className="text-sm break-words">{value}</div>}
    </div>
  );
}
