-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  first_name text,
  last_name text,
  phone text,
  tier text default 'starter', -- 'starter' | 'hero'
  subscription_status text default 'inactive', -- 'active' | 'inactive'
  last_transaction_id text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Function to handle new user signup
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id, 
    username, 
    first_name, 
    last_name, 
    phone, 
    tier,
    subscription_status
  )
  values (
    new.id, 
    new.raw_user_meta_data ->> 'username', 
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'phone',
    coalesce(new.raw_user_meta_data ->> 'tier', 'starter'),
    'inactive'
  );
  return new;
end;
$$;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
