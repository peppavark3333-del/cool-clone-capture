
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_new_quote() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

DROP POLICY IF EXISTS "Anyone can submit a quote" ON public.quotes;
CREATE POLICY "Anyone can submit a quote" ON public.quotes
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL AND length(name) BETWEEN 1 AND 200
    AND phone IS NOT NULL AND length(phone) BETWEEN 5 AND 50
    AND email IS NOT NULL AND length(email) BETWEEN 5 AND 200 AND email ~ '@'
    AND (message IS NULL OR length(message) <= 5000)
    AND (address IS NULL OR length(address) <= 500)
    AND (service_type IS NULL OR length(service_type) <= 100)
    AND (property_size IS NULL OR length(property_size) <= 100)
  );
