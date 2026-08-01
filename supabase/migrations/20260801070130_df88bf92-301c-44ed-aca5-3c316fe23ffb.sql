-- Only the owner account may ever hold the admin role.
CREATE OR REPLACE FUNCTION public.enforce_single_admin_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
  _confirmed timestamptz;
BEGIN
  IF NEW.role <> 'admin' THEN
    RETURN NEW;
  END IF;

  SELECT lower(u.email), u.email_confirmed_at
    INTO _email, _confirmed
    FROM auth.users u
   WHERE u.id = NEW.user_id;

  IF _email IS DISTINCT FROM 'mishra.dibyaranjan@gmail.com' OR _confirmed IS NULL THEN
    RAISE EXCEPTION 'Admin role is restricted to the site owner account'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enforce_single_admin_email() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enforce_single_admin_email_ins ON public.user_roles;
CREATE TRIGGER enforce_single_admin_email_ins
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.enforce_single_admin_email();

-- Remove any admin grant that does not belong to the owner account.
DELETE FROM public.user_roles ur
WHERE ur.role = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM auth.users u
     WHERE u.id = ur.user_id
       AND lower(u.email) = 'mishra.dibyaranjan@gmail.com'
  );