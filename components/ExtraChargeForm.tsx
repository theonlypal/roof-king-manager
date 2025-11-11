'use client';

import { useState } from 'react';
import { ExtraCharge } from '@/lib/types';

interface ExtraChargeFormProps {
  jobId: string;
  charge?: ExtraCharge;
  onSave: (data: Omit<ExtraCharge, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export default function ExtraChargeForm({ jobId, charge, onSave, onCancel }: ExtraChargeFormProps) {
  const [formData, setFormData] = useState({
    description: charge?.description || '',
    category: charge?.category || '',
    amount: charge?.amount || 0,
    taxAmount: charge?.taxAmount || 0,
    approvedBy: charge?.approvedBy || '',
  });

  const [suggestingCategory, setSuggestingCategory] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      jobId,
      ...formData,
    });
  };

  const handleSuggestCategory = async () => {
    if (!formData.description.trim()) {
      alert('Please enter a description first');
      return;
    }

    setSuggestingCategory(true);
    try {
      const response = await fetch('/api/suggest-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: formData.description }),
      });

      const data = await response.json();
      if (data.category) {
        setFormData({ ...formData, category: data.category });
      } else {
        alert('Could not suggest a category. Please enter manually.');
      }
    } catch (error) {
      console.error('Category suggestion error:', error);
      alert('Error suggesting category');
    } finally {
      setSuggestingCategory(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Description *</label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border rounded px-3 py-2"
          rows={2}
          placeholder="e.g. Replace 3 sheets of rotten plywood"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="flex-1 border rounded px-3 py-2"
            placeholder="e.g. Rotten decking repair"
          />
          <button
            type="button"
            onClick={handleSuggestCategory}
            disabled={suggestingCategory}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {suggestingCategory ? 'AI...' : 'AI Suggest'}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Amount ($) *</label>
        <input
          type="number"
          step="0.01"
          required
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tax Amount ($)</label>
        <input
          type="number"
          step="0.01"
          value={formData.taxAmount}
          onChange={(e) => setFormData({ ...formData, taxAmount: parseFloat(e.target.value) })}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Approved By</label>
        <input
          type="text"
          value={formData.approvedBy}
          onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
          className="w-full border rounded px-3 py-2"
          placeholder="Name of person who approved this charge"
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
          {charge ? 'Update Charge' : 'Add Charge'}
        </button>
      </div>
    </form>
  );
}
