'use client';

import { useMemo, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { addPostedJob, getPostedJobs } from '@/components/jobs/jobStore';
import JobTable from './JobTable';
import DashboardCreateJob, {
  createDashboardJobFromForm,
  createPublicJobFromForm,
  type CreateJobFormData,
} from './DashboardCreateJob';
import type { Job } from './types';
import DeleteConfirmModal from './DeleteConfirmModal';

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

type JobsView = 'list' | 'create' | 'edit';

function jobToFormData(job: Job): Partial<CreateJobFormData> {
  const posted = getPostedJobs().find((item) => item.id === job.id);

  if (posted) {
    return {
      title: posted.title,
      category: posted.category,
      companyName: posted.companyName,
      companyLogoBg: posted.companyLogoBg,
      companyIconType: posted.companyIconType,
      verified: posted.verified,
      location: posted.location,
      city: posted.city ?? '',
      duration: posted.duration,
      type: posted.type,
      experienceLevel: posted.experienceLevel,
      budgetMin: String(posted.budgetMin),
      budgetMax: String(posted.budgetMax),
      expenseLevel: posted.expenseLevel,
      hoursLabel: posted.hoursLabel ?? '',
      postedLabel: posted.postedLabel ?? '',
      skills: posted.skills.join(', '),
      description: posted.descriptionParagraphs?.join('\n\n') ?? posted.description,
      keyResponsibilities: posted.keyResponsibilities?.length ? posted.keyResponsibilities : [''],
      workExperience: posted.workExperience?.length ? posted.workExperience : [''],
      status: job.status,
    };
  }

  return {
    title: job.title,
    companyName: job.company,
    companyLogoBg: job.logoColor,
    status: job.status,
  };
}

export default function DashboardJobs() {
  const [view, setView] = useState<JobsView>('list');
  const [jobs, setJobs] = useState<Job[]>(buildInitialJobs);
  const [activeSubTab, setActiveSubTab] = useState<JobStatus>('Active');
  const [currentPage, setCurrentPage] = useState(2);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const filteredJobs = useMemo(
    () => jobs.filter((job) => job.status === activeSubTab),
    [jobs, activeSubTab],
  );

  const itemsPerPage = 10;
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

  const closeFormPage = () => {
    setView('list');
    setEditingJob(null);
  };

  const openCreatePage = () => {
    setEditingJob(null);
    setView('create');
  };

  const openEditPage = (job: Job) => {
    setEditingJob(job);
    setView('edit');
  };

  const handleCreateSubmit = (data: CreateJobFormData) => {
    const id = `job-${Date.now()}`;
    const dashboardJob = createDashboardJobFromForm(data, id);
    const publicJob = createPublicJobFromForm(data, id);

    addPostedJob(publicJob);
    setJobs((prev) => [dashboardJob, ...prev]);
    setActiveSubTab(dashboardJob.status);
    setCurrentPage(1);
    closeFormPage();
  };

  const handleEditSubmit = (data: CreateJobFormData) => {
    if (!editingJob) return;

    const id = editingJob.id;
    const dashboardJob = createDashboardJobFromForm(data, id);
    const publicJob = createPublicJobFromForm(data, id);

    const payload: Job = {
      ...dashboardJob,
      applications: editingJob.applications,
      createdDate: editingJob.createdDate,
      expiredDate: editingJob.expiredDate,
      logoInitial: editingJob.logoInitial,
    };

    addPostedJob(publicJob);
    setJobs((prev) => prev.map((job) => (job.id === id ? payload : job)));
    setActiveSubTab(payload.status);
    closeFormPage();
  };

  const confirmDelete = () => {
    if (deleteTargetId === null) return;
    setJobs((prev) => prev.filter((job) => job.id !== deleteTargetId));
    setDeleteTargetId(null);
  };

  const subTabClass = (tab: JobStatus) =>
    `relative cursor-pointer pb-4 text-[15px] font-normal tracking-tight transition-all outline-none ${
      activeSubTab === tab
        ? 'font-medium text-black after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:w-full after:bg-black'
        : 'text-neutral-400 hover:text-neutral-900'
    }`;

  if (view === 'create') {
    return <DashboardCreateJob mode="create" onBack={closeFormPage} onSubmit={handleCreateSubmit} />;
  }

  if (view === 'edit' && editingJob) {
    return (
      <DashboardCreateJob
        key={editingJob.id}
        mode="edit"
        initialData={jobToFormData(editingJob)}
        onBack={closeFormPage}
        onSubmit={handleEditSubmit}
      />
    );
  }

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
          onClick={openCreatePage}
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
          onEdit={openEditPage}
          onDelete={setDeleteTargetId}
          onAddClick={openCreatePage}
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

      <DeleteConfirmModal
        open={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
