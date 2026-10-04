-- ONGIL Family Connection V2 — migration 001 (PostgreSQL 13+). Apply AFTER server/livon/userdata/migrations/001_account_backend.sql:
-- family records hang off the same Newon+ account table (user_accounts), so an account is one person across LIVON and ONGIL.
-- Idempotent (IF NOT EXISTS) and in one transaction: every object below exists afterwards, or nothing changed.
--
-- What is NOT stored here: invitation codes (only their SHA-256 hash), Firebase tokens, e-mail, names of the account holder,
-- health values, medication names, journal text, or any ONGIL record. Shared content is only the short, permission-filtered
-- lines the owner chose to publish per member and category (family_snapshots), and they are deleted when access ends.
-- Timestamps are epoch milliseconds (server clock).

begin;

-- one family group per owner account: the person whose ONGIL it is
create table if not exists ongil_family_groups (
  id                text primary key check (id ~ '^fg_[a-z0-9]{12,32}$'),
  owner_account_id  text not null unique references user_accounts(account_id) on delete cascade,
  created_at        bigint not null,
  updated_at        bigint not null
);

-- a person (another account) connected to an owner's group. A role grants nothing; permissions do.
create table if not exists ongil_family_members (
  id                 text primary key check (id ~ '^fm_[a-z0-9]{12,32}$'),
  group_id           text not null references ongil_family_groups(id) on delete cascade,
  member_account_id  text not null references user_accounts(account_id) on delete cascade,
  display_name       text not null check (length(display_name) between 1 and 20),   -- what the OWNER calls this member
  owner_label        text not null check (length(owner_label) between 1 and 20),    -- what the MEMBER calls the owner
  relationship       text not null check (relationship in ('spouse','child','sibling','parent','relative','other')),
  role               text not null check (role in ('FAMILY','CAREGIVER')),
  status             text not null check (status in ('ACTIVE','DISCONNECTED','LEFT')),
  invitation_id      text not null,
  joined_at          bigint not null,
  ended_at           bigint,
  check ((status = 'ACTIVE') = (ended_at is null))
);
-- one ACTIVE membership per (group, account); an ended one can be followed by a new connection (new invitation)
create unique index if not exists ongil_family_members_active_uq on ongil_family_members (group_id, member_account_id) where status = 'ACTIVE';
create index if not exists ongil_family_members_account_idx on ongil_family_members (member_account_id);

create table if not exists ongil_family_invitations (
  id            text primary key check (id ~ '^fi_[a-z0-9]{12,32}$'),
  group_id      text not null references ongil_family_groups(id) on delete cascade,
  created_by    text not null references user_accounts(account_id) on delete cascade,
  token_hash    text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),             -- SHA-256 of the code; the code itself is never stored
  display_name  text not null check (length(display_name) between 1 and 20),
  relationship  text not null check (relationship in ('spouse','child','sibling','parent','relative','other')),
  role          text not null check (role in ('FAMILY','CAREGIVER')),
  status        text not null check (status in ('PENDING','ACCEPTED','DECLINED','REVOKED')),  -- EXPIRED is computed from expires_at
  expires_at    bigint not null,
  accepted_by   text references user_accounts(account_id) on delete set null,
  member_id     text,
  created_at    bigint not null,
  updated_at    bigint not null,
  check (expires_at > created_at)
);
create index if not exists ongil_family_invitations_group_idx on ongil_family_invitations (group_id, status);

-- what ONE member may see of ONE category, and how much. No row = not shared (default deny).
create table if not exists ongil_family_permissions (
  group_id    text not null references ongil_family_groups(id) on delete cascade,
  member_id   text not null references ongil_family_members(id) on delete cascade,
  category    text not null check (category in ('CHECK_IN','SCHEDULE','MEDICATION','HEALTH','CHECKUP','ACTIVITY','MEAL','SLEEP','HELP_REQUEST','EMERGENCY_INFO')),
  level       text not null check (level in ('SUMMARY','DETAIL')),
  updated_at  bigint not null,
  primary key (member_id, category)
);

-- the owner's explicit consent for a sensitive category, per member. Withdrawn is never switched back on by itself.
create table if not exists ongil_family_consents (
  group_id      text not null references ongil_family_groups(id) on delete cascade,
  member_id     text not null references ongil_family_members(id) on delete cascade,
  category      text not null check (category in ('MEDICATION','HEALTH','CHECKUP','EMERGENCY_INFO')),
  level         text not null check (level in ('SUMMARY','DETAIL')),
  status        text not null check (status in ('GRANTED','WITHDRAWN')),
  granted_at    bigint not null,
  withdrawn_at  bigint,
  primary key (member_id, category)
);

-- the short lines the owner published for one member and category (already filtered on the owner's device AND again here)
create table if not exists ongil_family_snapshots (
  group_id      text not null references ongil_family_groups(id) on delete cascade,
  member_id     text not null references ongil_family_members(id) on delete cascade,
  category      text not null check (category in ('CHECK_IN','SCHEDULE','MEDICATION','HEALTH','CHECKUP','ACTIVITY','MEAL','SLEEP','EMERGENCY_INFO')),
  level         text not null check (level in ('SUMMARY','DETAIL')),
  lines         jsonb not null check (jsonb_typeof(lines) = 'array' and jsonb_array_length(lines) between 1 and 10 and octet_length(lines::text) <= 4096),
  published_at  bigint not null,
  primary key (member_id, category)
);

create table if not exists ongil_family_help_requests (
  id          text primary key check (id ~ '^fr_[a-z0-9]{12,32}$'),
  group_id    text not null references ongil_family_groups(id) on delete cascade,
  member_id   text not null references ongil_family_members(id) on delete cascade,
  kind        text not null check (kind in ('hospital-escort','shopping','call','housework','other')),
  message     text not null check (length(message) <= 300),
  status      text not null check (status in ('REQUESTED','SEEN','ACCEPTED','COMPLETED','CANCELLED')),
  created_at  bigint not null,
  updated_at  bigint not null
);
create index if not exists ongil_family_help_member_idx on ongil_family_help_requests (member_id, status);

-- audit: what happened, never a shared value, a message, a code or a token. Kept: the newest 200 per group.
create table if not exists ongil_family_activity (
  id          bigserial primary key,
  group_id    text not null references ongil_family_groups(id) on delete cascade,
  actor       text not null check (actor in ('OWNER','MEMBER','SYSTEM')),
  action      text not null check (action in ('INVITE_CREATED','INVITE_REVOKED','INVITE_DECLINED','INVITE_ACCEPTED','SHARING_CHANGED','CONSENT_GIVEN','CONSENT_WITHDRAWN','SHARING_STOPPED','SHARING_STOPPED_ALL','DISCONNECTED','MEMBER_LEFT','HELP_REQUESTED','HELP_STATUS_CHANGED')),
  member_id   text,
  category    text,
  status      text,
  created_at  bigint not null
);
create index if not exists ongil_family_activity_group_idx on ongil_family_activity (group_id, id desc);

commit;
