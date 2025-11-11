import { Job, ExtraCharge } from './types';

const JOBS_KEY = 'rk_jobs_v1';
const CHARGES_KEY = 'rk_extra_charges_v1';

const isBrowser = typeof window !== 'undefined';

export const localStorageStore = {
  getJobs(): Job[] {
    if (!isBrowser) return [];
    try {
      const data = localStorage.getItem(JOBS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading jobs:', error);
      return [];
    }
  },

  saveJobs(jobs: Job[]): void {
    if (!isBrowser) return;
    try {
      localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
    } catch (error) {
      console.error('Error saving jobs:', error);
    }
  },

  getJob(id: string): Job | null {
    const jobs = this.getJobs();
    return jobs.find(j => j.id === id) || null;
  },

  addJob(job: Job): void {
    const jobs = this.getJobs();
    jobs.push(job);
    this.saveJobs(jobs);
  },

  updateJob(id: string, updates: Partial<Job>): void {
    const jobs = this.getJobs();
    const index = jobs.findIndex(j => j.id === id);
    if (index !== -1) {
      jobs[index] = { ...jobs[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveJobs(jobs);
    }
  },

  deleteJob(id: string): void {
    const jobs = this.getJobs().filter(j => j.id !== id);
    this.saveJobs(jobs);
    const charges = this.getExtraCharges().filter(c => c.jobId !== id);
    this.saveExtraCharges(charges);
  },

  getExtraCharges(): ExtraCharge[] {
    if (!isBrowser) return [];
    try {
      const data = localStorage.getItem(CHARGES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading extra charges:', error);
      return [];
    }
  },

  saveExtraCharges(charges: ExtraCharge[]): void {
    if (!isBrowser) return;
    try {
      localStorage.setItem(CHARGES_KEY, JSON.stringify(charges));
    } catch (error) {
      console.error('Error saving extra charges:', error);
    }
  },

  getChargesForJob(jobId: string): ExtraCharge[] {
    return this.getExtraCharges().filter(c => c.jobId === jobId);
  },

  addExtraCharge(charge: ExtraCharge): void {
    const charges = this.getExtraCharges();
    charges.push(charge);
    this.saveExtraCharges(charges);
  },

  updateExtraCharge(id: string, updates: Partial<ExtraCharge>): void {
    const charges = this.getExtraCharges();
    const index = charges.findIndex(c => c.id === id);
    if (index !== -1) {
      charges[index] = { ...charges[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveExtraCharges(charges);
    }
  },

  deleteExtraCharge(id: string): void {
    const charges = this.getExtraCharges().filter(c => c.id !== id);
    this.saveExtraCharges(charges);
  },
};
