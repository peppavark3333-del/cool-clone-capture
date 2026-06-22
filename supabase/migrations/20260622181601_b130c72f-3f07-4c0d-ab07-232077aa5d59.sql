
-- 1. Notifications: lock down inserts to internal triggers only
DROP POLICY IF EXISTS "System inserts notifications" ON public.notifications;
REVOKE INSERT ON public.notifications FROM anon, authenticated;

-- 2. active_sessions: drop the table; admin dashboard will derive activity from page_views
DROP TABLE IF EXISTS public.active_sessions CASCADE;

-- 3. page_views: replace always-true insert check with shape validation
DROP POLICY IF EXISTS "Anyone log pageview" ON public.page_views;
CREATE POLICY "Public log pageview" ON public.page_views
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    path IS NOT NULL
    AND length(path) BETWEEN 1 AND 500
    AND session_id IS NOT NULL
    AND length(session_id) BETWEEN 8 AND 128
  );

-- 4. site_content: split public vs internal via is_public column
ALTER TABLE public.site_content
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;
UPDATE public.site_content SET is_public = true
  WHERE key IN ('homepage', 'contact', 'pricing');
DROP POLICY IF EXISTS "Public read content" ON public.site_content;
CREATE POLICY "Public read public content"
  ON public.site_content FOR SELECT TO anon, authenticated
  USING (is_public);
-- Admins keep full access via existing "Admins manage content" policy.

-- 5. SECURITY DEFINER functions: restrict EXECUTE
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_new_quote() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
