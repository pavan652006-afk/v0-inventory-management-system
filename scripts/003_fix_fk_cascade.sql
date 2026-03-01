-- Fix foreign key constraint to use CASCADE DELETE
-- This allows deleting products even if they have sales records

-- Drop the existing foreign key constraint
ALTER TABLE public.sales
DROP CONSTRAINT sales_product_id_fkey;

-- Re-create the foreign key with CASCADE DELETE
ALTER TABLE public.sales
ADD CONSTRAINT sales_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES public.products(id)
ON DELETE CASCADE;

-- Also fix inventory_history foreign key if it exists
ALTER TABLE public.inventory_history
DROP CONSTRAINT IF EXISTS inventory_history_product_id_fkey;

ALTER TABLE public.inventory_history
ADD CONSTRAINT inventory_history_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES public.products(id)
ON DELETE CASCADE;
