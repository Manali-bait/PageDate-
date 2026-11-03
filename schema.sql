-- PageDate Lesson 1: the shelf table, one row per user per book.
create table public.shelf (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  book_key text not null,
  title text not null,
  author text,
  cover text,
  pages int check (pages > 0),
  year int,
  subject text,
  status text not null default 'want' check (status in ('want','reading','read','hold','dnf')),
  page int not null default 0 check (page >= 0),
  rating int check (rating between 1 and 5),
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, book_key)          -- no duplicate book per user
);
create index shelf_user_idx on public.shelf (user_id, status);

-- Row Level Security: each user can only touch their OWN rows.
alter table public.shelf enable row level security;
create policy "own shelf" on public.shelf
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);