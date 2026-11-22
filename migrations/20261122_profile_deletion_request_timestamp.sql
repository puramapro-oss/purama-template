-- Render {{SLUG}} with the same trusted application schema as schema.sql.
-- No historical timestamp is inferred or backfilled. Existing flags and rows
-- are preserved. This migration does not authorize any auth.users deletion.
BEGIN;

ALTER TABLE {{SLUG}}.profiles
  ADD COLUMN IF NOT EXISTS deletion_requested BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ;

-- BEGIN PROFILE DELETION REQUEST TIMESTAMP
CREATE OR REPLACE FUNCTION {{SLUG}}.stamp_profile_deletion_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog
AS $$
BEGIN
  IF NEW.deletion_requested IS NOT TRUE THEN
    NEW.deletion_requested_at := NULL;
  ELSIF TG_OP = 'INSERT' THEN
    NEW.deletion_requested_at := statement_timestamp();
  ELSIF OLD.deletion_requested IS NOT TRUE THEN
    NEW.deletion_requested_at := statement_timestamp();
  ELSE
    -- Preserve the original request, including undated legacy flags.
    -- A supplied client timestamp cannot shorten or restart the delay.
    NEW.deletion_requested_at := OLD.deletion_requested_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_deletion_request_timestamp ON {{SLUG}}.profiles;
CREATE TRIGGER profiles_deletion_request_timestamp
  BEFORE INSERT OR UPDATE OF deletion_requested, deletion_requested_at
  ON {{SLUG}}.profiles
  FOR EACH ROW
  EXECUTE FUNCTION {{SLUG}}.stamp_profile_deletion_request();

CREATE INDEX IF NOT EXISTS profiles_deletion_request_due_idx
  ON {{SLUG}}.profiles (deletion_requested_at)
  WHERE deletion_requested IS TRUE AND deletion_requested_at IS NOT NULL;
-- END PROFILE DELETION REQUEST TIMESTAMP

COMMIT;
