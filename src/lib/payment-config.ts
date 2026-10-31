/**
 * Payment Configuration & UPI Utilities
 * Configurable UPI ID, Merchant Name, Advance Payment Percentage, and WhatsApp Support
 */

export interface PaymentConfig {
  upiId: string;
  upiMerchantName: string;
  advancePercentage: number;
  whatsappSupportNumber: string;
  currency: string;
}

/**
 * Returns payment config resolved from environment variables with safe defaults.
 * Server environment variables take precedence, falling back to public NEXT_PUBLIC_* variables.
 */
export function getPaymentConfig(): PaymentConfig {
  const upiId =
    process.env.UPI_ID ||
    process.env.NEXT_PUBLIC_UPI_ID ||
    'peptrabio@icici';

  const upiMerchantName =
    process.env.UPI_MERCHANT_NAME ||
    process.env.NEXT_PUBLIC_UPI_MERCHANT_NAME ||
    'Peptra Bio Labs';

  const advancePctRaw =
    process.env.ADVANCE_PAYMENT_PERCENTAGE ||
    process.env.NEXT_PUBLIC_ADVANCE_PERCENTAGE ||
    '10';
  const parsedPct = parseFloat(advancePctRaw);
  const advancePercentage = isNaN(parsedPct) ? 10 : Math.max(1, Math.min(100, parsedPct));

  const whatsappSupportNumber =
    process.env.WHATSAPP_SUPPORT_NUMBER ||
    process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER ||
    '919876543210';

  const currency =
    process.env.NEXT_PUBLIC_PAYMENT_CURRENCY ||
    'INR';

  return {
    upiId,
    upiMerchantName,
    advancePercentage,
    whatsappSupportNumber,
    currency,
  };
}

/**
 * Calculates authoritative order payment breakdown using safe monetary rounding.
 * e.g., For total ₹8,999 with 10% advance:
 *   Advance: ₹900 (rounded)
 *   Remaining COD: ₹8,099 (8999 - 900)
 */
export function calculatePaymentBreakdown(totalAmount: number, advancePercentage = 10) {
  const safeTotal = Math.max(0, Math.round(Number(totalAmount) || 0));
  const safePct = Math.max(1, Math.min(100, Number(advancePercentage) || 10));

  // Round advance amount to the nearest whole rupee/unit
  const advanceAmount = Math.round((safeTotal * safePct) / 100);
  const remainingCodAmount = Math.max(0, safeTotal - advanceAmount);

  return {
    totalAmount: safeTotal,
    advancePercentage: safePct,
    advanceAmount,
    remainingCodAmount,
    fullAmount: safeTotal,
  };
}

/**
 * Generates a valid, properly URL-encoded UPI payment URI.
 * Format: upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...
 */
export function generateUpiUri({
  upiId,
  merchantName,
  amount,
  orderNumber,
  currency = 'INR',
  paymentType,
}: {
  upiId: string;
  merchantName: string;
  amount: number;
  orderNumber: string;
  currency?: string;
  paymentType?: 'partial' | 'full';
}): string {
  const cleanUpi = (upiId || '').trim();
  const cleanName = (merchantName || '').trim();
  const safeAmount = Math.max(0, Number(amount) || 0).toFixed(2);
  const notePrefix = paymentType === 'partial' ? 'Advance ' : '';
  const transactionNote = `${notePrefix}Requisition ${orderNumber || 'Order'}`.trim();

  // Parameters must be URI-encoded
  const params = new URLSearchParams({
    pa: cleanUpi,
    pn: cleanName,
    am: safeAmount,
    cu: currency.toUpperCase(),
    tn: transactionNote,
  });

  return `upi://pay?${params.toString()}`;
}

/**
 * Generates an official WhatsApp chat link with a pre-filled verification request.
 * https://wa.me/NUMBER?text=...
 */
export function generateWhatsAppPaymentLink({
  whatsappNumber,
  orderNumber,
  paymentType,
  amountPaid,
  amount,
  utr,
  utrNumber,
}: {
  whatsappNumber: string;
  orderNumber: string;
  paymentType: 'partial' | 'full';
  amountPaid?: number;
  amount?: number;
  utr?: string;
  utrNumber?: string;
}): string {
  // International format without plus sign or spaces
  const cleanNumber = (whatsappNumber || '').replace(/\D/g, '');
  const typeText = paymentType === 'partial' ? 'PARTIAL (10% Advance)' : 'COMPLETE (Full Online Payment)';
  const actualAmount = amountPaid !== undefined ? amountPaid : (amount || 0);
  const formattedAmount = Number(actualAmount || 0).toLocaleString('en-IN');
  const actualUtr = utr || utrNumber;

  let text = `Hello, I have completed my UPI payment.\n\n` +
    `• Order ID: ${orderNumber}\n` +
    `• Payment Type: ${typeText}\n` +
    `• Amount Paid: ₹${formattedAmount}`;

  if (actualUtr && actualUtr.trim()) {
    text += `\n• UPI Ref / UTR: ${actualUtr.trim()}`;
  }

  text += `\n\nPlease verify my payment. (I am attaching my payment confirmation screenshot below)`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}

/**
 * Returns user-friendly status badge configuration for payment status.
 */
export function getPaymentStatusBadge(status: string) {
  switch (status) {
    case 'verified':
      return {
        label: 'Payment Received',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
        badgeColor: '#16a34a',
      };
    case 'awaiting_verification':
      return {
        label: 'Payment in Processing',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500 animate-pulse',
        badgeColor: '#d97706',
      };
    case 'rejected':
      return {
        label: 'Payment Rejected',
        bg: 'bg-red-50 text-red-700 border-red-200',
        text: 'text-red-700',
        border: 'border-red-200',
        dot: 'bg-red-500',
        badgeColor: '#dc2626',
      };
    case 'refunded':
      return {
        label: 'Refunded',
        bg: 'bg-gray-100 text-gray-700 border-gray-200',
        text: 'text-gray-700',
        border: 'border-gray-200',
        dot: 'bg-gray-400',
        badgeColor: '#6b7280',
      };
    case 'unpaid':
    default:
      return {
        label: 'Payment Pending',
        bg: 'bg-purple-50 text-purple-700 border-purple-200',
        text: 'text-purple-700',
        border: 'border-purple-200',
        dot: 'bg-purple-500',
        badgeColor: '#7c3aed',
      };
  }
}
