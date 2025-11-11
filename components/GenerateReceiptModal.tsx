'use client';

import { useState } from 'react';
import { Job, ExtraCharge } from '@/lib/types';

interface GenerateReceiptModalProps {
  job: Job;
  selectedCharges: ExtraCharge[];
  onClose: () => void;
}

export default function GenerateReceiptModal({ job, selectedCharges, onClose }: GenerateReceiptModalProps) {
  const [sending, setSending] = useState(false);
  const [officeEmail, setOfficeEmail] = useState(
    process.env.NEXT_PUBLIC_APP_COMPANY_EMAIL || 'office@sandiegoroofking.com'
  );

  const handleGenerate = async () => {
    if (selectedCharges.length === 0) {
      alert('Please select at least one charge');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job,
          extraCharges: selectedCharges,
          customerEmail: job.customerEmail,
          officeEmail,
        }),
      });

      const data = await response.json();

      if (data.pdfBase64) {
        // Download the PDF
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${data.pdfBase64}`;
        link.download = `receipt-${job.id}.pdf`;
        link.click();

        if (data.emailSent) {
          alert(`Receipt generated and sent to ${job.customerEmail} (with CC to ${officeEmail})`);
        } else {
          alert(`Receipt generated but email failed: ${data.error || 'Unknown error'}. PDF downloaded.`);
        }

        onClose();
      } else {
        alert(`Error: ${data.error || 'Failed to generate receipt'}`);
      }
    } catch (error) {
      console.error('Receipt generation error:', error);
      alert('Error generating receipt');
    } finally {
      setSending(false);
    }
  };

  const total = selectedCharges.reduce((sum, charge) => sum + charge.amount + (charge.taxAmount || 0), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-royal-cream rounded-2xl shadow-warm-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-royal-espresso">Generate & Send Receipt</h2>

        <div className="mb-4">
          <p className="text-sm text-royal-taupe mb-2">
            <span className="font-medium">Job:</span> {job.title}
          </p>
          <p className="text-sm text-royal-taupe mb-2">
            <span className="font-medium">Customer:</span> {job.customerName}
          </p>
          <p className="text-sm text-royal-taupe mb-2">
            <span className="font-medium">Selected Charges:</span> {selectedCharges.length}
          </p>
          <p className="text-sm font-semibold text-royal-espresso">
            Total: ${total.toFixed(2)}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-royal-espresso">Customer Email</label>
          <input
            type="email"
            value={job.customerEmail}
            disabled
            className="w-full bg-royal-stone border border-royal-stone rounded-lg px-4 py-2.5 transition-all duration-200"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-royal-espresso">Office CC Email</label>
          <input
            type="email"
            value={officeEmail}
            onChange={(e) => setOfficeEmail(e.target.value)}
            className="w-full bg-royal-cream border border-royal-stone rounded-lg px-4 py-2.5 transition-all duration-200 focus:outline-none focus:border-crown-terracotta focus:shadow-warm"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={sending}
            className="px-6 py-2.5 border border-royal-stone rounded-lg text-royal-brown transition-all duration-200 hover:bg-royal-stone disabled:bg-royal-stone"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={sending}
            className="px-6 py-2.5 bg-crown-sunset text-white rounded-lg shadow-warm transition-all duration-200 hover:shadow-warm-lg hover:-translate-y-0.5 disabled:bg-gray-400"
          >
            {sending ? 'Generating...' : 'Generate & Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
