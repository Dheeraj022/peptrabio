import { NextRequest, NextResponse } from 'next/server';
import { executeAtomicVerification } from '@/lib/verification-store';
import crypto from 'crypto';

// In-memory rate limiting map for basic protection against brute-force enumeration
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ipKey: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 20; // 20 verification requests per minute per IP

  const record = rateLimitMap.get(ipKey);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ipKey, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // 1. IP & User Agent extraction with privacy-conscious hashing
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Rate Limit Check
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          status: 'invalid',
          message: 'Too many verification attempts. Please wait a minute and try again.'
        },
        { status: 429 }
      );
    }

    // Hash IP for privacy compliance
    const ipHash = crypto.createHash('sha256').update(ip + 'peptrabio_salt_2025').digest('hex').substring(0, 16);

    // 2. Parse and Validate Body
    const body = await req.json().catch(() => ({}));
    const rawCode = body.code;

    if (!rawCode || typeof rawCode !== 'string') {
      return NextResponse.json(
        {
          status: 'invalid',
          message: 'Please provide a valid verification code.'
        },
        { status: 400 }
      );
    }

    // 3. Normalize Code
    const normalizedCode = rawCode.trim().toUpperCase();

    // 4. Execute Server-Side Atomic Verification
    const result = await executeAtomicVerification(normalizedCode, ipHash, userAgent);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('API Verification error:', error);
    return NextResponse.json(
      {
        status: 'invalid',
        message: 'An unexpected error occurred during product verification. Please try again.'
      },
      { status: 500 }
    );
  }
}
