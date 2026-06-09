'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ProjectTable from './ProjectTable';
import type { Project } from './types';

type ProjectStatus = Project['status'];

const STATUS_TABS: ProjectStatus[] = ['Active', 'Pending', 'Ongoing', 'Completed', 'Canceled'];

function buildInitialProjects(): Project[] {
  const list: Project[] = [
    {
      id: 'proj-p1-1',
      title: 'Food Delivery Mobile App',
      location: 'London, UK',
      postedTime: 'April 01, 2023',
      receivedCount: 1,
      category: 'Mobile Development',
      typeCost: '$100 - $150/Hour',
      costVal: 125,
      status: 'Active',
    },
    {
      id: 'proj-p1-2',
      title: 'Swift / SwiftUI Developer for B2B iOS apps',
      location: 'London, UK',
      postedTime: 'April 01, 2023',
      receivedCount: 1,
      category: 'iOS Development',
      typeCost: '$200 - $250/Hour',
      costVal: 225,
      status: 'Active',
    },
    {
      id: 'proj-p1-3',
      title: 'React Native Senior Lead Engineer',
      location: 'Manchester, UK',
      postedTime: 'April 10, 2023',
      receivedCount: 2,
      category: 'Mobile Development',
      typeCost: '$140 - $190/Hour',
      costVal: 165,
      status: 'Pending',
    },
    {
      id: 'proj-p2-1',
      title: 'Creative Figma UI/UX Designer & Prototyper',
      location: 'London, UK',
      postedTime: 'April 9, 2023',
      receivedCount: 5,
      category: 'Design & Creative',
      typeCost: '$75 - $115/Hour',
      costVal: 95,
      status: 'Active',
    },
    {
      id: 'proj-p2-2',
      title: 'Node.js API Architect with Postgres/Prisma',
      location: 'Remote',
      postedTime: 'April 9, 2023',
      receivedCount: 3,
      category: 'Backend Development',
      typeCost: '$110 - $160/Hour',
      costVal: 135,
      status: 'Active',
    },
    {
      id: 'proj-p2-3',
      title: 'Kubernetes DevOps Cloud Security Architect',
      location: 'Berlin, DE',
      postedTime: 'April 9, 2023',
      receivedCount: 4,
      category: 'DevOps & Cloud',
      typeCost: '$180 - $240/Hour',
      costVal: 210,
      status: 'Active',
    },
  ];

  const titles = [
    'Next.js E-commerce Storefront Rebuild',
    'WordPress Membership Portal Migration',
    'SaaS Dashboard Analytics Module',
    'AI Chatbot Integration for Support Desk',
    'Shopify Theme Customization & Speed Fix',
    'PostgreSQL Query Optimization Sprint',
    'Brand Identity & Logo Design Package',
    'Technical SEO Audit & Implementation',
  ];
  const locations = ['London, UK', 'Remote', 'New York, US', 'Berlin, DE', 'Sydney, AU', 'Toronto, CA'];
  const categories = [
    'Web Development',
    'Design & Creative',
    'Mobile Development',
    'Backend Development',
    'Marketing',
    'Data & Analytics',
  ];

  const sampleByStatus: Project[] = [
    {
      id: 'proj-sample-ongoing',
      title: 'Flutter Cross-Platform MVP Build',
      location: 'Remote',
      postedTime: 'March 28, 2023',
      receivedCount: 7,
      category: 'Mobile Development',
      typeCost: '$2.500/Fixed',
      costVal: 2500,
      status: 'Ongoing',
    },
    {
      id: 'proj-sample-completed',
      title: 'Corporate Website Redesign',
      location: 'Paris, FR',
      postedTime: 'February 12, 2023',
      receivedCount: 12,
      category: 'Design & Creative',
      typeCost: '$1.800/Fixed',
      costVal: 1800,
      status: 'Completed',
    },
    {
      id: 'proj-sample-canceled',
      title: 'Legacy PHP Monolith Refactor',
      location: 'Dublin, IE',
      postedTime: 'January 05, 2023',
      receivedCount: 0,
      category: 'Backend Development',
      typeCost: '$90 - $120/Hour',
      costVal: 105,
      status: 'Canceled',
    },
  ];

  list.push(...sampleByStatus);

  for (let i = 6; i < 60; i++) {
    const costVal = 80 + ((i * 45) % 220);
    list.push({
      id: `proj-gen-${i}`,
      title: titles[i % titles.length],
      location: locations[i % locations.length],
      postedTime: 'April 9, 2023',
      receivedCount: 1 + (i % 9),
      category: categories[i % categories.length],
      typeCost: i % 2 === 0 ? `$${costVal} - $${costVal + 50}/Hour` : `$${costVal * 10}.00/Fixed`,
      costVal,
      status: 'Active',
    });
  }

  return list;
}

const EMPTY_FORM = {
  title: '',
  location: 'London, UK',
  postedTime: '',
  receivedCount: '0',
  category: 'Web Development',
  typeCost: '$100 - $150/Hour',
  costVal: '100',
  status: 'Active' as ProjectStatus,
};

export default function DashboardProjects() {
  const [projects, setProjects] = useState<Project[]>(buildInitialProjects);
  const [activeSubTab, setActiveSubTab] = useState<ProjectStatus>('Active');
  const [currentPage, setCurrentPage] = useState(2);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filteredProjects = useMemo(
    () => projects.filter((project) => project.status === activeSubTab),
    [projects, activeSubTab],
  );

  const itemsPerPage = 3;
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedProjects = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, activePage, itemsPerPage]);

  const pageButtonClass = (page: number) =>
    `flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full text-sm font-normal transition-all ${
      activePage === page
        ? 'bg-[#52C47F] font-semibold text-white shadow-sm'
        : 'bg-transparent text-black hover:text-[#52C47F]'
    }`;

  const openAddModal = () => {
    setEditingProject(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setForm({
      title: project.title,
      location: project.location,
      postedTime: project.postedTime,
      receivedCount: String(project.receivedCount),
      category: project.category,
      typeCost: project.typeCost,
      costVal: String(project.costVal),
      status: project.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== id));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const payload: Project = {
      id: editingProject?.id ?? `proj-${Date.now()}`,
      title: form.title.trim(),
      location: form.location.trim() || 'Remote',
      postedTime:
        form.postedTime.trim() ||
        new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      receivedCount: Math.max(0, parseInt(form.receivedCount, 10) || 0),
      category: form.category.trim(),
      typeCost: form.typeCost.trim(),
      costVal: Number(form.costVal) || 0,
      status: form.status,
    };

    if (editingProject) {
      setProjects((prev) => prev.map((project) => (project.id === editingProject.id ? payload : project)));
    } else {
      setProjects((prev) => [payload, ...prev]);
      setActiveSubTab(payload.status);
    }

    setIsModalOpen(false);
    setEditingProject(null);
    setForm(EMPTY_FORM);
    setCurrentPage(1);
  };

  const subTabClass = (tab: ProjectStatus) =>
    `relative cursor-pointer pb-4 text-[15px] font-normal tracking-tight transition-all outline-none ${
      activeSubTab === tab
        ? 'font-medium text-black after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:w-full after:bg-black'
        : 'text-neutral-400 hover:text-neutral-900'
    }`;

  return (
    <div className="animate-in fade-in -mx-4 -my-6 min-h-screen select-none bg-[#f0efec] p-4 font-sans text-black duration-300 sm:-mx-6 sm:p-6 md:-mx-8 md:p-8">
      <div className="mx-auto mb-8 flex max-w-7xl flex-col gap-5 pl-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[34px] font-normal leading-none tracking-tight text-neutral-900">
            Manage Project
          </h1>
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
          <span>Post New Project</span>
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

        <ProjectTable
          projects={paginatedProjects}
          activeSubTab={activeSubTab}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onAddClick={openAddModal}
        />

        {filteredProjects.length > 0 ? (
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
            aria-label="Close project modal"
            onClick={() => setIsModalOpen(false)}
            className="animate-in fade-in absolute inset-0 bg-neutral-900/40 backdrop-blur-sm duration-300"
          />

          <div className="animate-in slide-in-from-bottom-2 relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-neutral-100 bg-white p-6 shadow-2xl duration-300 md:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-4">
              <h3 className="text-lg font-bold text-neutral-900">
                {editingProject ? 'Edit Project' : 'Post New Project'}
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
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Project Title</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Food Delivery Mobile App"
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#52C47F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Location</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="London, UK"
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#52C47F]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProjectStatus }))}
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
                  <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Posted Date</label>
                  <input
                    value={form.postedTime}
                    onChange={(e) => setForm((f) => ({ ...f, postedTime: e.target.value }))}
                    placeholder="April 9, 2023"
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#52C47F]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Proposals Received</label>
                  <input
                    type="number"
                    min={0}
                    value={form.receivedCount}
                    onChange={(e) => setForm((f) => ({ ...f, receivedCount: e.target.value }))}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#52C47F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Category</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    placeholder="Mobile Development"
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#52C47F]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Cost Value</label>
                  <input
                    type="number"
                    min={0}
                    value={form.costVal}
                    onChange={(e) => setForm((f) => ({ ...f, costVal: e.target.value }))}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#52C47F]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Type/Cost</label>
                <input
                  value={form.typeCost}
                  onChange={(e) => setForm((f) => ({ ...f, typeCost: e.target.value }))}
                  placeholder="$100 - $150/Hour"
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#52C47F]"
                />
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
                  {editingProject ? 'Save Changes' : 'Publish Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
