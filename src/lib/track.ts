import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "rybus_sid";

function getSessionId() {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export async function trackPageView(path: string) {
  if (typeof window === "undefined") return;
  const session_id = getSessionId();
  try {
    await supabase.from("page_views").insert({
      session_id,
      path,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
    });
  } catch {
    /* ignore */
  }
}
