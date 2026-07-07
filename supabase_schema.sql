-- Create the user_profiles table for onboarding data
create table if not exists public.user_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null unique,
  strong_subjects text[] check (array_length(strong_subjects, 1) >= 0),
  weak_subjects text[] check (array_length(weak_subjects, 1) >= 0),
  daily_study_time_minutes integer check (daily_study_time_minutes >= 0 and daily_study_time_minutes <= 1440),
  onboarding_completed boolean default false,
  exam_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.user_profiles enable row level security;

-- Policy: Users can insert their own profile
create policy "Users can insert their own profile"
  on public.user_profiles
  for insert
  using (auth.uid() = user_id);

-- Policy: Users can select their own profile
create policy "Users can select their own profile"
  on public.user_profiles
  for select
  using (auth.uid() = user_id);

-- Policy: Users can update their own profile
create policy "Users can update their own profile"
  on public.user_profiles
  for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own profile (optional, but good practice)
create policy "Users can delete their own profile"
  on public.user_profiles
  for delete
  using (auth.uid() = user_id);

-- Trigger to update updated_at column
create trigger update_user_profiles_updated_at
  before update on public.user_profiles
  for each row
  execute procedure moddatetime (updated_at);