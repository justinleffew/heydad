-- Create profiles table if it doesn't exist
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique,
    referral_code text unique,
    free_months integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create referrals table
create table if not exists public.referrals (
    id uuid default uuid_generate_v4() primary key,
    referrer_id uuid references public.profiles(id) on delete cascade,
    referred_email text not null,
    status text default 'pending' check (status in ('pending', 'completed', 'expired')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create function to generate referral code
create or replace function generate_referral_code()
returns trigger as $$
begin
    new.referral_code := substr(md5(random()::text), 1, 8);
    return new;
end;
$$ language plpgsql;

-- Create trigger to generate referral code on profile creation
drop trigger if exists generate_referral_code_trigger on public.profiles;
create trigger generate_referral_code_trigger
    before insert on public.profiles
    for each row
    execute function generate_referral_code();

-- Create function to transfer free months
create or replace function transfer_free_months(
    sender_id uuid,
    recipient_id uuid,
    months integer
)
returns void as $$
begin
    -- Check if sender has enough months
    if (select free_months from public.profiles where id = sender_id) < months then
        raise exception 'Not enough free months';
    end if;

    -- Update sender's free months
    update public.profiles
    set free_months = free_months - months
    where id = sender_id;

    -- Update recipient's free months
    update public.profiles
    set free_months = free_months + months
    where id = recipient_id;
end;
$$ language plpgsql;

-- Create function to handle successful referrals
create or replace function handle_successful_referral(
    referral_id uuid
)
returns void as $$
declare
    referrer_id uuid;
begin
    -- Get referrer_id
    select referrer_id into referrer_id
    from public.referrals
    where id = referral_id;

    -- Update referral status
    update public.referrals
    set status = 'completed'
    where id = referral_id;

    -- Add free month to referrer
    update public.profiles
    set free_months = free_months + 1
    where id = referrer_id;
end;
$$ language plpgsql;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can view their own referrals" on public.referrals;
drop policy if exists "Users can create referrals" on public.referrals;

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.referrals enable row level security;

-- Create new policies
create policy "Users can view their own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

create policy "Users can view their own referrals"
    on public.referrals for select
    using (auth.uid() = referrer_id);

create policy "Users can create referrals"
    on public.referrals for insert
    with check (auth.uid() = referrer_id); 