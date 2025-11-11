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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-2 text-royal-espresso">Description *</label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-royal-cream border border-royal-stone rounded-lg px-4 py-2.5 transition-all duration-200 focus:outline-none focus:border-crown-terracotta focus:shadow-warm"
          rows={2}
          placeholder="e.g. Replace 3 sheets of rotten plywood"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-royal-espresso">Category</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="flex-1 bg-royal-cream border border-royal-stone rounded-lg px-4 py-2.5 transition-all duration-200 focus:outline-none focus:border-crown-terracotta focus:shadow-warm"
            placeholder="e.g. Rotten decking repair"
          />
          <button
            type="button"
            onClick={handleSuggestCategory}
            disabled={suggestingCategory}
            className="px-6 py-2.5 bg-accent-copper text-white rounded-lg shadow-warm transition-all duration-200 hover:shadow-warm-lg hover:-translate-y-0.5 disabled:bg-gray-400"
          >
            {suggestingCategory ? 'AI...' : 'AI Suggest'}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-royal-espresso">Amount ($) *</label>
        <input
          type="number"
          step="0.01"
          required
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
          className="w-full bg-royal-cream border border-royal-stone rounded-lg px-4 py-2.5 transition-all duration-200 focus:outline-none focus:border-crown-terracotta focus:shadow-warm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-royal-espresso">Tax Amount ($)</label>
        <input
          type="number"
          step="0.01"
          value={formData.taxAmount}
          onChange={(e) => setFormData({ ...formData, taxAmount: parseFloat(e.target.value) })}
          className="w-full bg-royal-cream border border-royal-stone rounded-lg px-4 py-2.5 transition-all duration-200 focus:outline-none focus:border-crown-terracotta focus:shadow-warm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-royal-espresso">Approved By</label>
        <input
          type="text"
          value={formData.approvedBy}
          onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
          className="w-full bg-royal-cream border border-royal-stone rounded-lg px-4 py-2.5 transition-all duration-200 focus:outline-none focus:border-crown-terracotta focus:shadow-warm"
          placeholder="Name of person who approved this charge"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-royal-stone rounded-lg text-royal-brown transition-all duration-200 hover:bg-royal-stone"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-crown-sunset text-white rounded-lg shadow-warm transition-all duration-200 hover:shadow-warm-lg hover:-translate-y-0.5"
        >
          {charge ? 'Update Charge' : 'Add Charge'}
        </button>
      </div>
    </form>
  );
}
