'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import JobForm from '@/components/JobForm';
import { addJob } from '@/lib/localStorageStore';
import { Job } from '@/lib/types';

export default function NewJob() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [automationMessage, setAutomationMessage] = useState('');

  const handleSave = async (data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>, scheduledDate?: string) => {
    setSaving(true);
    setAutomationMessage('');

    try {
      // Create the job in localStorage
      const newJob = addJob(data);

      // Trigger automation if enabled
      try {
        const response = await fetch('/api/automation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'job_created',
            job: newJob,
            scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
            sendConfirmationEmail: true,
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          const messages = [];
          if (result.airtableJobId) messages.push('Saved to database');
          if (result.calendarEventId) messages.push('Calendar event created');
          if (result.emailSent) messages.push('Confirmation email sent');
          
          if (messages.length > 0) {
            setAutomationMessage(`✓ Automation complete: ${messages.join(', ')}`);
          }
        } else if (result.errors) {
          console.warn('Automation partially failed:', result.errors);
        }
      } catch (automationError) {
        console.error('Automation error (job still created):', automationError);
      }

      // Navigate to job details after brief delay to show automation message
      setTimeout(() => {
        router.push(`/jobs/${newJob.id}`);
      }, 1000);

    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job');
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-royal-espresso">Create New Job</h1>
      
      {automationMessage && (
        <div className="mb-4 p-4 bg-accent-sage text-white rounded-lg shadow-warm">
          {automationMessage}
        </div>
      )}

      <div className="max-w-2xl bg-royal-beige rounded-lg shadow-warm p-6">
        <JobForm
          onSave={handleSave}
          onCancel={() => router.push('/dashboard')}
        />
      </div>

      {saving && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-warm-xl text-center">
            <div className="text-4xl mb-4">⚙️</div>
            <div className="text-xl font-bold text-royal-espresso">Creating job...</div>
            <div className="text-sm text-royal-taupe mt-2">Running automation pipeline</div>
          </div>
        </div>
      )}
    </div>
  );
}
