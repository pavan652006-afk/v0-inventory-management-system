-- Cleanup all data and reset sequences
-- This script removes all user data and resets the database to a clean state

-- Delete all sales records
DELETE FROM public.sales;

-- Delete all inventory history
DELETE FROM public.inventory_history;

-- Delete all products
DELETE FROM public.products;

-- Delete all profiles (but keep auth users)
DELETE FROM public.profiles WHERE id IN (SELECT id FROM auth.users);

-- Delete all auth users
DELETE FROM auth.users;

-- Reset any sequences if needed
ALTER SEQUENCE IF EXISTS public.sales_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.products_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.inventory_history_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.profiles_id_seq RESTART WITH 1;

-- Verify deletions
SELECT 'Users deleted' as status, COUNT(*) FROM auth.users;
SELECT 'Profiles deleted' as status, COUNT(*) FROM public.profiles;
SELECT 'Products deleted' as status, COUNT(*) FROM public.products;
SELECT 'Sales deleted' as status, COUNT(*) FROM public.sales;
SELECT 'Inventory history deleted' as status, COUNT(*) FROM public.inventory_history;
