
-- Update handle_new_user to grant admin to the new email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone');

  IF lower(NEW.email) = 'rybus.info@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $function$;

-- Rename the existing admin account's email
UPDATE auth.users
SET email = 'rybus.info@gmail.com',
    raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE lower(email) = 'rybusadmin@rybus.com';

UPDATE public.profiles
SET email = 'rybus.info@gmail.com', updated_at = now()
WHERE lower(email) = 'rybusadmin@rybus.com';
