// Public Edge Function endpoints only. No Supabase API key is exposed in the browser.
export const EDGE_FUNCTIONS_BASE_URL =
  "https://mvwflakurihhakdrlteg.supabase.co/functions/v1";

export const EDGE_FUNCTIONS = {
  products: `${EDGE_FUNCTIONS_BASE_URL}/get-divoom-products`,
  duitkuCheckout: `${EDGE_FUNCTIONS_BASE_URL}/divoom-duitku-create-invoice`,
} as const;
