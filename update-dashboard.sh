#!/bin/bash

cat > app/dashboard/page.tsx << 'EOF'
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getJobs } from '@/lib/localStorageStore';
import JobList from '@/components/JobList';
import { Job } from '@/lib/types';

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const loadedJobs = getJobs();
    setJobs(loadedJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-royal-espresso">Dashboard</h1>
        <Link
          href="/jobs/new"
          className="px-6 py-3 bg-crown-sunset text-white rounded-lg shadow-warm transition-all duration-200 hover:shadow-warm-lg hover:-translate-y-0.5"
        >
          Create New Job
        </Link>
      </div>

      <div className="mb-6">
        <p className="text-royal-taupe text-lg">
          Total Jobs: <span className="font-semibold text-royal-espresso">{jobs.length}</span>
        </p>
      </div>

      <JobList jobs={jobs} />
    </div>
  );
}
EOF

echo "✓ Updated dashboard/page.tsx"
