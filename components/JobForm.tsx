'use client';

import { useState } from 'react';
import { Job } from '@/lib/types';

interface JobFormProps {
  job?: Job;
  onSave: (data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>, scheduledDate?: string) => void;
  onCancel: () => void;
}

export default function JobForm({ job, onSave, onCancel }: JobFormProps) {
  const [formData, setFormData] = useState({
    title: job?.title || '',
    customerName: job?.customerName || '',
    customerEmail: job?.customerEmail || '',
    customerPhone: job?.customerPhone || '',
    siteAddress: job?.siteAddress || '',
    initialEstimateAmount: job?.initialEstimateAmount || null,
    notes: job?.notes || '',
    scheduledDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { scheduledDate, ...jobData } = formData;
    onSave(jobData, scheduledDate || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-2 text-royal-espresso">Job Title *</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full bg-royal-cream border border-royal-stone rounded-lg px-4 py-2.5 transition-all duration-200 focus:outline-none focus:border-crown-terracotta focus:shadow-warm"
          placeholder="e.g. Roof Repair - Smith Residence"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-royal-espresso">Customer Name *</label>
        <input
          type="text"
          required
          value={formData.customerName}
          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
          className="w-full bg-royal-cream border border-royal-stone rounded-lg px-4 py-2.5 transition-all duration-200 focus:outline-none focus:border-crown-terracotta focus:shadow-warm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-royal-espresso">Customer Email *</label>
        <input
          type="email"
          required
          value={formData.customerEmail}
          onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
          className="w-full bg-royal-cream border border-royal-stone rounded-lg px-4 py-2.5 transition-all duration-200 focus:outline-none focus:border-crown-terracotta focus:shadow-warm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-royal-espresso">Customer Phone</label>
        <input
          type="tel"
          value={formData.customerPhone}
          onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
          className="w-full bg-royal-cream border border-royal-stone rounded-lg px-4 py-2.5 transition-all duration-200 focus:outline-none focus:border-crown-terracotta focus:shadow-warm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-royal-espresso">Site Address</label>
        <input
          type="text"
          value={formData.siteAddress}
          onChange={(e) => setFormData({ ...formData, siteAddress: e.target.value })}
          className="w-full bg-royal-cream border border-royal-stone rounded-lg px-4 py-2.5 transition-all duration-200 focus:outline-none focus:border-crown-terracotta focus:shadow-warm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-royal-espresso">Initial Estimate ($)</label>
        <input
          type="number"
          step="0.01"
          value={formData.initialEstimateAmount || ''}
          onChange={(e) => setFormData({ ...formData, initialEstimateAmount: e.target.value ? parseFloat(e.target.value) : null })}
          className="w-full bg-royal-cream border border-royal-stone rounded-lg px-4 py-2.5 transition-all duration-200 focus:outline-none focus:border-crown-terracotta focus:shadow-warm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-royal-espresso">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full bg-royal-cream border border-royal-stone rounded-lg px-4 py-2.5 transition-all duration-200 focus:outline-none focus:border-crown-terracotta focus:shadow-warm"
          rows={3}
        />
      </div>

      {!job && (
        <div className="bg-accent-sage/10 border border-accent-sage rounded-lg p-4">
          <label className="block text-sm font-medium mb-2 text-royal-espresso">
            Scheduled Date & Time (Optional)
            <span className="block text-sm font-normal text-royal-taupe mt-1">
              Auto-creates calendar event and sends confirmation email
            </span>
          </label>
          <input
            type="datetime-local"
            value={formData.scheduledDate}
            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            className="w-full bg-royal-cream border border-royal-stone rounded-lg px-4 py-2.5 transition-all duration-200 focus:outline-none focus:border-crown-terracotta focus:shadow-warm"
          />
        </div>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-royal-stone rounded-lg text-royal-brown transition-all duration-200 hover:bg-royal-stone"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
        >
          {job ? 'Update Job' : 'Create Job'}
        </button>
      </div>
    </form>
  );
}
