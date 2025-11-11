import { NextRequest, NextResponse } from 'next/server';
import { createAirtableService } from '@/lib/airtable';
import { createGoogleCalendarService } from '@/lib/googleCalendar';
import { sendEmailViaBrevo } from '@/lib/email';
import { Job, ExtraCharge } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AutomationRequest {
  action: 'job_created' | 'job_updated' | 'invoice_generated';
  job: Job;
  extraCharges?: ExtraCharge[];
  scheduledDate?: string; // ISO 8601 date string
  sendConfirmationEmail?: boolean;
}

interface AutomationResponse {
  success: boolean;
  airtableCustomerId?: string;
  airtableJobId?: string;
  calendarEventId?: string;
  emailSent?: boolean;
  errors?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: AutomationRequest = await request.json();
    const { action, job, extraCharges, scheduledDate, sendConfirmationEmail } = body;

    console.log(`[Automation] Processing action: ${action} for job: ${job.id}`);

    const automationEnabled = process.env.AUTOMATION_ENABLED === 'true';
    if (!automationEnabled) {
      return NextResponse.json(
        { success: false, errors: ['Automation is disabled'] },
        { status: 200 }
      );
    }

    const errors: string[] = [];
    const response: AutomationResponse = { success: true };

    // Initialize services
    const airtable = createAirtableService();
    const calendar = createGoogleCalendarService();

    // Step 1: Save to Airtable
    if (airtable) {
      try {
        console.log('[Automation] Creating/updating customer in Airtable...');

        const customerId = await airtable.upsertCustomer({
          businessId: process.env.AIRTABLE_BUSINESS_ID!,
          name: job.customerName,
          email: job.customerEmail,
          phone: job.customerPhone,
          address: job.siteAddress,
        });

        response.airtableCustomerId = customerId;
        console.log(`[Automation] Customer saved: ${customerId}`);

        if (action === 'job_created' || action === 'job_updated') {
          console.log('[Automation] Creating job in Airtable...');

          const airtableJob = airtable.jobToAirtable(job, customerId);
          const jobId = await airtable.createJob(airtableJob);

          response.airtableJobId = jobId;
          console.log(`[Automation] Job saved: ${jobId}`);
        }

        if (action === 'invoice_generated' && extraCharges && extraCharges.length > 0) {
          console.log('[Automation] Creating invoice in Airtable...');

          const totalAmount = extraCharges.reduce((sum, charge) => sum + charge.amount, 0);
          const totalTax = extraCharges.reduce((sum, charge) => sum + (charge.taxAmount || 0), 0);

          await airtable.createInvoice({
            businessId: process.env.AIRTABLE_BUSINESS_ID!,
            jobId: response.airtableJobId || job.id,
            customerId,
            amount: totalAmount,
            taxAmount: totalTax,
            status: 'sent',
            items: airtable.extraChargesToInvoiceItems(extraCharges),
          });

          console.log('[Automation] Invoice saved');
        }
      } catch (error) {
        console.error('[Automation] Airtable error:', error);
        errors.push(`Airtable: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      console.warn('[Automation] Airtable not configured, skipping...');
    }

    // Step 2: Create calendar event
    if (calendar && scheduledDate && process.env.AUTO_CREATE_CALENDAR_EVENTS === 'true') {
      try {
        console.log('[Automation] Creating Google Calendar event...');

        const date = new Date(scheduledDate);
        const durationHours = parseInt(process.env.DEFAULT_JOB_DURATION_HOURS || '4');

        const calendarEvent = calendar.jobToCalendarEvent(job, date, durationHours);
        const eventId = await calendar.createEvent(calendarEvent);

        response.calendarEventId = eventId;
        console.log(`[Automation] Calendar event created: ${eventId}`);
      } catch (error) {
        console.error('[Automation] Calendar error:', error);
        errors.push(`Calendar: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (!calendar) {
      console.warn('[Automation] Google Calendar not configured, skipping...');
    }

    // Step 3: Send confirmation email
    if (sendConfirmationEmail && process.env.AUTO_SEND_CONFIRMATION_EMAILS === 'true') {
      const brevoApiKey = process.env.BREVO_API_KEY;
      const fromEmail = process.env.APP_FROM_EMAIL;
      const fromName = process.env.APP_FROM_NAME;
      const companyName = process.env.APP_COMPANY_NAME;

      if (brevoApiKey && fromEmail && fromName) {
        try {
          console.log('[Automation] Sending confirmation email...');

          const scheduledText = scheduledDate
            ? `<p><strong>Scheduled for:</strong> ${new Date(scheduledDate).toLocaleString()}</p>`
            : '';

          const htmlContent = `
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #D2691E;">Job Confirmation - ${companyName}</h2>

                  <p>Dear ${job.customerName},</p>

                  <p>Thank you for choosing ${companyName}! We've received your service request and our team is ready to assist you.</p>

                  <div style="background: #FAF7F2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #5C4A3A;">Job Details</h3>
                    <p><strong>Service:</strong> ${job.title}</p>
                    <p><strong>Location:</strong> ${job.siteAddress || 'To be confirmed'}</p>
                    ${scheduledText}
                    ${job.notes ? `<p><strong>Notes:</strong> ${job.notes}</p>` : ''}
                  </div>

                  <p>We'll be in touch soon to confirm the details and answer any questions you may have.</p>

                  <p>If you have any immediate questions, please contact us at:</p>
                  <p>
                    <strong>Email:</strong> ${process.env.APP_COMPANY_EMAIL}<br>
                    <strong>Phone:</strong> ${process.env.APP_COMPANY_PHONE}
                  </p>

                  <p style="margin-top: 30px;">Best regards,<br>${companyName} Team</p>
                </div>
              </body>
            </html>
          `;

          const emailResult = await sendEmailViaBrevo(brevoApiKey, {
            sender: { name: fromName, email: fromEmail },
            to: [{ email: job.customerEmail, name: job.customerName }],
            subject: `Service Confirmation - ${job.title}`,
            htmlContent,
          });

          response.emailSent = emailResult.success;
          console.log(`[Automation] Email sent: ${emailResult.success}`);

          if (!emailResult.success) {
            errors.push(`Email: ${emailResult.error || 'Failed to send'}`);
          }
        } catch (error) {
          console.error('[Automation] Email error:', error);
          errors.push(`Email: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        console.warn('[Automation] Email not configured, skipping...');
      }
    }

    // Return response
    if (errors.length > 0) {
      response.success = false;
      response.errors = errors;
    }

    console.log('[Automation] Processing complete:', response);
    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Automation] Critical error:', error);
    return NextResponse.json(
      {
        success: false,
        errors: [`Critical: ${error instanceof Error ? error.message : 'Unknown error'}`],
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  const status = {
    automation: process.env.AUTOMATION_ENABLED === 'true',
    airtable: !!(process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID),
    calendar: !!(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY),
    email: !!process.env.BREVO_API_KEY,
  };

  return NextResponse.json({
    status: 'ok',
    services: status,
    timestamp: new Date().toISOString(),
  });
}
