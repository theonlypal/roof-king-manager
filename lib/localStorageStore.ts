import { Job, ExtraCharge } from './types';

const JOBS_KEY = 'rk_jobs_v1';
const CHARGES_KEY = 'rk_extra_charges_v1';

const isBrowser = typeof window !== 'undefined';

// Job functions
export function getJobs(): Job[] {
  if (!isBrowser) return [];
  try {
    const data = localStorage.getItem(JOBS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading jobs:', error);
    return [];
  }
}

function saveJobs(jobs: Job[]): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  } catch (error) {
    console.error('Error saving jobs:', error);
  }
}

export function getJobById(id: string): Job | null {
  const jobs = getJobs();
  return jobs.find(j => j.id === id) || null;
}

export function addJob(data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Job {
  const now = new Date().toISOString();
  const newJob: Job = {
    ...data,
    id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  const jobs = getJobs();
  jobs.push(newJob);
  saveJobs(jobs);
  return newJob;
}

export function updateJob(id: string, data: Partial<Omit<Job, 'id' | 'createdAt' | 'updatedAt'>>): Job | null {
  const jobs = getJobs();
  const index = jobs.findIndex(j => j.id === id);
  if (index === -1) return null;
  
  jobs[index] = { 
    ...jobs[index], 
    ...data, 
    updatedAt: new Date().toISOString() 
  };
  saveJobs(jobs);
  return jobs[index];
}

export function deleteJob(id: string): void {
  const jobs = getJobs().filter(j => j.id !== id);
  saveJobs(jobs);
  // Also delete associated charges
  const charges = getExtraCharges().filter(c => c.jobId !== id);
  saveExtraCharges(charges);
}

// ExtraCharge functions
export function getExtraCharges(): ExtraCharge[] {
  if (!isBrowser) return [];
  try {
    const data = localStorage.getItem(CHARGES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading extra charges:', error);
    return [];
  }
}

function saveExtraCharges(charges: ExtraCharge[]): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(CHARGES_KEY, JSON.stringify(charges));
  } catch (error) {
    console.error('Error saving extra charges:', error);
  }
}

export function getExtraChargesByJobId(jobId: string): ExtraCharge[] {
  return getExtraCharges().filter(c => c.jobId === jobId);
}

export function addExtraCharge(data: Omit<ExtraCharge, 'id' | 'createdAt' | 'updatedAt'>): ExtraCharge {
  const now = new Date().toISOString();
  const newCharge: ExtraCharge = {
    ...data,
    id: `charge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  const charges = getExtraCharges();
  charges.push(newCharge);
  saveExtraCharges(charges);
  return newCharge;
}

export function updateExtraCharge(id: string, data: Partial<Omit<ExtraCharge, 'id' | 'createdAt' | 'updatedAt'>>): ExtraCharge | null {
  const charges = getExtraCharges();
  const index = charges.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  charges[index] = { 
    ...charges[index], 
    ...data, 
    updatedAt: new Date().toISOString() 
  };
  saveExtraCharges(charges);
  return charges[index];
}

export function deleteExtraCharge(id: string): void {
  const charges = getExtraCharges().filter(c => c.id !== id);
  saveExtraCharges(charges);
}
