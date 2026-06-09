'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import JobTable from './JobTable';
import type { Job } from './types';

type JobStatus = Job['status'];

const STATUS_TABS: JobStatus[] = ['Active', 'Pending', 'Draft', 'Closed', 'Expired'];

function buildInitialJobs(): Job[] {
  const list: Job[] = [
    {
      id: 'job-p1-1',
      title: 'Senior UI/UX Designer',
      company: 'Mailchimp',
      logoColor: 'bg-[#FFE01B]',
      logoInitial: 'mc',
      applications: '12 New',
      createdDate: 'April 12, 2023',
      expiredDate: 'Expires May 12, 2023',
      status: 'Active',
    },
    {
      id: 'job-p1-2',
      title: 'Product Marketing Manager',
      company: 'LinkedIn',
      logoColor: 'bg-[#0A66C2]',
      logoInitial: 'in',
      applications: '8 New',
      createdDate: 'April 10, 2023',
      expiredDate: 'Expires May 10, 2023',
      status: 'Active',
    },
    {
      id: 'job-p1-3',
      title: 'Creative Cloud Specialist',
      company: 'Adobe',
      logoColor: 'bg-[#FF0000]',
      logoInitial: 'ad',
      applications: '5 New',
      createdDate: 'April 8, 2023',
      expiredDate: 'Expires May 8, 2023',
      status: 'Pending',
    },
    {
      id: 'job-p2-1',
      title: 'Full Stack React Developer',
      company: 'Stripe',
      logoColor: 'bg-[#635BFF]',
      logoInitial: 'st',
      applications: '24 New',
      createdDate: 'April 9, 2023',
      expiredDate: 'Expires May 9, 2023',
      status: 'Active',
    },
    {
      id: 'job-p2-2',
      title: 'DevOps Engineer (AWS)',
      company: 'Amazon Web Services',
      logoColor: 'bg-[#232F3E]',
      logoInitial: 'aw',
      applications: '18 New',
      createdDate: 'April 9, 2023',
      expiredDate: 'Expires May 9, 2023',
      status: 'Active',
    },
    {
      id: 'job-p2-3',
      title: 'Mobile App UI Designer',
      company: 'Figma',
      logoColor: 'bg-[#A259FF]',
      logoInitial: 'fi',
      applications: '31 New',
      createdDate: 'April 9, 2023',
      expiredDate: 'Expires May 9, 2023',
      status: 'Active',
    },
  ];

  const titles = [
    'Frontend Engineer (Next.js)',
    'Backend Node.js Developer',
    'Technical Product Manager',
    'QA Automation Engineer',
    'Data Analyst (SQL + Python)',
    'Customer Success Lead',
    'Content Strategist',
    'Growth Marketing Specialist',
  ];
  const companies = ['Shopify', 'Notion', 'Slack', 'HubSpot', 'Atlassian', 'Zendesk', 'Canva', 'Dropbox'];
  const logoColors = [
    'bg-[#96BF48]',
    'bg-[#000000]',
    'bg-[#4A154B]',
    'bg-[#FF7A59]',
    'bg-[#0052CC]',
    'bg-[#03363D]',
    'bg-[#00C4CC]',
    'bg-[#0061FF]',
  ];
  const initials = ['sh', 'no', 'sl', 'hu', 'at', 'ze', 'ca', 'dr'];

  const sampleByStatus: Job[] = [
    {
      id: 'job-sample-draft',
      title: 'Brand Designer (Contract)',
      company: 'Spotify',
      logoColor: 'bg-[#1DB954]',
      logoInitial: 'sp',
      applications: '0 New',
      createdDate: 'April 5, 2023',
      expiredDate: 'Draft — not published',
      status: 'Draft',
    },
    {
      id: 'job-sample-closed',
      title: 'iOS Engineer',
      company: 'Apple',
      logoColor: 'bg-[#555555]',
      logoInitial: 'ap',
      applications: '42 Total',
      createdDate: 'March 20, 2023',
      expiredDate: 'Closed April 18, 2023',
      status: 'Closed',
    },
    {
      id: 'job-sample-expired',
      title: 'SEO Content Writer',
      company: 'Semrush',
      logoColor: 'bg-[#FF642D]',
      logoInitial: 'se',
      applications: '9 Total',
      createdDate: 'February 14, 2023',
      expiredDate: 'Expired March 14, 2023',
      status: 'Expired',
    },
  ];

  list.push(...sampleByStatus);

  for (let i = 6; i < 60; i++) {
    const idx = i % companies.length;
    list.push({
      id: `job-gen-${i}`,
      title: titles[i % titles.length],
      company: companies[idx],
      logoColor: logoColors[idx],
      logoInitial: initials[idx],
      applications: `${3 + (i % 28)} New`,
      createdDate: 'April 9, 2023',
      expiredDate: 'Expires May 9, 2023',
      status: 'Active',
    });
  }

  return list;
}

const EMPTY_FORM = {
  title: '',
  company: '',
  logoColor: 'bg-[#635BFF]',
  logoInitial: 'co',
  applications: '0 New',
  createdDate: '',
  expiredDate: '',
  status: 'Active' as JobStatus,
};

export default function DashboardJobs() {
  const [jobs, setJobs] = useState<Job[]>(buildInitialJobs);
  const [activeSubTab, setActiveSubTab] = useState<JobStatus>('Active');
  const [currentPage, setCurrentPage] = useState(2);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filteredJobs = useMemo(
    () => jobs.filter((job) => job.status === activeSubTab),
    [jobs, activeSubTab],
  );

  const itemsPerPage = 3;
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedJobs = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return filteredJobs.slice(start, start + itemsPerPage);
  }, [filteredJobs, activePage, itemsPerPage]);

  const pageButtonClass = (page: number) =>
    `flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full text-sm font-normal transition-all ${
      activePage === page
        ? 'bg-[#52C47F] font-semibold text-white shadow-sm'
        : 'bg-transparent text-black hover:text-[#52C47F]'
    }`;

  const openAddModal = () => {
    setEditingJob(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setForm({
      title: job.title,
      company: job.company,
      logoColor: job.logoColor,
      logoInitial: job.logoInitial,
      applications: job.applications,
      createdDate: job.createdDate,
      expiredDate: job.expiredDate,
      status: job.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== id));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.company.trim()) return;

    const payload: Job = {
      id: editingJob?.id ?? `job-${Date.now()}`,
      title: form.title.trim(),
      company: form.company.trim(),
      logoColor: form.logoColor,
      logoInitial: form.logoInitial.trim().toLowerCase() || 'co',
      applications: form.applications.trim() || '0 New',
      createdDate:
        form.createdDate.trim() ||
        new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      expiredDate: form.expiredDate.trim() || 'Expires in 30 days',
      status: form.status,
    };

    if (editingJob) {
      setJobs((prev) => prev.map((job) => (job.id === editingJob.id ? payload : job)));
    } else {
      setJobs((prev) => [payload, ...prev]);
      setActiveSubTab(payload.status);
    }

    setIsModalOpen(false);
    setEditingJob(null);
    setForm(EMPTY_FORM);
    setCurrentPage(1);
  };

  const subTabClass = (tab: JobStatus) =>
    `relative cursor-pointer pb-4 text-[15px] font-normal tracking-tight transition-all outline-none ${
      activeSubTab === tab
        ? 'font-medium text-black after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:w-full after:bg-black'
        : 'text-neutral-400 hover:text-neutral-900'
    }`;

  return (
    <div className="animate-in fade-in -mx-4 -my-6 min-h-screen select-none bg-[#f0efec] p-4 font-sans text-black duration-300 sm:-mx-6 sm:p-6 md:-mx-8 md:p-8">
      <div className="mx-auto mb-8 flex max-w-7xl flex-col gap-5 pl-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[34px] font-normal leading-none tracking-tight text-neutral-900">Manage Jobs</h1>
          <p className="mt-2 text-[15px] font-normal tracking-tight text-neutral-500">
            Lorem ipsum dolor sit amet, consectetur.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#222222] px-6 py-4 text-sm font-medium text-white shadow-md transition-all hover:bg-neutral-800 active:scale-[0.99]"
        >
          <Plus className="h-4 w-4" />
          <span>Post New Job</span>
        </button>
      </div>

      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-neutral-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] md:p-8">
        <div className="mb-8 flex items-center justify-between border-b border-neutral-100">
          <div className="flex flex-wrap gap-6 sm:gap-8">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveSubTab(tab);
                  setCurrentPage(1);
                }}
                className={subTabClass(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <JobTable
          jobs={paginatedJobs}
          activeSubTab={activeSubTab}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onAddClick={openAddModal}
        />

        {filteredJobs.length > 0 ? (
          <div className="mt-8 flex select-none flex-col items-center justify-center gap-4 border-t border-neutral-100 pt-10 font-sans">
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={activePage === 1}
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.01)] transition-all hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
              >
                <ChevronLeft className="h-5 w-5 text-black" strokeWidth={1.5} />
              </button>

              <div className="flex items-center gap-1">
                {totalPages <= 6 ? (
                  Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={pageButtonClass(page)}
                    >
                      {page}
                    </button>
                  ))
                ) : (
                  <>
                    {[1, 2, 3, 4, 5].map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={pageButtonClass(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <span className="flex h-[44px] w-[44px] items-center justify-center text-sm font-normal text-neutral-400">
                      ...
                    </span>
                    <button type="button" onClick={() => setCurrentPage(20)} className={pageButtonClass(20)}>
                      20
                    </button>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={activePage === totalPages}
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.01)] transition-all hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
              >
                <ChevronRight className="h-5 w-5 text-black" strokeWidth={1.5} />
              </button>
            </div>

            <div className="pt-1 text-sm font-normal tracking-tight text-neutral-800">
              1 – {totalPages >= 20 ? 20 : totalPages} of 300+ property available
            </div>
          </div>
        ) : null}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close job modal"
            onClick={() => setIsModalOpen(false)}
            className="animate-in fade-in absolute inset-0 bg-neutral-900/40 backdrop-blur-sm duration-300"
          />

          <div className="animate-in slide-in-from-bottom-2 relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-neutral-100 bg-white p-6 shadow-2xl duration-300 md:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-4">
              <h3 className="text-lg font-bold text-neutral-900">
                {editingJob ? 'Edit Job Posting' : 'Post New Job'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Job Title</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Senior UI/UX Designer"
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#52C47F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Company</label>
                  <input
                    required
                    value={form.company}
                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                    placeholder="Mailchimp"
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#52C47F]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as JobStatus }))}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#52C47F]"
                  >
                    {STATUS_TABS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Logo Initial</label>
                  <input
                    value={form.logoInitial}
                    onChange={(e) => setForm((f) => ({ ...f, logoInitial: e.target.value }))}
                    placeholder="mc, in, ad"
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#52C47F]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Logo Color Class</label>
                  <input
                    value={form.logoColor}
                    onChange={(e) => setForm((f) => ({ ...f, logoColor: e.target.value }))}
                    placeholder="bg-[#FFE01B]"
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#52C47F]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Applications</label>
                <input
                  value={form.applications}
                  onChange={(e) => setForm((f) => ({ ...f, applications: e.target.value }))}
                  placeholder="12 New"
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#52C47F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Created Date</label>
                  <input
                    value={form.createdDate}
                    onChange={(e) => setForm((f) => ({ ...f, createdDate: e.target.value }))}
                    placeholder="April 9, 2023"
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#52C47F]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Expiry Label</label>
                  <input
                    value={form.expiredDate}
                    onChange={(e) => setForm((f) => ({ ...f, expiredDate: e.target.value }))}
                    placeholder="Expires May 9, 2023"
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#52C47F]"
                  />
                </div>
              </div>

              <div className="flex gap-3 border-t border-neutral-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl bg-neutral-100 py-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#222222] py-3 text-xs font-semibold text-white hover:bg-black"
                >
                  {editingJob ? 'Save Changes' : 'Publish Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
