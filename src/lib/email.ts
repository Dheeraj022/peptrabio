import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

/**
 * Returns a configured nodemailer transporter.
 * Supports SMTP_* environment variables (Hostinger, Google Workspace, AWS SES, SendGrid, Resend SMTP, etc.)
 */
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Send an email using standard SMTP.
 * Falls back gracefully with detailed server logs if SMTP is not configured yet.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = process.env.SMTP_FROM || 'Peptra Bio Labs <info@peptrabio.com>',
}: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = getTransporter();

    if (!transporter) {
      console.warn(
        `[Email Notification Mock/Notice] SMTP not fully configured in environment variables (SMTP_HOST, SMTP_USER, SMTP_PASS). ` +
        `Target: "${to}", Subject: "${subject}", From: "${from}".`
      );
      return {
        success: true,
        messageId: `simulated-${Date.now()}`,
      };
    }

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      html,
    });

    console.log(`[Email Sent] Successfully delivered to ${to} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[Email Failed] Failed to send email to ${to}:`, err);
    return { success: false, error: err.message || 'Failed to send email' };
  }
}

/**
 * Generates modern, branded HTML for Order Fulfillment Status changes.
 */
export function buildOrderStatusEmailHtml({
  customerName,
  orderNumber,
  newStatus,
  statusDescription,
  totalFormatted,
  trackingNumber,
  trackingCarrier,
}: {
  customerName: string;
  orderNumber: string;
  newStatus: string;
  statusDescription?: string;
  totalFormatted?: string;
  trackingNumber?: string;
  trackingCarrier?: string;
}): string {
  const statusUpper = newStatus.toUpperCase();

  let badgeColor = '#0284c7'; // default sky
  let badgeBg = '#f0f9ff';
  let badgeBorder = '#bae6fd';
  let headline = `Order ${orderNumber} Status Updated`;
  let defaultMessage = `Your order <strong>${orderNumber}</strong> has been updated to <strong>${statusUpper}</strong>.`;

  switch (newStatus.toLowerCase()) {
    case 'paid':
      badgeColor = '#059669';
      badgeBg = '#ecfdf5';
      badgeBorder = '#a7f3d0';
      headline = 'Payment Confirmed - Order Verified';
      defaultMessage = `We have confirmed your payment for requisition <strong>${orderNumber}</strong>. Our laboratory dispatch team has queued your batch for fulfillment.`;
      break;
    case 'processing':
      badgeColor = '#7c3aed';
      badgeBg = '#f5f3ff';
      badgeBorder = '#ddd6fe';
      headline = 'Batch Requisition Processing';
      defaultMessage = `Your research requisition <strong>${orderNumber}</strong> is currently being prepared and quality-inspected in accordance with our scientific handling standards.`;
      break;
    case 'shipped':
      badgeColor = '#2563eb';
      badgeBg = '#eff6ff';
      badgeBorder = '#bfdbfe';
      headline = 'Your Order Has Shipped';
      defaultMessage = `Your order <strong>${orderNumber}</strong> has been carefully packed in temperature-controlled packaging and dispatched with cold-chain courier delivery.`;
      break;
    case 'delivered':
      badgeColor = '#16a34a';
      badgeBg = '#f0fdf4';
      badgeBorder = '#bbf7d0';
      headline = 'Package Delivered';
      defaultMessage = `Courier tracking reports that your package for <strong>${orderNumber}</strong> has been delivered to your laboratory destination. Please verify receipt and store all lyophilized peptides at -20°C upon opening.`;
      break;
    case 'cancelled':
      badgeColor = '#dc2626';
      badgeBg = '#fef2f2';
      badgeBorder = '#fecaca';
      headline = 'Order Cancelled';
      defaultMessage = `Your order <strong>${orderNumber}</strong> has been cancelled. If you believe this was an error or requires clarification, please reach out to our support desk immediately.`;
      break;
    case 'refunded':
      badgeColor = '#d97706';
      badgeBg = '#fffbeb';
      badgeBorder = '#fde68a';
      headline = 'Payment Refund Issued';
      defaultMessage = `A refund has been processed for order <strong>${orderNumber}</strong>. Please allow 3-7 business days for the funds to reflect in your original funding account.`;
      break;
  }

  const messageText = statusDescription || defaultMessage;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headline}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0d121c; padding: 30px 40px; text-align: left; border-bottom: 2px solid #8b5cf6;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="font-size: 22px; font-weight: 800; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">
                      PEPTRA<span style="color: #a78bfa;">BIO</span>
                    </div>
                    <div style="font-size: 11px; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px;">
                      High Purity Research Peptides & Biochemicals
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 40px;">
              <div style="font-size: 16px; color: #334155; margin-bottom: 8px;">
                Dear <strong>${customerName || 'Valued Researcher'}</strong>,
              </div>

              <div style="font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 20px;">
                ${headline}
              </div>

              <!-- Status Badge Box -->
              <div style="background-color: ${badgeBg}; border: 1px solid ${badgeBorder}; border-radius: 12px; padding: 18px 24px; margin-bottom: 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 600;">
                      Order Identifier:
                    </td>
                    <td align="right" style="font-size: 14px; font-weight: 700; color: #8b5cf6;">
                      ${orderNumber}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 600; padding-top: 10px;">
                      Fulfillment Status:
                    </td>
                    <td align="right" style="padding-top: 10px;">
                      <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background-color: ${badgeBg}; border: 1px solid ${badgeBorder}; color: ${badgeColor}; font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">
                        ${statusUpper}
                      </span>
                    </td>
                  </tr>
                  ${totalFormatted ? `
                  <tr>
                    <td style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 600; padding-top: 10px;">
                      Total Order Value:
                    </td>
                    <td align="right" style="font-size: 14px; font-weight: 700; color: #0f172a; padding-top: 10px;">
                      ${totalFormatted}
                    </td>
                  </tr>` : ''}
                </table>
              </div>

              <!-- Main message text -->
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
                ${messageText}
              </p>

              ${trackingNumber ? `
              <!-- Tracking Information -->
              <div style="background-color: #f1f5f9; border-radius: 10px; padding: 16px; margin-bottom: 24px; text-align: left;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700;">
                  Courier Consignment & Tracking:
                </div>
                <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 4px;">
                  ${trackingCarrier ? trackingCarrier + ' - ' : ''}${trackingNumber}
                </div>
              </div>` : ''}

              <!-- Important Laboratory Notice -->
              <div style="border-left: 3px solid #8b5cf6; padding-left: 14px; margin-top: 24px; margin-bottom: 24px;">
                <p style="font-size: 12px; line-height: 1.5; color: #64748b; margin: 0;">
                  <strong>Compliance Note:</strong> All products supplied by Peptra Bio are strictly synthesized and verified for laboratory in-vitro research purposes only.
                </p>
              </div>

              <!-- Contact / Support info -->
              <p style="font-size: 13px; line-height: 1.5; color: #475569; margin: 24px 0 0 0;">
                If you have questions regarding your requisition, simply reply to this email directly or contact our desk at <a href="mailto:info@peptrabio.com" style="color: #8b5cf6; text-decoration: none; font-weight: 600;">info@peptrabio.com</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #faf5ff; padding: 24px 40px; text-align: center; border-top: 1px solid #f3e8ff;">
              <p style="font-size: 12px; color: #6b7280; margin: 0 0 6px 0;">
                Sent from Peptra Bio Order Dispatch & Fulfillment Team
              </p>
              <p style="font-size: 11px; color: #9ca3af; margin: 0;">
                Official Administrator Inquiries: <a href="mailto:info@peptrabio.com" style="color: #8b5cf6; text-decoration: none;">info@peptrabio.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
