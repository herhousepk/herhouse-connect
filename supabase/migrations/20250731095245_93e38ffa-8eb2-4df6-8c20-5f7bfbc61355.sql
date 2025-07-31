-- Create enum types for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'her_supplier', 'her_host', 'her_customer', 'her_affiliate_partner');

CREATE TYPE public.product_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');

CREATE TYPE public.reward_status AS ENUM ('pending', 'approved', 'rejected', 'paid');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'her_customer',
  avatar_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  store_name TEXT,
  store_slug TEXT UNIQUE,
  address TEXT,
  city TEXT,
  referral_code TEXT UNIQUE,
  affiliate_code TEXT UNIQUE,
  referred_by_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  her_host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  her_supplier_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  bulk_price DECIMAL(10,2),
  bulk_quantity INTEGER DEFAULT 1,
  brand TEXT,
  size TEXT,
  color TEXT,
  category TEXT,
  images TEXT[],
  stock_quantity INTEGER DEFAULT 0,
  status product_status DEFAULT 'pending',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  her_host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  status order_status DEFAULT 'pending',
  shipping_address TEXT NOT NULL,
  phone TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

-- Create reward_milestones table
CREATE TABLE public.reward_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  target_referrals INTEGER,
  target_sales DECIMAL(12,2),
  target_customers INTEGER,
  reward_amount DECIMAL(10,2),
  reward_type TEXT, -- 'cash', 'mobile_load', 'gift'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reward_claims table
CREATE TABLE public.reward_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES public.reward_milestones(id) ON DELETE CASCADE,
  proof_url TEXT,
  status reward_status DEFAULT 'pending',
  admin_notes TEXT,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_claims ENABLE ROW LEVEL SECURITY;

-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role = 'admin' FROM public.profiles WHERE user_id = user_uuid;
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all approved profiles"
  ON public.profiles FOR SELECT
  USING (is_approved = true OR user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for products
CREATE POLICY "Anyone can view approved products"
  ON public.products FOR SELECT
  USING (status = 'approved');

CREATE POLICY "HerHosts can manage their own products"
  ON public.products FOR ALL
  USING (her_host_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "HerSuppliers can view their products"
  ON public.products FOR SELECT
  USING (her_supplier_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all products"
  ON public.products FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (
    customer_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    her_host_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    public.is_admin(auth.uid())
  );

CREATE POLICY "Customers can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (customer_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "HerHosts can update their orders"
  ON public.orders FOR UPDATE
  USING (her_host_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for order_items
CREATE POLICY "Users can view order items for their orders"
  ON public.order_items FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.orders WHERE 
      customer_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
      her_host_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
      public.is_admin(auth.uid())
    )
  );

-- RLS Policies for referrals
CREATE POLICY "Users can view their referrals"
  ON public.referrals FOR SELECT
  USING (
    referrer_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    referred_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    public.is_admin(auth.uid())
  );

CREATE POLICY "Users can create referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (referrer_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for reward_milestones
CREATE POLICY "Anyone can view active milestones"
  ON public.reward_milestones FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage milestones"
  ON public.reward_milestones FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for reward_claims
CREATE POLICY "Users can view their own claims"
  ON public.reward_claims FOR SELECT
  USING (
    user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    public.is_admin(auth.uid())
  );

CREATE POLICY "Users can create their own claims"
  ON public.reward_claims FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create function to generate referral codes
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE SQL
AS $$
  SELECT 'R-' || upper(substring(md5(random()::text) from 1 for 3)) || 
         upper(substring(md5(random()::text) from 1 for 2)) || 
         upper(substring(md5(random()::text) from 1 for 3));
$$;

-- Create function to generate affiliate codes
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS TEXT
LANGUAGE SQL
AS $$
  SELECT 'A-' || upper(substring(md5(random()::text) from 1 for 3)) || 
         upper(substring(md5(random()::text) from 1 for 2)) || 
         upper(substring(md5(random()::text) from 1 for 3));
$$;

-- Create function to generate store slug
CREATE OR REPLACE FUNCTION public.generate_store_slug(store_name TEXT)
RETURNS TEXT
LANGUAGE SQL
AS $$
  SELECT lower(regexp_replace(store_name, '[^a-zA-Z0-9]+', '-', 'g'));
$$;

-- Create function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE SQL
AS $$
  SELECT 'HH-' || to_char(now(), 'YYYYMMDD') || '-' || 
         upper(substring(md5(random()::text) from 1 for 6));
$$;

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default reward milestones
INSERT INTO public.reward_milestones (title, description, target_referrals, reward_amount, reward_type) VALUES
('10 Referrals Milestone', 'Get mobile load for referring 10 customers', 10, 100.00, 'mobile_load'),
('50 Referrals Milestone', 'Get surprise gift for referring 50 customers', 50, 500.00, 'gift'),
('100 Referrals Milestone', 'Special milestone reward for 100 referrals', 100, 1000.00, 'cash');

INSERT INTO public.reward_milestones (title, description, target_customers, target_sales, reward_amount, reward_type) VALUES
('100 Customers + 100K Sales', 'Cash reward for 100 customers and 100,000 sales', 100, 100000.00, 2000.00, 'cash');