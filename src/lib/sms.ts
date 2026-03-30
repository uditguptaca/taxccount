// SMS Notification Provider Interface
// Swappable vendor implementation (Twilio, AWS SNS, Vonage, etc.)
// Default: Console logging for MVP, production: real SMS via configured vendor

export interface SmsMessage {
  to: string;           // E.164 format: +14165551234
  body: string;
  from?: string;        // Sender ID or number
  reference_id?: string; // Internal tracking reference
}

export interface SmsResult {
  success: boolean;
  provider_message_id?: string;
  error?: string;
  cost_cents?: number;
}

export interface SmsProvider {
  name: string;
  send(message: SmsMessage): Promise<SmsResult>;
  checkBalance?(): Promise<{ balance: number; currency: string }>;
}

// ── Console Provider (Development/Testing) ──────────────────────────────

class ConsoleSmsProvider implements SmsProvider {
  name = 'console';

  async send(message: SmsMessage): Promise<SmsResult> {
    console.log(`[SMS:console] → ${message.to}: "${message.body}"`);
    return {
      success: true,
      provider_message_id: `console-${Date.now()}`,
      cost_cents: 0,
    };
  }
}

// ── Twilio Provider (Production) ─────────────────────────────────────────

class TwilioSmsProvider implements SmsProvider {
  name = 'twilio';
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = process.env.TWILIO_FROM_NUMBER || '';
  }

  async send(message: SmsMessage): Promise<SmsResult> {
    if (!this.accountSid || !this.authToken) {
      console.warn('[SMS:twilio] Not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER');
      // Fallback to console
      console.log(`[SMS:twilio:fallback] → ${message.to}: "${message.body}"`);
      return { success: true, provider_message_id: `twilio-fallback-${Date.now()}` };
    }

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');

      const body = new URLSearchParams({
        To: message.to,
        From: message.from || this.fromNumber,
        Body: message.body,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      const data = await response.json() as any;

      if (response.ok) {
        return {
          success: true,
          provider_message_id: data.sid,
          cost_cents: data.price ? Math.round(parseFloat(data.price) * -100) : undefined,
        };
      } else {
        return {
          success: false,
          error: data.message || `Twilio error: ${response.status}`,
        };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async checkBalance(): Promise<{ balance: number; currency: string }> {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Balance.json`;
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      const response = await fetch(url, {
        headers: { 'Authorization': `Basic ${auth}` },
      });
      const data = await response.json() as any;
      return { balance: parseFloat(data.balance || '0'), currency: data.currency || 'USD' };
    } catch {
      return { balance: 0, currency: 'USD' };
    }
  }
}

// ── AWS SNS Provider (Production Alternative) ────────────────────────────

class AwsSnsSmsProvider implements SmsProvider {
  name = 'aws_sns';

  async send(message: SmsMessage): Promise<SmsResult> {
    // In production: use @aws-sdk/client-sns
    console.log(`[SMS:aws_sns:stub] → ${message.to}: "${message.body}"`);
    return {
      success: true,
      provider_message_id: `sns-stub-${Date.now()}`,
    };
  }
}

// ── Provider Factory ─────────────────────────────────────────────────────

let _activeProvider: SmsProvider | null = null;

export function getSmsProvider(): SmsProvider {
  if (_activeProvider) return _activeProvider;

  const providerName = process.env.SMS_PROVIDER || 'console';

  switch (providerName) {
    case 'twilio':
      _activeProvider = new TwilioSmsProvider();
      break;
    case 'aws_sns':
      _activeProvider = new AwsSnsSmsProvider();
      break;
    default:
      _activeProvider = new ConsoleSmsProvider();
  }

  console.log(`[SMS] Provider initialized: ${_activeProvider.name}`);
  return _activeProvider;
}

// ── High-Level Notification Functions ────────────────────────────────────

/**
 * Send an SMS reminder to a client
 */
export async function sendSmsReminder(
  phoneNumber: string,
  clientName: string,
  reminderTitle: string,
  dueInfo?: string
): Promise<SmsResult> {
  const provider = getSmsProvider();
  const body = dueInfo
    ? `Hi ${clientName}, reminder: ${reminderTitle}. Due: ${dueInfo}. Log in at portal.taxccount.ca`
    : `Hi ${clientName}, reminder: ${reminderTitle}. Log in at portal.taxccount.ca`;

  return provider.send({
    to: phoneNumber,
    body,
    reference_id: `reminder-${Date.now()}`,
  });
}

/**
 * Send an SMS notification for an action item
 */
export async function sendSmsActionNotification(
  phoneNumber: string,
  clientName: string,
  actionType: string,
  details: string
): Promise<SmsResult> {
  const provider = getSmsProvider();
  const body = `Hi ${clientName}, ${actionType}: ${details}. Please log in to your portal at portal.taxccount.ca`;

  return provider.send({
    to: phoneNumber,
    body,
    reference_id: `action-${Date.now()}`,
  });
}

/**
 * Send an SMS notification for invoice/payment
 */
export async function sendSmsInvoiceNotification(
  phoneNumber: string,
  clientName: string,
  invoiceNumber: string,
  amount: string,
  dueDate: string
): Promise<SmsResult> {
  const provider = getSmsProvider();
  const body = `Hi ${clientName}, Invoice #${invoiceNumber} for ${amount} is due ${dueDate}. Pay online at portal.taxccount.ca/portal/billing`;

  return provider.send({
    to: phoneNumber,
    body,
    reference_id: `invoice-${Date.now()}`,
  });
}

/**
 * Send MFA code via SMS (fallback factor)
 */
export async function sendSmsMfaCode(
  phoneNumber: string,
  code: string
): Promise<SmsResult> {
  const provider = getSmsProvider();
  return provider.send({
    to: phoneNumber,
    body: `Your Taxccount verification code is: ${code}. This code expires in 5 minutes. Do not share this code.`,
    reference_id: `mfa-${Date.now()}`,
  });
}
