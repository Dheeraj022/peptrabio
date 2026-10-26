import { NextResponse } from 'next/server';
import { getPaymentConfig } from '@/lib/payment-config';

// Force dynamic so config changes immediately reflect without rebuild
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = getPaymentConfig();
    return NextResponse.json({
      success: true,
      config: {
        upiId: config.upiId,
        upiMerchantName: config.upiMerchantName,
        advancePercentage: config.advancePercentage,
        whatsappSupportNumber: config.whatsappSupportNumber,
        currency: config.currency,
      },
    });
  } catch (err: any) {
    console.error('Failed to get payment config:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve payment configuration' },
      { status: 500 }
    );
  }
}
