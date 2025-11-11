#!/bin/bash

cat > components/JobList.tsx << 'EOF'
'use client';

import Link from 'next/link';
import { Job } from '@/lib/types';

interface JobListProps {
  jobs: Job[];
}

export default function JobList({ jobs }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 text-royal-taupe">
        <p className="text-lg mb-4">No jobs yet. Create your first job to get started.</p>
        <Link
          href="/jobs/new"
          className="inline-block px-6 py-3 bg-crown-sunset text-white rounded-lg shadow-warm transition-all duration-200 hover:shadow-warm-lg hover:-translate-y-0.5"
        >
          Create Job
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <Link
          key={job.id}
          href={`/jobs/${job.id}`}
          className="bg-royal-beige rounded-lg p-6 shadow-warm transition-all duration-300 hover:shadow-warm-lg hover:-translate-y-1"
        >
          <h3 className="font-semibold text-xl mb-3 text-royal-espresso">{job.title}</h3>
          <p className="text-sm text-royal-taupe mb-2">
            <span className="font-medium text-royal-brown">Customer:</span> {job.customerName}
          </p>
          {job.siteAddress && (
            <p className="text-sm text-royal-taupe mb-2">
              <span className="font-medium text-royal-brown">Site:</span> {job.siteAddress}
            </p>
          )}
          {job.initialEstimateAmount != null && (
            <p className="text-sm text-royal-taupe mb-2">
              <span className="font-medium text-royal-brown">Estimate:</span> ${job.initialEstimateAmount.toFixed(2)}
            </p>
          )}
          <p className="text-xs text-royal-taupe mt-3">
            Created {new Date(job.createdAt).toLocaleDateString()}
          </p>
        </Link>
      ))}
    </div>
  );
}
EOF

echo "✓ Updated JobList.tsx"
