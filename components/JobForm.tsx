'use client';

import { useState } from 'react';
import { Job } from '@/lib/types';

interface JobFormProps {
  job?: Job;
  onSave: (data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => void;
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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Job Title *</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full border rounded px-3 py-2"
          placeholder="e.g. Roof Repair - Smith Residence"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Customer Name *</label>
        <input
          type="text"
          required
          value={formData.customerName}
          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Customer Email *</label>
        <input
          type="email"
          required
          value={formData.customerEmail}
          onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Customer Phone</label>
        <input
          type="tel"
          value={formData.customerPhone}
          onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Site Address</label>
        <input
          type="text"
          value={formData.siteAddress}
          onChange={(e) => setFormData({ ...formData, siteAddress: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Initial Estimate ($)</label>
        <input
          type="number"
          step="0.01"
          value={formData.initialEstimateAmount || ''}
          onChange={(e) => setFormData({ ...formData, initialEstimateAmount: e.target.value ? parseFloat(e.target.value) : null })}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full border rounded px-3 py-2"
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {job ? 'Update Job' : 'Create Job'}
        </button>
      </div>
    </form>
  );
}
