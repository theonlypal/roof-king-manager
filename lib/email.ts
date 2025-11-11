export interface BrevoEmailRequest {
  sender: { name: string; email: string; };
  to: Array<{ email: string; name: string; }>;
  cc?: Array<{ email: string; name: string; }>;
  subject: string;
  htmlContent: string;
  attachments?: Array<{ name: string; content: string; type: string; }>;
}

export async function sendEmailViaBrevo(apiKey: string, emailData: BrevoEmailRequest): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Brevo error:', errorText);
      return { success: false, error: `Email API error: ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
