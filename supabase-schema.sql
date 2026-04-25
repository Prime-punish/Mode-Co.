-- ╔════════════════════════════════════════════════════════════╗
-- ║  MODE & CO. — Supabase Schema                             ║
-- ║  Run this in your Supabase SQL Editor                     ║
-- ╚════════════════════════════════════════════════════════════╝

-- Enable Row Level Security globally
-- Make sure to configure your project URL + anon key in login.html & dashboard.html

-- ── PROFILES ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'staff' CHECK (role IN ('admin','manager','staff')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── PRODUCTS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  stock INT DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated users can read products" ON public.products
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- ── CLIENTS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  tier TEXT DEFAULT 'standard' CHECK (tier IN ('standard','silver','gold','platinum')),
  total_spent NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read clients" ON public.clients
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert clients" ON public.clients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ── ORDERS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id),
  client_name TEXT NOT NULL,
  product TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id),
  amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'traitement'
    CHECK (status IN ('traitement','en-cours','livré','annulé')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read orders" ON public.orders
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert orders" ON public.orders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update orders" ON public.orders
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Auto update updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ── ACTIVITY LOG ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read activity" ON public.activity_log
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert activity" ON public.activity_log
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ── SEED DATA (demo) ──────────────────────────────────────────────
INSERT INTO public.clients (full_name, email, phone, tier, total_spent) VALUES
  ('Sophie Martin', 'sophie.martin@email.fr', '+33 6 12 34 56 78', 'platinum', 42800),
  ('Chloé Durand', 'chloe.durand@email.fr', '+33 6 23 45 67 89', 'gold', 18500),
  ('Emma Lefebvre', 'emma.lefebvre@email.fr', '+33 6 34 56 78 90', 'silver', 9200),
  ('Léa Bernard', 'lea.bernard@email.fr', '+33 6 45 67 89 01', 'standard', 3400),
  ('Clara Petit', 'clara.petit@email.fr', '+33 6 56 78 90 12', 'gold', 22100),
  ('Julie Moreau', 'julie.moreau@email.fr', '+33 6 67 89 01 23', 'platinum', 38600)
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.products (name, category, price, stock) VALUES
  ('Robe Élégance Noire', 'Robes de Soirée', 3200, 12),
  ('Sac Croco Gold', 'Maroquinerie', 1850, 8),
  ('Manteau Cachemire', 'Manteaux', 4700, 5),
  ('Escarpins Satin', 'Chaussures', 890, 23),
  ('Blazer Marine Premium', 'Vêtements Business', 2100, 15),
  ('Collier Perles Naturelles', 'Bijoux', 1400, 9);

INSERT INTO public.orders (client_name, product, amount, status) VALUES
  ('Sophie Martin', 'Robe Élégance Noire', 3200, 'livré'),
  ('Chloé Durand', 'Sac Croco Gold', 1850, 'en-cours'),
  ('Emma Lefebvre', 'Manteau Cachemire', 4700, 'traitement'),
  ('Léa Bernard', 'Escarpins Satin', 890, 'livré'),
  ('Clara Petit', 'Blazer Marine Premium', 2100, 'annulé'),
  ('Julie Moreau', 'Collier Perles Naturelles', 1400, 'livré');

-- ── REALTIME ──────────────────────────────────────────────────────
-- Enable realtime for orders table (in Supabase dashboard > Database > Replication)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;
