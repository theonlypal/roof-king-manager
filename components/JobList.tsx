'use client';

import Link from 'next/link';
import { Job } from '@/lib/types';

interface JobListProps {
  jobs: Job[];
}

export default function JobList({ jobs }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No jobs yet. Create your first job to get started.</p>
        <Link
          href="/jobs/new"
          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Job
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <Link
          key={job.id}
          href={`/jobs/${job.id}`}
          className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
        >
          <h3 className="font-semibold text-lg mb-2">{job.title}</h3>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Customer:</span> {job.customerName}
          </p>
          {job.siteAddress && (
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Site:</span> {job.siteAddress}
            </p>
          )}
          {job.initialEstimateAmount !== null && (
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Estimate:</span> ${job.initialEstimateAmount.toFixed(2)}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Created {new Date(job.createdAt).toLocaleDateString()}
          </p>
        </Link>
      ))}
    </div>
  );
}
