'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  getJobById,
  updateJob,
  deleteJob,
  getExtraChargesByJobId,
  addExtraCharge,
  updateExtraCharge,
  deleteExtraCharge,
} from '@/lib/localStorageStore';
import { Job, ExtraCharge } from '@/lib/types';
import JobForm from '@/components/JobForm';
import ExtraChargeForm from '@/components/ExtraChargeForm';
import ExtraChargesTable from '@/components/ExtraChargesTable';
import GenerateReceiptModal from '@/components/GenerateReceiptModal';

export default function JobDetail() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [charges, setCharges] = useState<ExtraCharge[]>([]);
  const [editingJob, setEditingJob] = useState(false);
  const [addingCharge, setAddingCharge] = useState(false);
  const [editingCharge, setEditingCharge] = useState<ExtraCharge | null>(null);
  const [selectedChargeIds, setSelectedChargeIds] = useState<string[]>([]);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    const loadedJob = getJobById(jobId);
    if (!loadedJob) {
      alert('Job not found');
      router.push('/dashboard');
      return;
    }
    setJob(loadedJob);
    loadCharges();
  }, [jobId, router]);

  const loadCharges = () => {
    const loadedCharges = getExtraChargesByJobId(jobId);
    setCharges(loadedCharges.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const handleUpdateJob = (data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
    const updated = updateJob(jobId, data);
    if (updated) {
      setJob(updated);
      setEditingJob(false);
    }
  };

  const handleDeleteJob = () => {
    if (confirm('Delete this job and all its extra charges?')) {
      deleteJob(jobId);
      router.push('/dashboard');
    }
  };

  const handleAddCharge = (data: Omit<ExtraCharge, 'id' | 'createdAt' | 'updatedAt'>) => {
    addExtraCharge(data);
    loadCharges();
    setAddingCharge(false);
  };

  const handleUpdateCharge = (data: Omit<ExtraCharge, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingCharge) {
      updateExtraCharge(editingCharge.id, data);
      loadCharges();
      setEditingCharge(null);
    }
  };

  const handleDeleteCharge = (id: string) => {
    deleteExtraCharge(id);
    loadCharges();
    setSelectedChargeIds(selectedChargeIds.filter((cid) => cid !== id));
  };

  const selectedCharges = charges.filter((c) => selectedChargeIds.includes(c.id));
  const totalSelected = selectedCharges.reduce(
    (sum, c) => sum + c.amount + (c.taxAmount || 0),
    0
  );

  if (!job) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-crown-terracotta hover:underline mb-2"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-royal-espresso">{job.title}</h1>
      </div>

      {editingJob ? (
        <div className="bg-royal-beige rounded-lg shadow-warm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-royal-espresso">Edit Job</h2>
          <JobForm
            job={job}
            onSave={handleUpdateJob}
            onCancel={() => setEditingJob(false)}
          />
        </div>
      ) : (
        <div className="bg-royal-beige rounded-lg shadow-warm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-royal-espresso">Job Details</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingJob(true)}
                className="px-3 py-1 text-sm border border-royal-stone rounded-lg transition-all duration-200 hover:bg-royal-stone"
              >
                Edit
              </button>
              <button
                onClick={handleDeleteJob}
                className="px-3 py-1 text-sm text-accent-alert border border-accent-alert rounded-lg transition-all duration-200 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="font-medium text-royal-taupe">Customer Name</dt>
              <dd>{job.customerName}</dd>
            </div>
            <div>
              <dt className="font-medium text-royal-taupe">Customer Email</dt>
              <dd>{job.customerEmail}</dd>
            </div>
            {job.customerPhone && (
              <div>
                <dt className="font-medium text-royal-taupe">Customer Phone</dt>
                <dd>{job.customerPhone}</dd>
              </div>
            )}
            {job.siteAddress && (
              <div>
                <dt className="font-medium text-royal-taupe">Site Address</dt>
                <dd>{job.siteAddress}</dd>
              </div>
            )}
            {job.initialEstimateAmount != null && (
              <div>
                <dt className="font-medium text-royal-taupe">Initial Estimate</dt>
                <dd>${job.initialEstimateAmount.toFixed(2)}</dd>
              </div>
            )}
            {job.notes && (
              <div className="md:col-span-2">
                <dt className="font-medium text-royal-taupe">Notes</dt>
                <dd>{job.notes}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      <div className="bg-royal-beige rounded-lg shadow-warm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-royal-espresso">Extra Charges ({charges.length})</h2>
          <button
            onClick={() => setAddingCharge(true)}
            className="px-6 py-2.5 bg-accent-success text-white rounded-lg shadow-warm transition-all duration-200 hover:shadow-warm-lg hover:-translate-y-0.5"
          >
            Add Extra Charge
          </button>
        </div>

        {addingCharge && (
          <div className="mb-6 p-4 border border-royal-stone rounded-lg bg-royal-cream">
            <h3 className="font-semibold mb-3 text-royal-espresso">New Extra Charge</h3>
            <ExtraChargeForm
              jobId={jobId}
              onSave={handleAddCharge}
              onCancel={() => setAddingCharge(false)}
            />
          </div>
        )}

        {editingCharge && (
          <div className="mb-6 p-4 border border-royal-stone rounded-lg bg-royal-cream">
            <h3 className="font-semibold mb-3 text-royal-espresso">Edit Extra Charge</h3>
            <ExtraChargeForm
              jobId={jobId}
              charge={editingCharge}
              onSave={handleUpdateCharge}
              onCancel={() => setEditingCharge(null)}
            />
          </div>
        )}

        <ExtraChargesTable
          charges={charges}
          selectedIds={selectedChargeIds}
          onSelectionChange={setSelectedChargeIds}
          onEdit={setEditingCharge}
          onDelete={handleDeleteCharge}
        />

        {selectedChargeIds.length > 0 && (
          <div className="mt-4 p-4 bg-royal-stone border border-royal-stone rounded-lg flex justify-between items-center">
            <div>
              <p className="font-semibold">
                {selectedChargeIds.length} charge(s) selected
              </p>
              <p className="text-sm text-royal-taupe">
                Total: ${totalSelected.toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => setShowReceiptModal(true)}
              className="px-6 py-2.5 bg-crown-sunset text-white rounded-lg shadow-warm transition-all duration-200 hover:shadow-warm-lg hover:-translate-y-0.5"
            >
              Generate Receipt
            </button>
          </div>
        )}
      </div>

      {showReceiptModal && (
        <GenerateReceiptModal
          job={job}
          selectedCharges={selectedCharges}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>
  );
}
