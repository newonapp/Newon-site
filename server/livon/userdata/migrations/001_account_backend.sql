-- LIVON / Newon+ account backend — migration 001 (PostgreSQL 13+)
-- Apply once to the production database (docs/newon/newon-plus-account-backend.md § Deploy). Idempotent (IF NOT EXISTS).
--
-- Ownership: every user row carries account_id, the server-resolved internal Newon account ("acct_" + 32 hex).
-- The client never sends or chooses it. Identity → account only through account_refs(issuer, subject).
-- Email is not stored and is never an identity key. No passwords, tokens or profile data are stored.
-- Timestamps are epoch milliseconds (the client's own clock for created/updated/deleted; server clock for bookkeeping).

-- One transaction: either every object below exists afterwards or nothing changed.
begin;

create table if not exists user_accounts (
  account_id  text primary key check (account_id ~ '^acct_[0-9a-f]{32}$'),
  created_at  bigint not null,
  server_rev  bigint not null default 0,          -- per-account monotonic change counter (sync cursor)
  status      text not null default 'active' check (status in ('active', 'disabled'))
);

-- verified token identity → account. (issuer, subject) is globally unique: one identity can never belong to two accounts.
create table if not exists account_refs (
  issuer      text not null check (issuer ~ '^https://'),
  subject     text not null check (subject ~ '^[A-Za-z0-9_-]{6,128}$'),
  account_id  text not null references user_accounts(account_id) on delete cascade,
  is_primary  boolean not null default true,
  created_at  bigint not null,
  primary key (issuer, subject)
);
create index if not exists account_refs_account_idx on account_refs (account_id);

-- Common sync columns for every record table (same shape → one write path):
--   collection · record_id · schema_version · data (null for a tombstone) · sensitive · created_at · updated_at ·
--   deleted_at (tombstone) · device_rev (client localRev) · server_rev (assigned from user_accounts.server_rev)

-- tasks, goals, checklists, habits, projects, experiences, journal, transactions, health_records, budgets
create table if not exists user_records (
  account_id     text not null references user_accounts(account_id) on delete cascade,
  collection     text not null check (collection in ('tasks','goals','checklists','habits','projects','experiences','journal','transactions','health_records','budgets')),
  record_id      text not null check (length(record_id) between 1 and 160 and record_id not in ('__proto__','constructor','prototype')),
  schema_version int not null,
  data           jsonb check (data is null or (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 262144)),
  sensitive      boolean not null default false,
  created_at     bigint not null,
  updated_at     bigint not null,
  deleted_at     bigint,
  device_rev     int not null default 0,
  server_rev     bigint not null,
  check ((deleted_at is null) = (data is not null)),   -- live row has data; a tombstone has none
  primary key (account_id, collection, record_id)
);
create index if not exists user_records_rev_idx on user_records (account_id, server_rev);

-- saved items: provider snapshot + provenance kept as saved (data), a few generated columns for lookups
create table if not exists saved_items (
  account_id     text not null references user_accounts(account_id) on delete cascade,
  collection     text not null check (collection = 'saved_items'),
  record_id      text not null check (length(record_id) between 1 and 160 and record_id not in ('__proto__','constructor','prototype')),
  schema_version int not null,
  data           jsonb check (data is null or (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 262144)),
  sensitive      boolean not null default false,
  created_at     bigint not null,
  updated_at     bigint not null,
  deleted_at     bigint,
  device_rev     int not null default 0,
  server_rev     bigint not null,
  check ((deleted_at is null) = (data is not null)),   -- live row has data; a tombstone has none
  item_type      text generated always as (data->>'type') stored,
  folder         text generated always as (data->>'folder') stored,
  provider       text generated always as (data->'data'->'snapshot'->'provenance'->>'provider') stored,
  primary key (account_id, collection, record_id)
);
create index if not exists saved_items_rev_idx on saved_items (account_id, server_rev);

-- calendar: date/start as generated columns (duplicate checks and date queries)
create table if not exists calendar_items (
  account_id     text not null references user_accounts(account_id) on delete cascade,
  collection     text not null check (collection = 'calendar_items'),
  record_id      text not null check (length(record_id) between 1 and 160 and record_id not in ('__proto__','constructor','prototype')),
  schema_version int not null,
  data           jsonb check (data is null or (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 262144)),
  sensitive      boolean not null default false,
  created_at     bigint not null,
  updated_at     bigint not null,
  deleted_at     bigint,
  device_rev     int not null default 0,
  server_rev     bigint not null,
  check ((deleted_at is null) = (data is not null)),   -- live row has data; a tombstone has none
  event_date     text generated always as (data->>'date') stored,
  start_time     text generated always as (data->>'start') stored,
  primary key (account_id, collection, record_id)
);
create index if not exists calendar_items_rev_idx on calendar_items (account_id, server_rev);
create index if not exists calendar_items_date_idx on calendar_items (account_id, event_date);

-- preferences, save folders and life progress (small keyed values)
create table if not exists preferences (
  account_id     text not null references user_accounts(account_id) on delete cascade,
  collection     text not null check (collection in ('preferences','save_folders','life_progress')),
  record_id      text not null check (length(record_id) between 1 and 160 and record_id not in ('__proto__','constructor','prototype')),
  schema_version int not null,
  data           jsonb check (data is null or (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 262144)),
  sensitive      boolean not null default false,
  created_at     bigint not null,
  updated_at     bigint not null,
  deleted_at     bigint,
  device_rev     int not null default 0,
  server_rev     bigint not null,
  check ((deleted_at is null) = (data is not null)),   -- live row has data; a tombstone has none
  primary key (account_id, collection, record_id)
);
create index if not exists preferences_rev_idx on preferences (account_id, server_rev);

-- per-device sync bookkeeping (no content)
create table if not exists sync_metadata (
  account_id          text not null references user_accounts(account_id) on delete cascade,
  device_id           text not null check (device_id ~ '^dv_[a-z0-9]{6,24}$'),
  last_sync_at        bigint,
  last_server_rev     bigint not null default 0,
  conflict_count      int not null default 0,
  import_decided_at   bigint,
  primary key (account_id, device_id)
);

commit;
