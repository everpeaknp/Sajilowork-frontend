import { ALL_JOBS, type Job } from './jobListData';

const STORAGE_KEY = 'sajilowork-posted-jobs';

let postedJobs: Job[] = [];

function readStoredJobs(): Job[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Job[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredJobs(jobs: Job[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

export function hydratePostedJobs() {
  postedJobs = readStoredJobs();
}

export function getPostedJobs(): Job[] {
  if (postedJobs.length === 0) {
    postedJobs = readStoredJobs();
  }
  return postedJobs;
}

export function getAllJobsIncludingPosted(): Job[] {
  const posted = getPostedJobs();
  const postedIds = new Set(posted.map((job) => job.id));
  const seeded = ALL_JOBS.filter((job) => !postedIds.has(job.id));
  return [...posted, ...seeded];
}

export function addPostedJob(job: Job) {
  postedJobs = [job, ...getPostedJobs().filter((item) => item.id !== job.id)];
  writeStoredJobs(postedJobs);
}
