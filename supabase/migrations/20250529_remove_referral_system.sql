-- Drop referral-related functions
drop function if exists transfer_free_months(uuid, uuid, integer);
drop function if exists handle_successful_referral(uuid);
drop function if exists generate_referral_code();

-- Drop referral-related triggers
drop trigger if exists generate_referral_code_trigger on public.profiles;

-- Drop referral-related policies
drop policy if exists "Users can view their own referrals" on public.referrals;
drop policy if exists "Users can create referrals" on public.referrals;

-- Drop referrals table
drop table if exists public.referrals;

-- Remove referral-related columns from profiles table
alter table public.profiles
  drop column if exists referral_code,
  drop column if exists free_months; 