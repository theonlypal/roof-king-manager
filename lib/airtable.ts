import Airtable from 'airtable';
import { Job, ExtraCharge } from './types';

export interface AirtableConfig {
  apiKey: string;
  baseId: string;
  businessId: string; // For multi-tenant support
}

export interface AirtableCustomer {
  id?: string;
  businessId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt?: string;
}

export interface AirtableJob {
  id?: string;
  businessId: string;
  customerId: string;
  title: string;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  siteAddress?: string;
  estimatedAmount?: number;
  notes?: string;
  createdAt?: string;
  scheduledDate?: string;
}

export interface AirtableInvoice {
  id?: string;
  businessId: string;
  jobId: string;
  customerId: string;
  amount: number;
  taxAmount?: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  items: Array<{
    description: string;
    amount: number;
    category?: string;
  }>;
  createdAt?: string;
  dueDate?: string;
}

export class AirtableService {
  private base: Airtable.Base;
  private businessId: string;
  private rateLimitDelay = 25; // 40 requests per second = 25ms between requests

  // Table names - universal schema
  private readonly TABLES = {
    BUSINESSES: 'Businesses',
    CUSTOMERS: 'Customers',
    JOBS: 'Jobs',
    INVOICES: 'Invoices',
    PAYMENTS: 'Payments',
    SERVICES: 'Services',
  };

  constructor(config: AirtableConfig) {
    Airtable.configure({ apiKey: config.apiKey });
    this.base = Airtable.base(config.baseId);
    this.businessId = config.businessId;
  }

  // Exponential backoff retry logic
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries = 3
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.rateLimit();
        return await operation();
      } catch (error) {
        lastError = error as Error;
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        console.warn(`Retry ${i + 1}/${maxRetries} after ${delay}ms:`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  // Rate limiting
  private async rateLimit(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
  }

  // Create or update customer
  async upsertCustomer(customer: AirtableCustomer): Promise<string> {
    return this.retryWithBackoff(async () => {
      // Check if customer exists by email
      const existing = await this.base(this.TABLES.CUSTOMERS)
        .select({
          filterByFormula: `AND({Email} = '${customer.email}', {Business ID} = '${this.businessId}')`,
          maxRecords: 1,
        })
        .firstPage();

      if (existing.length > 0) {
        // Update existing customer
        const record = await this.base(this.TABLES.CUSTOMERS).update(existing[0].id, {
          'Name': customer.name,
          'Phone': customer.phone || '',
          'Address': customer.address || '',
        });
        return record.id;
      } else {
        // Create new customer
        const record = await this.base(this.TABLES.CUSTOMERS).create({
          'Business ID': this.businessId,
          'Name': customer.name,
          'Email': customer.email,
          'Phone': customer.phone || '',
          'Address': customer.address || '',
          'Created At': customer.createdAt || new Date().toISOString(),
        });
        return record.id;
      }
    });
  }

  // Create job
  async createJob(job: AirtableJob): Promise<string> {
    return this.retryWithBackoff(async () => {
      const record = await this.base(this.TABLES.JOBS).create({
        'Business ID': this.businessId,
        'Customer': [job.customerId], // Link to customer record
        'Title': job.title,
        'Status': job.status,
        'Site Address': job.siteAddress || '',
        'Estimated Amount': job.estimatedAmount || 0,
        'Notes': job.notes || '',
        'Created At': job.createdAt || new Date().toISOString(),
        'Scheduled Date': job.scheduledDate || '',
      });
      return record.id;
    });
  }

  // Create invoice
  async createInvoice(invoice: AirtableInvoice): Promise<string> {
    return this.retryWithBackoff(async () => {
      const record = await this.base(this.TABLES.INVOICES).create({
        'Business ID': this.businessId,
        'Job': [invoice.jobId], // Link to job record
        'Customer': [invoice.customerId], // Link to customer record
        'Amount': invoice.amount,
        'Tax Amount': invoice.taxAmount || 0,
        'Status': invoice.status,
        'Items': JSON.stringify(invoice.items),
        'Created At': invoice.createdAt || new Date().toISOString(),
        'Due Date': invoice.dueDate || '',
      });
      return record.id;
    });
  }

  // Get all jobs for business
  async getJobs(status?: string): Promise<AirtableJob[]> {
    return this.retryWithBackoff(async () => {
      const filterFormula = status
        ? `AND({Business ID} = '${this.businessId}', {Status} = '${status}')`
        : `{Business ID} = '${this.businessId}'`;

      const records = await this.base(this.TABLES.JOBS)
        .select({
          filterByFormula: filterFormula,
          sort: [{ field: 'Created At', direction: 'desc' }],
        })
        .all();

      return records.map(record => ({
        id: record.id,
        businessId: record.get('Business ID') as string,
        customerId: (record.get('Customer') as string[])?.[0] || '',
        title: record.get('Title') as string,
        status: record.get('Status') as AirtableJob['status'],
        siteAddress: record.get('Site Address') as string,
        estimatedAmount: record.get('Estimated Amount') as number,
        notes: record.get('Notes') as string,
        createdAt: record.get('Created At') as string,
        scheduledDate: record.get('Scheduled Date') as string,
      }));
    });
  }

  // Get customer by email
  async getCustomerByEmail(email: string): Promise<AirtableCustomer | null> {
    return this.retryWithBackoff(async () => {
      const records = await this.base(this.TABLES.CUSTOMERS)
        .select({
          filterByFormula: `AND({Email} = '${email}', {Business ID} = '${this.businessId}')`,
          maxRecords: 1,
        })
        .firstPage();

      if (records.length === 0) return null;

      const record = records[0];
      return {
        id: record.id,
        businessId: record.get('Business ID') as string,
        name: record.get('Name') as string,
        email: record.get('Email') as string,
        phone: record.get('Phone') as string,
        address: record.get('Address') as string,
        createdAt: record.get('Created At') as string,
      };
    });
  }

  // Batch create records (max 10 at once per Airtable limit)
  async batchCreateJobs(jobs: AirtableJob[]): Promise<string[]> {
    return this.retryWithBackoff(async () => {
      const records = jobs.slice(0, 10).map(job => ({
        fields: {
          'Business ID': this.businessId,
          'Customer': [job.customerId],
          'Title': job.title,
          'Status': job.status,
          'Site Address': job.siteAddress || '',
          'Estimated Amount': job.estimatedAmount || 0,
          'Notes': job.notes || '',
          'Created At': job.createdAt || new Date().toISOString(),
          'Scheduled Date': job.scheduledDate || '',
        },
      }));

      const created = await this.base(this.TABLES.JOBS).create(records);
      return created.map(r => r.id);
    });
  }

  // Convert local Job to Airtable format
  jobToAirtable(job: Job, customerId: string): AirtableJob {
    return {
      businessId: this.businessId,
      customerId,
      title: job.title,
      status: 'pending',
      siteAddress: job.siteAddress,
      estimatedAmount: job.initialEstimateAmount || undefined,
      notes: job.notes,
      createdAt: job.createdAt,
    };
  }

  // Convert ExtraCharges to Invoice items
  extraChargesToInvoiceItems(extraCharges: ExtraCharge[]) {
    return extraCharges.map(charge => ({
      description: charge.description,
      amount: charge.amount,
      category: charge.category,
    }));
  }
}

// Singleton instance creator
export function createAirtableService(
  apiKey?: string,
  baseId?: string,
  businessId?: string
): AirtableService | null {
  const key = apiKey || process.env.AIRTABLE_API_KEY;
  const base = baseId || process.env.AIRTABLE_BASE_ID;
  const business = businessId || process.env.AIRTABLE_BUSINESS_ID;

  if (!key || !base || !business) {
    console.warn('Airtable not configured. Missing API key, base ID, or business ID.');
    return null;
  }

  return new AirtableService({ apiKey: key, baseId: base, businessId: business });
}
