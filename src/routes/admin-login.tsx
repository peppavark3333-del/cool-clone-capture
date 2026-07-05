import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import logo from "@/assets/rybus-logo.jpeg";

export const Route = createFileRoute("/admin-login")({
  head: () => ({ meta: [{ title: "Admin · Rybus" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back");
      navigate({ to: "/admin" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-hero-gradient p-6">
      <div className="w-full max-w-md rounded-3xl bg-background p-8 shadow-glow">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Rybus" className="h-12 w-12 rounded-xl object-contain bg-white" />
          <div>
            <div className="font-display text-xl font-bold">Rybus Admin</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Restricted area</div>
          </div>
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold">Sign in</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Email</span>
            <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-border bg-card px-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent py-2.5 outline-none" placeholder="you@rybus.com" />
            </div>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Password</span>
            <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-border bg-card px-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent py-2.5 outline-none" placeholder="Min 8 characters" />
            </div>
          </label>
          <button disabled={busy} type="submit" className="w-full rounded-full bg-hero-gradient px-6 py-3 font-semibold text-white shadow-glow disabled:opacity-50">
            {busy ? "Please wait…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
