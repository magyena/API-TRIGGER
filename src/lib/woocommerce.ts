import crypto from 'crypto';

export interface WooOrderPayload {
  id: number | string;
  number: string;
  status: string; // processing, completed, cancelled, refunded
  currency: string;
  total: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    city: string;
    state: string;
  };
  line_items: Array<{
    id: number;
    name: string;
    product_id: number;
    quantity: number;
    total: string;
  }>;
  meta_data: Array<{
    key: string;
    value: string | number;
  }>;
}

export function verifyWooCommerceSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader || !secret) return true; // If secret not set, bypass
  const calculatedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64');
  return calculatedSignature === signatureHeader;
}

export function extractTrackingFromWooOrder(order: WooOrderPayload) {
  let fbclid: string | null = null;
  let ctwaClid: string | null = null;
  let visitorId: string | null = null;

  if (order.meta_data) {
    for (const item of order.meta_data) {
      if (item.key === 'fbclid' || item.key === '_fbclid') fbclid = String(item.value);
      if (item.key === 'ctwa_clid' || item.key === '_ctwa_clid') ctwaClid = String(item.value);
      if (item.key === 'visitor_id' || item.key === '_visitor_id') visitorId = String(item.value);
    }
  }

  const productName = order.line_items?.map(item => item.name).join(', ') || 'WooCommerce Order';
  const totalAmount = parseFloat(order.total || '0');

  return {
    wooOrderId: String(order.id),
    status: order.status,
    currency: order.currency || 'IDR',
    amount: totalAmount,
    product: productName,
    quantity: order.line_items?.reduce((acc, curr) => acc + curr.quantity, 0) || 1,
    customerEmail: order.billing?.email || '',
    customerPhone: order.billing?.phone || '',
    fbclid,
    ctwaClid,
    visitorId,
  };
}
