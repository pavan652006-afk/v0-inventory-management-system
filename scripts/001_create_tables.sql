-- Create users profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Allow users to view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow users to insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  supplier TEXT,
  quantity_in_stock INTEGER NOT NULL DEFAULT 0,
  cost_price DECIMAL(10, 2) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products - allow all authenticated users to view
CREATE POLICY "Allow authenticated users to view products" ON public.products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to create products" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow users to update products" ON public.products
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Allow users to delete products" ON public.products
  FOR DELETE USING (auth.uid() = created_by);

-- Create sales table
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity_sold INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  sale_date TIMESTAMP DEFAULT NOW(),
  recorded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security on sales
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sales
CREATE POLICY "Allow authenticated users to view sales" ON public.sales
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to create sales" ON public.sales
  FOR INSERT WITH CHECK (auth.uid() = recorded_by);

-- Create inventory history table for tracking
CREATE TABLE IF NOT EXISTS public.inventory_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity_change INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'adjustment')),
  reference_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security on inventory_history
ALTER TABLE public.inventory_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inventory_history
CREATE POLICY "Allow authenticated users to view inventory history" ON public.inventory_history
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to create inventory history" ON public.inventory_history
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_created_by ON public.products(created_by);
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON public.sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_recorded_by ON public.sales(recorded_by);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON public.sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_inventory_history_product_id ON public.inventory_history(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_history_created_at ON public.inventory_history(created_at);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
