import { NextRequest, NextResponse } from 'next/server';
import { generateReceiptPDF } from '@/lib/pdf';
import { sendEmailViaBrevo } from '@/lib/email';
import { ReceiptGenerationRequest, ReceiptGenerationResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: ReceiptGenerationRequest = await request.json();
    
    if (!body.job || !body.job.title || !body.job.customerName || !body.job.customerEmail) {
      return NextResponse.json({ error: 'Invalid job data' }, { status: 400 });
    }
    
    if (!body.extraCharges || body.extraCharges.length === 0) {
      return NextResponse.json({ error: 'No extra charges' }, { status: 400 });
    }

    const companyInfo = {
      name: process.env.APP_COMPANY_NAME || 'Roof King Roofing & Solar',
      email: process.env.APP_COMPANY_EMAIL || 'office@sandiegoroofking.com',
      phone: process.env.APP_COMPANY_PHONE || '(760) 941-5464',
      address: process.env.APP_COMPANY_ADDRESS || 'San Diego, CA',
    };

    const pdfBytes = await generateReceiptPDF(body.job, body.extraCharges, companyInfo);
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

    const subtotal = body.extraCharges.reduce((sum, c) => sum + c.amount, 0);
    const totalTax = body.extraCharges.reduce((sum, c) => sum + (c.taxAmount || 0), 0);
    const total = subtotal + totalTax;

    const htmlContent = `<html><body>
      <p>Hi ${body.job.customerName},</p>
      <p>Attached is the receipt for additional work on "${body.job.title}".</p>
      <p><strong>Total: $${total.toFixed(2)}</strong></p>
      <p>Contact us at ${companyInfo.email} or ${companyInfo.phone}.</p>
      </body></html>`;

    let emailSent = false;
    let emailError: string | undefined;

    const brevoApiKey = process.env.BREVO_API_KEY;
    if (brevoApiKey) {
      const emailResult = await sendEmailViaBrevo(brevoApiKey, {
        sender: {
          name: process.env.APP_FROM_NAME || 'Paradime Productions',
          email: process.env.APP_FROM_EMAIL || 'sharthok.pal@gmail.com',
        },
        to: [{ email: body.customerEmail, name: body.job.customerName }],
        cc: [{ email: body.officeEmail, name: companyInfo.name }],
        subject: `Extra Work Receipt – ${body.job.title}`,
        htmlContent,
        attachments: [{
          name: `Receipt_${body.job.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          content: pdfBase64,
          type: 'application/pdf',
        }],
      });
      emailSent = emailResult.success;
      emailError = emailResult.error;
    }

    const response: ReceiptGenerationResponse = { emailSent, pdfBase64, error: emailError };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Send receipt error:', error);
    return NextResponse.json({ error: 'Failed to generate receipt' }, { status: 500 });
  }
}
