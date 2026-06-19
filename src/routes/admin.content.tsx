import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/hooks/use-admin";
import { toast } from "sonner";
import { Save, Plus, Trash2, Star } from "lucide-react";

export const Route = createFileRoute("/admin/content")({
  component: Content,
});

type Testimonial = { id: string; name: string; role: string | null; content: string; rating: number | null; published: boolean };

function Content() {
  const qc = useQueryClient();

  const { data: content } = useQuery({
    queryKey: ["site-content"],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("*");
      const m: Record<string, Record<string, unknown>> = {};
      (data ?? []).forEach((r) => { m[r.key] = (r.value as Record<string, unknown>) ?? {}; });
      return m;
    },
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data } = await supabase.from("testimonials").select("*").order("sort_order");
      return (data ?? []) as Testimonial[];
    },
  });

  const save = async (key: string, value: Record<string, unknown>) => {
    const { error } = await supabase.from("site_content").upsert({ key, value });
    if (error) return toast.error(error.message);
    await logAudit("content_update", "site_content", key);
    toast.success(`${key} saved`);
    qc.invalidateQueries({ queryKey: ["site-content"] });
  };

  return (
    <AdminShell title="Content management">
      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Homepage" sub="Hero headline and CTA shown at the top of the site.">
          <ContentEditor section="homepage" content={content?.homepage} onSave={save} fields={[
            { key: "hero_title", label: "Hero title", type: "text" },
            { key: "hero_subtitle", label: "Hero subtitle", type: "textarea" },
            { key: "cta", label: "Button text", type: "text" },
          ]} />
        </Section>

        <Section title="Contact details" sub="Public contact info shown on the website.">
          <ContentEditor section="contact" content={content?.contact} onSave={save} fields={[
            { key: "phone", label: "Phone", type: "text" },
            { key: "email", label: "Email", type: "text" },
            { key: "address", label: "Address", type: "textarea" },
          ]} />
        </Section>

        <Section title="Services note" sub="Optional intro shown above the services section.">
          <ContentEditor section="services" content={content?.services} onSave={save} fields={[
            { key: "intro", label: "Intro paragraph", type: "textarea" },
          ]} />
        </Section>

        <Section title="Pricing note" sub="Shown when customers ask about pricing.">
          <ContentEditor section="pricing" content={content?.pricing} onSave={save} fields={[
            { key: "note", label: "Pricing note", type: "textarea" },
          ]} />
        </Section>
      </div>

      <h2 className="font-display text-2xl font-bold mt-10 mb-4">Testimonials</h2>
      <TestimonialsEditor list={testimonials} onChange={() => qc.invalidateQueries({ queryKey: ["testimonials"] })} />
    </AdminShell>
  );
}

function Section({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <h3 className="font-display font-bold">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1 mb-4">{sub}</p>
      {children}
    </div>
  );
}

function ContentEditor({ section, content, onSave, fields }: {
  section: string;
  content: Record<string, unknown> | undefined;
  onSave: (key: string, value: Record<string, unknown>) => void;
  fields: { key: string; label: string; type: "text" | "textarea" }[];
}) {
  const [v, setV] = useState<Record<string, string>>({});
  useEffect(() => {
    if (content) {
      const seed: Record<string, string> = {};
      fields.forEach((f) => { seed[f.key] = String(content[f.key] ?? ""); });
      setV(seed);
    }
  }, [content]);

  return (
    <div className="space-y-3">
      {fields.map((f) => (
        <label key={f.key} className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">{f.label}</span>
          {f.type === "textarea" ? (
            <textarea value={v[f.key] ?? ""} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} rows={3} className="mt-1 w-full rounded-md border border-border bg-card p-2 text-sm" />
          ) : (
            <input value={v[f.key] ?? ""} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} className="mt-1 w-full rounded-md border border-border bg-card p-2 text-sm" />
          )}
        </label>
      ))}
      <button onClick={() => onSave(section, v)} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"><Save className="h-4 w-4" /> Save</button>
    </div>
  );
}

function TestimonialsEditor({ list, onChange }: { list: Testimonial[]; onChange: () => void }) {
  const [form, setForm] = useState({ name: "", role: "", content: "", rating: 5 });

  const add = async () => {
    if (!form.name || !form.content) return toast.error("Name and content required");
    const { error } = await supabase.from("testimonials").insert({ ...form, sort_order: list.length });
    if (error) return toast.error(error.message);
    await logAudit("testimonial_create");
    setForm({ name: "", role: "", content: "", rating: 5 });
    onChange();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    await logAudit("testimonial_delete", "testimonial", id);
    onChange();
  };
  const togglePub = async (t: Testimonial) => {
    await supabase.from("testimonials").update({ published: !t.published }).eq("id", t.id);
    onChange();
  };

  return (
    <div className="space-y-3">
      {list.map((t) => (
        <div key={t.id} className="rounded-2xl border border-border bg-background p-4 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{t.name}</span>
              {t.role && <span className="text-xs text-muted-foreground">— {t.role}</span>}
              <span className="flex">{Array.from({ length: t.rating ?? 0 }).map((_, i) => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{t.content}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => togglePub(t)} className={`text-xs px-2 py-1 rounded ${t.published ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>{t.published ? "Published" : "Hidden"}</button>
            <button onClick={() => remove(t.id)} className="text-destructive p-1 hover:bg-destructive/10 rounded"><Trash2 className="h-4 w-4" /></button>
          </div>
        </div>
      ))}

      <div className="rounded-2xl border-2 border-dashed border-border bg-background p-4 grid gap-2 sm:grid-cols-2">
        <input placeholder="Customer name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-md border border-border bg-card px-3 py-2 text-sm" />
        <input placeholder="Role / company (optional)" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="rounded-md border border-border bg-card px-3 py-2 text-sm" />
        <textarea placeholder="Testimonial content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="sm:col-span-2 rounded-md border border-border bg-card px-3 py-2 text-sm" rows={2} />
        <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="rounded-md border border-border bg-card px-3 py-2 text-sm">
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
        </select>
        <button onClick={add} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium"><Plus className="h-4 w-4" /> Add testimonial</button>
      </div>
    </div>
  );
}
