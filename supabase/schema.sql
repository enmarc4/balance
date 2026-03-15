create extension if not exists pgcrypto;

create type account_type as enum (
  'cash',
  'checking',
  'savings',
  'investment',
  'credit',
  'wallet'
);

create type account_status as enum ('active', 'archived');
create type transaction_type as enum ('income', 'expense');
create type recurrence_frequency as enum ('daily', 'weekly', 'monthly', 'yearly');

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null,
  preferred_currency text not null default 'EUR',
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type account_type not null,
  currency text not null,
  current_balance numeric(14,2) not null default 0,
  status account_status not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kind transaction_type not null,
  color text,
  icon text,
  is_system boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  recurrence_id uuid,
  type transaction_type not null,
  name text not null,
  notes text,
  amount numeric(14,2) not null check (amount >= 0),
  currency text not null,
  transaction_date date not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists recurrences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  type transaction_type not null,
  name text not null,
  amount numeric(14,2) not null check (amount >= 0),
  currency text not null,
  frequency recurrence_frequency not null,
  start_date date not null,
  end_date date,
  next_run_date date not null,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table transactions
  add constraint transactions_recurrence_fk
  foreign key (recurrence_id) references recurrences(id) on delete set null;

create index if not exists idx_profiles_user on profiles(user_id);
create index if not exists idx_accounts_user_status on accounts(user_id, status);
create index if not exists idx_categories_user_kind on categories(user_id, kind);
create index if not exists idx_transactions_user_date on transactions(user_id, transaction_date desc);
create index if not exists idx_transactions_account_date on transactions(account_id, transaction_date desc);
create index if not exists idx_transactions_category on transactions(category_id);
create index if not exists idx_recurrences_user_active on recurrences(user_id, active);
create index if not exists idx_recurrences_next_run on recurrences(next_run_date);

create or replace function set_updated_at_timestamp()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on profiles;
create trigger trg_profiles_updated_at
before update on profiles
for each row execute function set_updated_at_timestamp();

drop trigger if exists trg_accounts_updated_at on accounts;
create trigger trg_accounts_updated_at
before update on accounts
for each row execute function set_updated_at_timestamp();

drop trigger if exists trg_categories_updated_at on categories;
create trigger trg_categories_updated_at
before update on categories
for each row execute function set_updated_at_timestamp();

drop trigger if exists trg_transactions_updated_at on transactions;
create trigger trg_transactions_updated_at
before update on transactions
for each row execute function set_updated_at_timestamp();

drop trigger if exists trg_recurrences_updated_at on recurrences;
create trigger trg_recurrences_updated_at
before update on recurrences
for each row execute function set_updated_at_timestamp();

alter table profiles enable row level security;
alter table accounts enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;
alter table recurrences enable row level security;

create policy "profiles_select_own" on profiles
for select using (auth.uid() = user_id);
create policy "profiles_insert_own" on profiles
for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on profiles
for update using (auth.uid() = user_id);
create policy "profiles_delete_own" on profiles
for delete using (auth.uid() = user_id);

create policy "accounts_select_own" on accounts
for select using (auth.uid() = user_id);
create policy "accounts_insert_own" on accounts
for insert with check (auth.uid() = user_id);
create policy "accounts_update_own" on accounts
for update using (auth.uid() = user_id);
create policy "accounts_delete_own" on accounts
for delete using (auth.uid() = user_id);

create policy "categories_select_own" on categories
for select using (auth.uid() = user_id);
create policy "categories_insert_own" on categories
for insert with check (auth.uid() = user_id);
create policy "categories_update_own" on categories
for update using (auth.uid() = user_id);
create policy "categories_delete_own" on categories
for delete using (auth.uid() = user_id);

create policy "transactions_select_own" on transactions
for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on transactions
for insert with check (auth.uid() = user_id);
create policy "transactions_update_own" on transactions
for update using (auth.uid() = user_id);
create policy "transactions_delete_own" on transactions
for delete using (auth.uid() = user_id);

create policy "recurrences_select_own" on recurrences
for select using (auth.uid() = user_id);
create policy "recurrences_insert_own" on recurrences
for insert with check (auth.uid() = user_id);
create policy "recurrences_update_own" on recurrences
for update using (auth.uid() = user_id);
create policy "recurrences_delete_own" on recurrences
for delete using (auth.uid() = user_id);
