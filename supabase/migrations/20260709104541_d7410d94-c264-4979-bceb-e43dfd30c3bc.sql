
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS "Admins view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins view quotes" ON public.quotes;
DROP POLICY IF EXISTS "Admins update quotes" ON public.quotes;
DROP POLICY IF EXISTS "Admins delete quotes" ON public.quotes;
CREATE POLICY "Admins view quotes" ON public.quotes FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update quotes" ON public.quotes FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete quotes" ON public.quotes FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage customers" ON public.customers;
CREATE POLICY "Admins manage customers" ON public.customers FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public read albums" ON public.gallery_albums;
DROP POLICY IF EXISTS "Admins manage albums" ON public.gallery_albums;
CREATE POLICY "Public read albums" ON public.gallery_albums FOR SELECT TO anon, authenticated USING (published OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage albums" ON public.gallery_albums FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage photos" ON public.gallery_photos;
CREATE POLICY "Admins manage photos" ON public.gallery_photos FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage content" ON public.site_content;
CREATE POLICY "Admins manage content" ON public.site_content FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public read testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins manage testimonials" ON public.testimonials;
CREATE POLICY "Public read testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (published OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins read notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins delete notifications" ON public.notifications;
CREATE POLICY "Admins read notifications" ON public.notifications FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update notifications" ON public.notifications FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete notifications" ON public.notifications FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins read audit logs" ON public.audit_logs;
CREATE POLICY "Admins read audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins read pageviews" ON public.page_views;
CREATE POLICY "Admins read pageviews" ON public.page_views FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins upload gallery" ON storage.objects;
DROP POLICY IF EXISTS "Admins update gallery" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete gallery" ON storage.objects;
CREATE POLICY "Admins upload gallery" ON storage.objects FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'gallery') AND private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update gallery" ON storage.objects FOR UPDATE TO authenticated USING ((bucket_id = 'gallery') AND private.has_role(auth.uid(), 'admin')) WITH CHECK ((bucket_id = 'gallery') AND private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete gallery" ON storage.objects FOR DELETE TO authenticated USING ((bucket_id = 'gallery') AND private.has_role(auth.uid(), 'admin'));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
