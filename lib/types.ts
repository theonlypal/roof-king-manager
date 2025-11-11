export interface Job {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  siteAddress?: string;
  initialEstimateAmount?: number | null;
  notes?: string;
}

export interface ExtraCharge {
  id: string;
  jobId: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  category?: string;
  amount: number;
  taxAmount?: number;
  approvedBy?: string;
  photoDataUrls?: string[];
}

export interface ReceiptGenerationRequest {
  job: Job;
  extraCharges: ExtraCharge[];
  customerEmail: string;
  officeEmail: string;
}

export interface ReceiptGenerationResponse {
  emailSent: boolean;
  pdfBase64: string;
  error?: string;
}

export interface CategorySuggestionRequest {
  description: string;
}

export interface CategorySuggestionResponse {
  category: string | null;
}
