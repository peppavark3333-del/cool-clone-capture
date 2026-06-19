import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

type State = {
  loading: boolean;
  user: User | null;
  isAdmin: boolean;
};

export function useAdmin(): State {
  const [state, setState] = useState<State>({ loading: true, user: null, isAdmin: false });

  useEffect(() => {
    let active = true;

    const check = async (user: User | null) => {
      if (!user) {
        if (active) setState({ loading: false, user: null, isAdmin: false });
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (active) setState({ loading: false, user, isAdmin: !!data });
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      check(session?.user ?? null);
    });

    supabase.auth.getUser().then(({ data }) => check(data.user));

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export async function logAudit(action: string, entity?: string, entity_id?: string, metadata?: Record<string, unknown>) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("audit_logs").insert({
    user_id: data.user.id,
    action,
    entity: entity ?? null,
    entity_id: entity_id ?? null,
    metadata: metadata ?? null,
  });
}
