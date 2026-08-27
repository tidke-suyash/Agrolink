-- ╔══════════════════════════════════════════════════════════════╗
-- ║  AgroLink — Supabase Postgres Schema                       ║
-- ║  Run this in Supabase SQL Editor (Dashboard → SQL Editor)  ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ─── 1. Custom Types ───────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('farmer', 'customer', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'confirmed', 'shipped', 'delivered', 'cancelled');
CREATE TYPE product_category AS ENUM (
  'grains', 'vegetables', 'fruits', 'pulses', 'spices',
  'dairy', 'organic', 'seeds', 'fertilizers', 'equipment'
);

-- ─── 2. Profiles ───────────────────────────────────────────────

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'customer',
  name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for role-based queries
CREATE INDEX idx_profiles_role ON profiles(role);

-- ─── 3. Products ───────────────────────────────────────────────

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  unit TEXT NOT NULL DEFAULT 'kg',
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  images TEXT[] DEFAULT '{}',
  category product_category NOT NULL DEFAULT 'vegetables',
  is_approved BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_farmer ON products(farmer_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active, is_approved);

-- ─── 4. Orders ─────────────────────────────────────────────────

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]',
  total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
  status order_status NOT NULL DEFAULT 'pending',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  shipping_address JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ─── 5. Market Prices (Mandi Data) ────────────────────────────

CREATE TABLE market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name TEXT NOT NULL,
  market_name TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT,
  min_price NUMERIC(10, 2),
  max_price NUMERIC(10, 2),
  modal_price NUMERIC(10, 2),
  unit TEXT DEFAULT 'quintal',
  date DATE NOT NULL,
  source TEXT DEFAULT 'agmarknet',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_market_crop ON market_prices(crop_name);
CREATE INDEX idx_market_state ON market_prices(state);
CREATE INDEX idx_market_date ON market_prices(date DESC);
CREATE UNIQUE INDEX idx_market_unique ON market_prices(crop_name, market_name, date);

-- ─── 6. Weather Cache ──────────────────────────────────────────

CREATE TABLE weather_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_key TEXT NOT NULL UNIQUE,
  lat NUMERIC(9, 6),
  lng NUMERIC(9, 6),
  data JSONB NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_weather_location ON weather_cache(location_key);

-- ─── 7. AI Chat History ────────────────────────────────────────

CREATE TABLE ai_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Chat',
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_chats_user ON ai_chats(user_id);

-- ─── 8. Auto-create profile on signup ──────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name);
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user trigger encountered an error: %', SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─── 9. Auto-update updated_at ─────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER ai_chats_updated_at
  BEFORE UPDATE ON ai_chats FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 10. Row Level Security ────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;

-- Grant usage to schema
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- PROFILES: users read/update/insert own row; admin reads all
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users and system can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

-- PRODUCTS: anyone can read approved+active; farmer manages own
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true AND is_approved = true);

CREATE POLICY "Farmers can view own products"
  ON products FOR SELECT
  USING (farmer_id = auth.uid());

CREATE POLICY "Admin can view all products"
  ON products FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Farmers can insert products"
  ON products FOR INSERT
  WITH CHECK (farmer_id = auth.uid());

CREATE POLICY "Farmers can update own products"
  ON products FOR UPDATE
  USING (farmer_id = auth.uid());

CREATE POLICY "Farmers can delete own products"
  ON products FOR DELETE
  USING (farmer_id = auth.uid());

CREATE POLICY "Admin can update any product"
  ON products FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ORDERS: buyer sees own, farmer sees orders containing their products
CREATE POLICY "Buyers can view own orders"
  ON orders FOR SELECT
  USING (buyer_id = auth.uid());

CREATE POLICY "Buyers can create orders"
  ON orders FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Admin can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can update any order"
  ON orders FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- MARKET PRICES: everyone can read
CREATE POLICY "Anyone can view market prices"
  ON market_prices FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage market prices"
  ON market_prices FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- WEATHER CACHE: everyone can read
CREATE POLICY "Anyone can view weather cache"
  ON weather_cache FOR SELECT
  USING (true);

-- AI CHATS: users see own chats only
CREATE POLICY "Users can view own chats"
  ON ai_chats FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create chats"
  ON ai_chats FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own chats"
  ON ai_chats FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own chats"
  ON ai_chats FOR DELETE
  USING (user_id = auth.uid());

-- ─── 11. Enable Realtime ───────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE market_prices;
ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- ─── 12. Seed Market Price Data ────────────────────────────────

INSERT INTO market_prices (crop_name, market_name, state, district, min_price, max_price, modal_price, date) VALUES
  ('Wheat', 'Azadpur Mandi', 'Delhi', 'New Delhi', 2200, 2450, 2350, CURRENT_DATE),
  ('Rice (Basmati)', 'Azadpur Mandi', 'Delhi', 'New Delhi', 3800, 4200, 4000, CURRENT_DATE),
  ('Tomato', 'Vashi Market', 'Maharashtra', 'Mumbai', 1500, 2200, 1800, CURRENT_DATE),
  ('Onion', 'Lasalgaon', 'Maharashtra', 'Nashik', 800, 1400, 1100, CURRENT_DATE),
  ('Potato', 'Azadpur Mandi', 'Delhi', 'New Delhi', 1000, 1500, 1200, CURRENT_DATE),
  ('Rice', 'Koyambedu', 'Tamil Nadu', 'Chennai', 2800, 3200, 3000, CURRENT_DATE),
  ('Turmeric', 'Erode Market', 'Tamil Nadu', 'Erode', 8000, 12000, 10000, CURRENT_DATE),
  ('Soybean', 'Indore Mandi', 'Madhya Pradesh', 'Indore', 4200, 4800, 4500, CURRENT_DATE),
  ('Cotton', 'Rajkot Market', 'Gujarat', 'Rajkot', 6000, 7200, 6600, CURRENT_DATE),
  ('Mustard', 'Jaipur Mandi', 'Rajasthan', 'Jaipur', 4800, 5400, 5100, CURRENT_DATE),
  ('Chilli (Red)', 'Guntur Market', 'Andhra Pradesh', 'Guntur', 14000, 18000, 16000, CURRENT_DATE),
  ('Maize', 'Davangere', 'Karnataka', 'Davangere', 1800, 2200, 2000, CURRENT_DATE),
  ('Banana', 'Jalgaon', 'Maharashtra', 'Jalgaon', 600, 1000, 800, CURRENT_DATE),
  ('Mango (Alphonso)', 'Ratnagiri', 'Maharashtra', 'Ratnagiri', 25000, 40000, 32000, CURRENT_DATE),
  ('Cardamom', 'Bodinayakanur', 'Tamil Nadu', 'Theni', 80000, 120000, 100000, CURRENT_DATE);
