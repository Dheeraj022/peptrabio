import { Product, ProductCategory, Order, OrderStatus, AdminAuditLog } from '@/types';
import { SEED_PRODUCTS, SEED_CATEGORIES } from './seed-data';
import { createClient } from './supabase/client';

const PRODUCTS_STORAGE_KEY = 'peptrabio_products_v9';
const CATEGORIES_STORAGE_KEY = 'peptrabio_categories_v6';
const ORDERS_STORAGE_KEY = 'peptrabio_orders_v6';
const AUDIT_LOGS_STORAGE_KEY = 'peptrabio_audit_logs_v6';

// Seed Initial Orders
export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    order_number: 'PB-ORD-9821',
    status: 'processing',
    payment_status: 'verified',
    payment_method: 'partial_cod',
    payment_type: 'partial',
    advance_percentage: 10,
    advance_amount: 13.60,
    remaining_cod_amount: 122.40,
    utr_number: 'UTR491029482019',
    payment_submitted_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    payment_verified_at: new Date(Date.now() - 86400000).toISOString(),
    payment_verified_by: 'admin@peptrabio.com',
    currency: 'INR',
    subtotal: 136.00,
    shipping: 0.00,
    tax: 0.00,
    total: 136.00,
    customer_email: 'lab.researcher@biotech-institute.edu',
    customer_name: 'Dr. Sarah Mitchell',
    customer_phone: '+1 (555) 234-5678',
    shipping_address: {
      first_name: 'Sarah',
      last_name: 'Mitchell',
      company: 'Cellular Dynamics Lab',
      street: '450 Technology Parkway, Suite 300',
      city: 'Cambridge',
      state: 'MA',
      postal_code: '02139',
      country: 'United States',
    },
    billing_address: {
      first_name: 'Sarah',
      last_name: 'Mitchell',
      company: 'Cellular Dynamics Lab',
      street: '450 Technology Parkway, Suite 300',
      city: 'Cambridge',
      state: 'MA',
      postal_code: '02139',
      country: 'United States',
    },
    compliance_acknowledged: true,
    notes: 'For in vitro receptor binding assays only.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    items: [
      {
        id: 'item-1',
        order_id: 'ord-1001',
        product_id: 'prod-selank-5mg',
        product_name: 'Selank (5mg)',
        product_code: 'PB-SLK-005',
        quantity: 2,
        unit_price: 68.00,
        total_price: 136.00,
      }
    ]
  },
  {
    id: 'ord-1002',
    order_number: 'PB-ORD-9822',
    status: 'pending',
    payment_status: 'awaiting_verification',
    payment_method: 'full_online',
    payment_type: 'full',
    advance_percentage: 100,
    advance_amount: 150.00,
    remaining_cod_amount: 0.00,
    utr_number: 'UTR882910482012',
    payment_submitted_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    currency: 'INR',
    subtotal: 150.00,
    shipping: 0.00,
    tax: 0.00,
    total: 150.00,
    customer_email: 'q.vance@stanford-bio.org',
    customer_name: 'Dr. Quentin Vance',
    customer_phone: '+1 (555) 890-1234',
    shipping_address: {
      first_name: 'Quentin',
      last_name: 'Vance',
      company: 'Molecular Bio Core',
      street: '290 Campus Drive, Clark Center',
      city: 'Stanford',
      state: 'CA',
      postal_code: '94305',
      country: 'United States',
    },
    billing_address: {
      first_name: 'Quentin',
      last_name: 'Vance',
      company: 'Molecular Bio Core',
      street: '290 Campus Drive, Clark Center',
      city: 'Stanford',
      state: 'CA',
      postal_code: '94305',
      country: 'United States',
    },
    compliance_acknowledged: true,
    notes: 'Please include signed Batch COA document.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: 'item-2',
        order_id: 'ord-1002',
        product_id: 'prod-bpc-157',
        product_name: 'BPC-157 (5mg)',
        product_code: 'PB-BPC-005',
        quantity: 1,
        unit_price: 62.00,
        total_price: 62.00,
      },
      {
        id: 'item-3',
        order_id: 'ord-1002',
        product_id: 'prod-tb-500-5mg',
        product_name: 'TB-500 (10mg)',
        product_code: 'PB-TB4-010',
        quantity: 1,
        unit_price: 88.00,
        total_price: 88.00,
      }
    ]
  }
];

// Helper to check if browser
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getLocalProducts(): Product[] {
  if (!isBrowser()) return SEED_PRODUCTS;
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(SEED_PRODUCTS));
      return SEED_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_PRODUCTS;
  }
}

export function saveLocalProducts(products: Product[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (err) {
    console.error('Error saving products locally', err);
  }
}

export function getLocalCategories(): ProductCategory[] {
  if (!isBrowser()) return SEED_CATEGORIES;
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(SEED_CATEGORIES));
      return SEED_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_CATEGORIES;
  }
}

export function getLocalOrders(): Order[] {
  if (!isBrowser()) return INITIAL_ORDERS;
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ORDERS;
  }
}

export function saveLocalOrders(orders: Order[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Error saving orders locally', err);
  }
}

export function getLocalAuditLogs(): AdminAuditLog[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addAuditLog(action: string, entity_type: string, entity_id?: string, metadata?: Record<string, unknown>): void {
  if (!isBrowser()) return;
  try {
    const logs = getLocalAuditLogs();
    const newLog: AdminAuditLog = {
      id: 'log-' + Date.now(),
      admin_email: 'admin@peptrabio.com',
      action,
      entity_type,
      entity_id,
      metadata,
      created_at: new Date().toISOString()
    };
    logs.unshift(newLog);
    localStorage.setItem(AUDIT_LOGS_KEY(), JSON.stringify(logs.slice(0, 100)));
  } catch (e) {
    console.error(e);
  }
}

function AUDIT_LOGS_KEY() {
  return AUDIT_LOGS_STORAGE_KEY;
}

// Global accessor functions that seamlessly support Supabase or fallback
export async function fetchAllProducts(): Promise<Product[]> {
  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, images:product_images(*), documents:product_documents(*), references:product_references(*)')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as Product[];
      }
    } catch (e) {
      console.warn('Supabase fetch failed, fallback to local', e);
    }
  }
  return getLocalProducts();
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, images:product_images(*), documents:product_documents(*), references:product_references(*)')
        .eq('slug', slug)
        .single();
      if (!error && data) {
        return data as Product;
      }
    } catch {
      // fallback
    }
  }
  const products = getLocalProducts();
  return products.find(p => p.slug === slug) || null;
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, images:product_images(*), documents:product_documents(*), references:product_references(*)')
        .eq('id', id)
        .single();
      if (!error && data) {
        return data as Product;
      }
    } catch {
      // fallback
    }
  }
  const products = getLocalProducts();
  return products.find(p => p.id === id) || null;
}

export async function saveOrUpdateProduct(product: Partial<Product>): Promise<Product> {
  const products = getLocalProducts();
  let savedProduct: Product;

  if (product.id && products.some(p => p.id === product.id)) {
    // Update
    const index = products.findIndex(p => p.id === product.id);
    savedProduct = {
      ...products[index],
      ...product,
      updated_at: new Date().toISOString(),
    } as Product;
    products[index] = savedProduct;
    addAuditLog('product_updated', 'product', savedProduct.id, { name: savedProduct.name });
  } else {
    // Create
    savedProduct = {
      id: product.id || 'prod-' + Date.now(),
      name: product.name || 'New Peptide',
      slug: product.slug || ('prod-' + Date.now()),
      short_description: product.short_description || '',
      description: product.description || '',
      category: product.category || 'Neuropeptides',
      category_id: product.category_id || 'cat-1',
      product_code: product.product_code || 'PB-' + Math.floor(1000 + Math.random() * 9000),
      cas_number: product.cas_number || 'N/A',
      sequence: product.sequence || '',
      molecular_formula: product.molecular_formula || '',
      molecular_weight: product.molecular_weight || 0,
      purity: product.purity || '99%+',
      size: product.size || '5 mg',
      format: product.format || 'Lyophilized Solid / Sealed Vial',
      price: product.price || 50,
      compare_at_price: product.compare_at_price,
      stock_quantity: product.stock_quantity ?? 10,
      is_active: product.is_active ?? true,
      is_featured: product.is_featured ?? false,
      research_use_only: true,
      storage_information: product.storage_information || 'Store at -20°C.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: product.images && product.images.length > 0 ? product.images : [
        {
          id: 'img-' + Date.now(),
          product_id: product.id || 'prod-' + Date.now(),
          image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
          alt_text: product.name || 'Research Vial',
          sort_order: 0,
          is_primary: true,
        }
      ],
      documents: product.documents || [
        {
          id: 'doc-' + Date.now(),
          product_id: product.id || 'prod-' + Date.now(),
          title: `Certificate of Analysis (${product.product_code || 'BATCH-01'})`,
          document_type: 'COA',
          file_url: '#coa',
          batch_number: 'BATCH-2025',
          test_date: new Date().toISOString().split('T')[0],
          is_public: true,
        }
      ],
      references: product.references || [],
    };
    products.unshift(savedProduct);
    addAuditLog('product_created', 'product', savedProduct.id, { name: savedProduct.name });
  }

  saveLocalProducts(products);

  // If live Supabase client exists, attempt remote sync
  const supabase = createClient();
  if (supabase) {
    try {
      await supabase.from('products').upsert({
        id: savedProduct.id,
        name: savedProduct.name,
        slug: savedProduct.slug,
        short_description: savedProduct.short_description,
        description: savedProduct.description,
        category: savedProduct.category,
        category_id: savedProduct.category_id,
        product_code: savedProduct.product_code,
        cas_number: savedProduct.cas_number,
        sequence: savedProduct.sequence,
        molecular_formula: savedProduct.molecular_formula,
        molecular_weight: savedProduct.molecular_weight,
        purity: savedProduct.purity,
        size: savedProduct.size,
        format: savedProduct.format,
        price: savedProduct.price,
        compare_at_price: savedProduct.compare_at_price,
        stock_quantity: savedProduct.stock_quantity,
        is_active: savedProduct.is_active,
        is_featured: savedProduct.is_featured,
        research_use_only: savedProduct.research_use_only,
        storage_information: savedProduct.storage_information,
      });
    } catch {
      // Remote sync fallback handled
    }
  }

  return savedProduct;
}

export async function deleteProductById(id: string): Promise<boolean> {
  const products = getLocalProducts();
  const target = products.find(p => p.id === id);
  const filtered = products.filter(p => p.id !== id);
  saveLocalProducts(filtered);

  if (target) {
    addAuditLog('product_deleted', 'product', id, { name: target.name });
  }

  const supabase = createClient();
  if (supabase) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch {
      // ignore
    }
  }
  return true;
}

export async function toggleProductActive(id: string): Promise<Product | null> {
  const products = getLocalProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;

  products[index].is_active = !products[index].is_active;
  products[index].updated_at = new Date().toISOString();
  saveLocalProducts(products);

  addAuditLog(
    products[index].is_active ? 'product_activated' : 'product_deactivated',
    'product',
    id,
    { name: products[index].name, is_active: products[index].is_active }
  );

  return products[index];
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function createNewOrder(orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'> & { order_number?: string }): Promise<Order> {
  const orders = getLocalOrders();
  const orderId = generateUUID();

  // Ensure all items have valid UUIDs
  const itemsWithUuid = orderData.items ? orderData.items.map(item => ({
    ...item,
    id: generateUUID(),
    order_id: orderId,
  })) : [];

  const newOrder: Order = {
    ...orderData,
    id: orderId,
    order_number: orderData.order_number || ('PB-ORD-' + Math.floor(10000 + Math.random() * 90000)),
    payment_status: orderData.payment_status || 'unpaid',
    payment_method: orderData.payment_method || 'partial_cod',
    payment_type: orderData.payment_type || 'partial',
    advance_percentage: orderData.advance_percentage ?? 10,
    advance_amount: orderData.advance_amount ?? 0,
    remaining_cod_amount: orderData.remaining_cod_amount ?? 0,
    utr_number: orderData.utr_number || undefined,
    screenshot_url: orderData.screenshot_url || undefined,
    currency: orderData.currency || 'INR',
    items: itemsWithUuid,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  orders.unshift(newOrder);
  saveLocalOrders(orders);

  // Decrement inventory in local store
  const products = getLocalProducts();
  if (newOrder.items) {
    newOrder.items.forEach(item => {
      const prod = products.find(p => p.id === item.product_id || p.name === item.product_name);
      if (prod) {
        prod.stock_quantity = Math.max(0, prod.stock_quantity - item.quantity);
      }
    });
    saveLocalProducts(products);
  }

  addAuditLog('order_created', 'order', newOrder.id, {
    order_number: newOrder.order_number,
    total: newOrder.total,
    customer: newOrder.customer_email,
    payment_status: newOrder.payment_status,
  });

  // Push order to Supabase database via server endpoint
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn('Failed to insert order into Supabase API:', errData);
    } else {
      const resJson = await res.json();
      if (resJson.order) {
        return resJson.order as Order;
      }
    }
  } catch (err) {
    console.warn('Order Supabase API sync failed, relying on local store fallback:', err);
  }

  return newOrder;
}

export async function confirmOrderPaymentInStore({
  orderId,
  orderNumber,
  paymentType,
  utrNumber,
  screenshotUrl,
  notes,
}: {
  orderId?: string;
  orderNumber?: string;
  paymentType: 'partial' | 'full';
  utrNumber: string;
  screenshotUrl?: string;
  notes?: string;
}): Promise<Order | null> {
  const orders = getLocalOrders();
  const index = orders.findIndex(o => (orderId && o.id === orderId) || (orderNumber && o.order_number === orderNumber));
  const now = new Date().toISOString();

  if (index !== -1) {
    orders[index].payment_status = 'awaiting_verification';
    orders[index].payment_type = paymentType;
    orders[index].payment_method = paymentType === 'partial' ? 'partial_cod' : 'full_online';
    orders[index].utr_number = utrNumber.trim();
    if (screenshotUrl) orders[index].screenshot_url = screenshotUrl;
    if (notes) orders[index].payment_notes = notes;
    orders[index].payment_submitted_at = now;
    orders[index].updated_at = now;
    saveLocalOrders(orders);

    addAuditLog('payment_submitted', 'order_payment', orders[index].id, {
      order_number: orders[index].order_number,
      utr: utrNumber,
      payment_type: paymentType,
    });
  }

  // Trigger server sync
  try {
    const res = await fetch('/api/payment/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        orderNumber,
        paymentType,
        utrNumber,
        screenshotUrl,
        notes,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.order) return data.order as Order;
    }
  } catch (e) {
    console.warn('Payment confirm API sync failed, local store updated:', e);
  }

  return index !== -1 ? orders[index] : null;
}

export async function verifyOrderPaymentInStore({
  orderId,
  action,
  adminEmail = 'admin@peptrabio.com',
  verificationNotes,
  rejectionReason,
}: {
  orderId: string;
  action: 'verify' | 'reject';
  adminEmail?: string;
  verificationNotes?: string;
  rejectionReason?: string;
}): Promise<Order | null> {
  const orders = getLocalOrders();
  const index = orders.findIndex(o => o.id === orderId);
  const now = new Date().toISOString();
  const isVerified = action === 'verify';

  if (index !== -1) {
    orders[index].payment_status = isVerified ? 'verified' : 'rejected';
    orders[index].payment_verified_at = now;
    orders[index].payment_verified_by = adminEmail;
    orders[index].updated_at = now;
    if (isVerified) {
      orders[index].status = 'processing';
      if (verificationNotes) orders[index].payment_notes = verificationNotes;
    } else {
      orders[index].payment_rejection_reason = rejectionReason || 'Payment rejected.';
      if (verificationNotes) orders[index].payment_notes = verificationNotes;
    }
    saveLocalOrders(orders);

    addAuditLog(isVerified ? 'payment_verified' : 'payment_rejected', 'order_payment', orderId, {
      order_number: orders[index].order_number,
      notes: verificationNotes,
      reason: rejectionReason,
    });
  }

  // Trigger server sync
  try {
    const res = await fetch('/api/admin/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        action,
        adminEmail,
        verificationNotes,
        rejectionReason,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.order) return data.order as Order;
    }
  } catch (e) {
    console.warn('Admin payment verify API sync failed, local store updated:', e);
  }

  return index !== -1 ? orders[index] : null;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
  const orders = getLocalOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index === -1) return null;

  orders[index].status = status;
  orders[index].updated_at = new Date().toISOString();
  saveLocalOrders(orders);

  addAuditLog('order_status_updated', 'order', orderId, {
    order_number: orders[index].order_number,
    status
  });

  const supabase = createClient();
  if (supabase) {
    try {
      await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
    } catch (e) {
      console.warn('Failed to update order status in Supabase', e);
    }
  }

  return orders[index];
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  const orders = getLocalOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return false;

  const targetOrder = orders[index];
  const updatedOrders = orders.filter((o) => o.id !== orderId);
  saveLocalOrders(updatedOrders);

  addAuditLog('order_deleted', 'order', orderId, {
    order_number: targetOrder.order_number,
    customer_email: targetOrder.customer_email,
    customer_name: targetOrder.customer_name,
    total: targetOrder.total,
  });

  const supabase = createClient();
  if (supabase) {
    try {
      await supabase.from('order_items').delete().eq('order_id', orderId);
      await supabase.from('orders').delete().eq('id', orderId);
    } catch (e) {
      console.warn('Failed to delete order from Supabase:', e);
    }
  }

  try {
    await fetch(`/api/orders?id=${encodeURIComponent(orderId)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    // API endpoint might be offline or client fallback
  }

  return true;
}

export const deleteOrderFromStore = deleteOrder;

export function fetchCustomerOrders(customerEmail?: string, userId?: string): Order[] {
  const all = getLocalOrders();
  if (!customerEmail && !userId) return [];
  const normalizedEmail = customerEmail ? customerEmail.trim().toLowerCase() : '';
  return all.filter((o) => {
    const matchesEmail = normalizedEmail && o.customer_email && o.customer_email.trim().toLowerCase() === normalizedEmail;
    const matchesUser = userId && o.user_id && o.user_id === userId;
    return Boolean(matchesEmail || matchesUser);
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function fetchCustomerOrdersAsync(customerEmail?: string, userId?: string): Promise<Order[]> {
  try {
    let url = '/api/orders?';
    if (customerEmail) url += `email=${encodeURIComponent(customerEmail)}&`;
    if (userId) url += `userId=${encodeURIComponent(userId)}&`;

    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      if (json.orders && Array.isArray(json.orders) && json.orders.length > 0) {
        return json.orders as Order[];
      }
    }
  } catch (err) {
    console.warn('Failed to fetch orders from API:', err);
  }
  return fetchCustomerOrders(customerEmail, userId);
}

