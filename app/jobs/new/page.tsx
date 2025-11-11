'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import JobForm from '@/components/JobForm';
import { addJob } from '@/lib/localStorageStore';
import { Job } from '@/lib/types';

export default function NewJob() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSave = (data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
    setSaving(true);
    try {
      const newJob = addJob(data);
      router.push(`/jobs/${newJob.id}`);
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job');
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-royal-espresso">Create New Job</h1>
      <div className="max-w-2xl bg-royal-beige rounded-lg shadow-warm p-6">
        <JobForm
          onSave={handleSave}
          onCancel={() => router.push('/dashboard')}
        />
      </div>
    </div>
  );
}
