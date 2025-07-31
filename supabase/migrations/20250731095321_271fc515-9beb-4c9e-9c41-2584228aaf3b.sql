-- Fix security definer functions by setting search_path
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role = 'admin' FROM public.profiles WHERE user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT 'R-' || upper(substring(md5(random()::text) from 1 for 3)) || 
         upper(substring(md5(random()::text) from 1 for 2)) || 
         upper(substring(md5(random()::text) from 1 for 3));
$$;

CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS TEXT
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT 'A-' || upper(substring(md5(random()::text) from 1 for 3)) || 
         upper(substring(md5(random()::text) from 1 for 2)) || 
         upper(substring(md5(random()::text) from 1 for 3));
$$;

CREATE OR REPLACE FUNCTION public.generate_store_slug(store_name TEXT)
RETURNS TEXT
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT lower(regexp_replace(store_name, '[^a-zA-Z0-9]+', '-', 'g'));
$$;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT 'HH-' || to_char(now(), 'YYYYMMDD') || '-' || 
         upper(substring(md5(random()::text) from 1 for 6));
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;