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
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link
          href="/jobs/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create New Job
        </Link>
      </div>

      <div className="mb-6">
        <p className="text-gray-600">
          Total Jobs: <span className="font-semibold">{jobs.length}</span>
        </p>
      </div>

      <JobList jobs={jobs} />
    </div>
  );
}
