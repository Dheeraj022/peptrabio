export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string;
  sort_order: number;
  is_primary?: boolean;
};

export type ProductDocument = {
  id: string;
  product_id: string;
  title: string;
  document_type: 'COA' | 'SDS' | 'Specification Sheet' | 'Research Reference' | 'Other';
  file_url: string;
  batch_number?: string;
  test_date?: string;
  is_public: boolean;
};

export type ProductReference = {
  id: string;
  product_id: string;
  title: string;
  authors?: string;
  publication?: string;
  year?: number;
  url?: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  category_id?: string;
  category?: string;
  product_code?: string;
  cas_number?: string;
  sequence?: string;
  molecular_formula?: string;
  molecular_weight?: number | string;
  purity?: string;
  size?: string;
  format?: string;
  price: number;
  compare_at_price?: number;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  showcase_order?: number;
  research_use_only: boolean;
  storage_information?: string;
  created_at?: string;
  updated_at?: string;
  // Nested relations
  images?: ProductImage[];
  documents?: ProductDocument[];
  references?: ProductReference[];
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export type PaymentMethod = 'partial_cod' | 'full_online';
export type PaymentType = 'partial' | 'full';
export type PaymentStatus = 'unpaid' | 'awaiting_verification' | 'verified' | 'rejected' | 'refunded';

export type Address = {
  first_name: string;
  last_name: string;
  company?: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

export type Order = {
  id: string;
  order_number: string;
  user_id?: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  payment_type?: PaymentType;
  advance_percentage?: number;
  advance_amount?: number;
  remaining_cod_amount?: number;
  utr_number?: string;
  screenshot_url?: string;
  payment_submitted_at?: string;
  payment_verified_at?: string;
  payment_verified_by?: string;
  payment_rejection_reason?: string;
  payment_notes?: string;
  currency?: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  shipping_address: Address;
  billing_address: Address;
  compliance_acknowledged: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  product_code?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url?: string;
};

export type AdminUser = {
  id: string;
  email: string;
  role: 'admin' | 'editor';
  created_at?: string;
};

export type AdminAuditLog = {
  id: string;
  admin_id?: string;
  admin_email?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
};
