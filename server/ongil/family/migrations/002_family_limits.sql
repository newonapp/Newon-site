-- ONGIL Family Connection V2 — migration 002 (PostgreSQL 13+). Apply AFTER 001_family.sql.
-- Makes the two family limits exact under concurrency. The store's statements count before they write, but under READ COMMITTED
-- requests that overlap in time each count before the others commit: without this migration a family could end up with more
-- than 10 connected members (one per invitation accepted at the same moment) or more than 5 waiting invitations.
--
-- How: a BEFORE INSERT trigger takes a transaction-scoped advisory lock for the family group and counts again. A plpgsql
-- statement takes a fresh snapshot, so after waiting for the lock it sees what the other request committed. A refused write
-- raises a fixed SQLSTATE and the whole statement rolls back (invitation, membership and audit row together):
--   OGF01  the family already has 10 connected (ACTIVE) members      → the API answers 409 LIMIT_MEMBERS
--   OGF02  the family already has 5 waiting (PENDING, unexpired)     → the API answers 409 LIMIT_INVITATIONS
-- The numbers match FAMILY_LIMITS in ongil-start/js/family-domain.js (tests compare them).
-- Only rows of the same family wait for each other; nothing else is locked. No table, column or stored value changes.
-- Idempotent: CREATE OR REPLACE FUNCTION, DROP TRIGGER IF EXISTS + CREATE TRIGGER, all in one transaction.

begin;

create or replace function ongil_family_member_limit() returns trigger language plpgsql as $$
declare n integer;
begin
  if new.status <> 'ACTIVE' then return new; end if;
  perform pg_advisory_xact_lock(hashtextextended('ongil_family_group:' || new.group_id, 0));
  select count(*) into n from ongil_family_members where group_id = new.group_id and status = 'ACTIVE';
  if n >= 10 then
    raise exception 'family member limit' using errcode = 'OGF01';
  end if;
  return new;
end $$;

create or replace function ongil_family_invitation_limit() returns trigger language plpgsql as $$
declare n integer;
begin
  if new.status <> 'PENDING' then return new; end if;
  perform pg_advisory_xact_lock(hashtextextended('ongil_family_group:' || new.group_id, 0));
  select count(*) into n from ongil_family_invitations where group_id = new.group_id and status = 'PENDING' and expires_at > new.created_at;
  if n >= 5 then
    raise exception 'family invitation limit' using errcode = 'OGF02';
  end if;
  return new;
end $$;

drop trigger if exists ongil_family_member_limit on ongil_family_members;
create trigger ongil_family_member_limit before insert on ongil_family_members
  for each row execute function ongil_family_member_limit();

drop trigger if exists ongil_family_invitation_limit on ongil_family_invitations;
create trigger ongil_family_invitation_limit before insert on ongil_family_invitations
  for each row execute function ongil_family_invitation_limit();

commit;
