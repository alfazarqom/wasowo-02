-- Preserve existing address fields and add structured Indonesian administrative address data.
-- Existing orders remain valid because all newly added columns are nullable.
ALTER TABLE public.divoom_orders
  ADD COLUMN IF NOT EXISTS shipping_province_id text,
  ADD COLUMN IF NOT EXISTS shipping_province text,
  ADD COLUMN IF NOT EXISTS shipping_regency_id text,
  ADD COLUMN IF NOT EXISTS shipping_regency text,
  ADD COLUMN IF NOT EXISTS shipping_district_id text,
  ADD COLUMN IF NOT EXISTS shipping_district text,
  ADD COLUMN IF NOT EXISTS shipping_village_id text,
  ADD COLUMN IF NOT EXISTS shipping_village text,
  ADD COLUMN IF NOT EXISTS shipping_postal_code text,
  ADD COLUMN IF NOT EXISTS shipping_delivery_notes text;

COMMENT ON COLUMN public.divoom_orders.shipping_province_id IS 'Emsifa administrative province identifier';
COMMENT ON COLUMN public.divoom_orders.shipping_regency_id IS 'Emsifa administrative regency/city identifier';
COMMENT ON COLUMN public.divoom_orders.shipping_district_id IS 'Emsifa administrative district identifier';
COMMENT ON COLUMN public.divoom_orders.shipping_village_id IS 'Emsifa administrative village identifier';
COMMENT ON COLUMN public.divoom_orders.shipping_postal_code IS 'Postal code entered and confirmed by customer; not auto-populated from an unverified dataset';
