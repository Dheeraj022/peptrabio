/**
 * Automated test script for Peptrabio Payment Checkout System
 * Verifies calculation accuracy, rounding, UPI URI encoding, WhatsApp links, and state badges.
 */

import {
  calculatePaymentBreakdown,
  generateUpiUri,
  generateWhatsAppPaymentLink,
  getPaymentStatusBadge,
} from '../src/lib/payment-config';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    testsFailed++;
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual === expected) {
    console.log(`  ✓ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message} (Expected: ${expected}, Got: ${actual})`);
    testsFailed++;
  }
}

console.log('\n--- 1. Testing Payment Breakdown & Rounding ---');
// Test the prompt's explicit example: ₹8,999 at 10%
const ex1 = calculatePaymentBreakdown(8999, 10);
assertEqual(ex1.totalAmount, 8999, 'Total amount should be ₹8,999');
assertEqual(ex1.advanceAmount, 900, '10% of ₹8,999 should round to ₹900');
assertEqual(ex1.remainingCodAmount, 8099, 'Remaining COD should be ₹8,099');
assertEqual(ex1.advanceAmount + ex1.remainingCodAmount, ex1.totalAmount, 'Advance + COD must equal total');

// Test even round: ₹10,000 at 10%
const ex2 = calculatePaymentBreakdown(10000, 10);
assertEqual(ex2.advanceAmount, 1000, '10% of ₹10,000 should be ₹1,000');
assertEqual(ex2.remainingCodAmount, 9000, 'Remaining COD should be ₹9,000');

// Test ₹1,250 at 10%
const ex3 = calculatePaymentBreakdown(1250, 10);
assertEqual(ex3.advanceAmount, 125, '10% of ₹1,250 should be ₹125');
assertEqual(ex3.remainingCodAmount, 1125, 'Remaining COD should be ₹1,125');

// Test zero and small amounts
const exZero = calculatePaymentBreakdown(0, 10);
assertEqual(exZero.advanceAmount, 0, 'Advance for ₹0 should be 0');
assertEqual(exZero.remainingCodAmount, 0, 'COD for ₹0 should be 0');

// Comprehensive invariant test: For 1,000 arbitrary prices, advance + COD always equals total
let invariantHolds = true;
for (let p = 1; p <= 1000; p++) {
  const res = calculatePaymentBreakdown(p, 10);
  if (res.advanceAmount + res.remainingCodAmount !== p) {
    invariantHolds = false;
    break;
  }
}
assert(invariantHolds, 'Sum invariant holds for all integer amounts from ₹1 to ₹1,000');

// Test custom configurable percentage: 15% on ₹2,000
const exCustom = calculatePaymentBreakdown(2000, 15);
assertEqual(exCustom.advanceAmount, 300, '15% of ₹2,000 should be ₹300');
assertEqual(exCustom.remainingCodAmount, 1700, 'Remaining COD should be ₹1,700');

console.log('\n--- 2. Testing Dynamic UPI URI Generation ---');
const uri = generateUpiUri({
  upiId: 'peptrabio@icici',
  merchantName: 'Peptra Bio Labs',
  amount: 900,
  orderNumber: 'ORD-2026-9921',
  paymentType: 'partial',
});

assert(uri.startsWith('upi://pay?'), 'URI must start with upi://pay?');
assert(uri.includes('pa=peptrabio%40icici') || uri.includes('pa=peptrabio@icici'), 'URI must encode UPI ID');
assert(uri.includes('pn=Peptra%20Bio%20Labs') || uri.includes('pn=Peptra+Bio+Labs'), 'URI must encode merchant name');
assert(uri.includes('am=900.00'), 'URI must encode amount formatted to 2 decimals (900.00)');
assert(uri.includes('cu=INR'), 'Currency must be INR');
assert(uri.includes('tn='), 'Transaction note must be present and encoded');

// Complete payment URI
const fullUri = generateUpiUri({
  upiId: 'peptrabio@icici',
  merchantName: 'Peptra Bio Labs',
  amount: 8999,
  orderNumber: 'ORD-2026-9921',
  paymentType: 'full',
});
assert(fullUri.includes('am=8999.00'), 'Full payment URI encodes full amount 8999.00');

console.log('\n--- 3. Testing WhatsApp Pre-filled Chat Link ---');
const waLink = generateWhatsAppPaymentLink({
  whatsappNumber: '+91 98765 43210',
  orderNumber: 'ORD-2026-9921',
  paymentType: 'partial',
  amount: 900,
  utrNumber: '502918239012',
});

assert(waLink.startsWith('https://wa.me/919876543210?text='), 'WhatsApp link must sanitize phone to international digits without + or spaces');
const decodedWaText = decodeURIComponent(waLink.split('text=')[1]);
assert(decodedWaText.includes('ORD-2026-9921'), 'WhatsApp message contains order number');
assert(decodedWaText.includes('PARTIAL (10% Advance)'), 'WhatsApp message contains partial payment type');
assert(decodedWaText.includes('₹900'), 'WhatsApp message contains paid amount');
assert(decodedWaText.includes('502918239012'), 'WhatsApp message contains UTR number');
assert(decodedWaText.includes('attaching') && decodedWaText.includes('screenshot'), 'WhatsApp message reminds user to attach screenshot');

console.log('\n--- 4. Testing Payment Status Badges ---');
const statuses = ['unpaid', 'awaiting_verification', 'verified', 'rejected', 'refunded'] as const;
for (const s of statuses) {
  const badge = getPaymentStatusBadge(s);
  assert(Boolean(badge.label && badge.bg && badge.text), `Status badge for '${s}' has label, bg, and text`);
}
assertEqual(getPaymentStatusBadge('awaiting_verification').label, 'Awaiting Verification', 'Awaiting verification label check');
assertEqual(getPaymentStatusBadge('verified').label, 'Payment Verified', 'Verified label check');
assertEqual(getPaymentStatusBadge('rejected').label, 'Payment Rejected', 'Rejected label check');

console.log('\n----------------------------------------');
console.log(`Test Results: ${testsPassed} passed, ${testsFailed} failed`);
if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('All payment tests PASSED successfully!\n');
}
