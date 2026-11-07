export interface DivoomProduct {
  id: string;
  item_group_id: string;
  title: string;
  description: string | null;
  rich_text_description: string | null;
  availability: string | null;
  condition: string | null;
  price: number;
  sale_price: number | null;
  link: string | null;
  image_link: string | null;
  additional_image_link: string[];
  brand: string | null;
  google_product_category: string | null;
  product_type: string | null;
  color: string | null;
  size: string | null;
  material: string | null;
  pattern: string | null;
  gender: string | null;
  age_group: string | null;
  additional_variant_attribute: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductGroup {
  item_group_id: string;
  title: string;
  brand: string | null;
  product_type: string | null;
  google_product_category: string | null;
  minPrice: number;
  maxPrice: number;
  representativeRecord: DivoomProduct;
  variants: DivoomProduct[];
  colors: string[];
  sizes: string[];
}

export interface CartItem {
  product: DivoomProduct;
  quantity: number;
}

export interface PendingPayment {
  merchantOrderId: string;
  reference: string;
  email: string;
  environment?: string;
}

export interface OrderStatusData {
  merchantOrderId: string;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  paidAt?: string | null;
}
