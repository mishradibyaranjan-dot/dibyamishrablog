CREATE OR REPLACE FUNCTION public.preserve_job_publication()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $function$ BEGIN NEW.original_posted_at=OLD.original_posted_at; NEW.expires_at=LEAST(NEW.expires_at,OLD.original_posted_at+interval '7 days'); RETURN NEW; END $function$;