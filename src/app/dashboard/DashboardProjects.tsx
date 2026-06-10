'use client';

import { useMemo, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import ProjectTable from './ProjectTable';
import DashboardCreateProject, { createProjectFromForm, type CreateProjectFormData } from './DashboardCreateProject';
import type { FormUploadsPayload, Project } from './types';
import DeleteConfirmModal from './DeleteConfirmModal';
import { resolveAttachmentUploads } from './uploadUtils';

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

type ProjectsView = 'list' | 'create' | 'edit';

function projectToFormData(project: Project): Partial<CreateProjectFormData> {
  const normalizedLocation = project.location.trim();
  const isRemote = normalizedLocation.toLowerCase() === 'remote';
  const priceType = project.typeCost.toLowerCase().includes('hour') ? 'Hourly' : 'Fixed Price';

  return {
    title: project.title,
    category: project.category,
    cost: String(project.costVal),
    priceType,
    locationType: isRemote ? 'remote' : 'in-person',
    location: isRemote ? 'Remote' : normalizedLocation,
  };
}

export default function DashboardProjects() {
  const [projects, setProjects] = useState<Project[]>(buildInitialProjects);
  const [activeSubTab, setActiveSubTab] = useState<ProjectStatus>('Active');
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState<ProjectsView>('list');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const filteredProjects = useMemo(
    () => projects.filter((project) => project.status === activeSubTab),
    [projects, activeSubTab],
  );

  const itemsPerPage = 10;
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

  const closeFormPage = () => {
    setView('list');
    setEditingProject(null);
  };

  const openCreatePage = () => {
    setEditingProject(null);
    setView('create');
  };

  const openEditPage = (project: Project) => {
    setEditingProject(project);
    setView('edit');
  };

  const handleCreateSubmit = (data: CreateProjectFormData, uploads: FormUploadsPayload) => {
    const attachments = resolveAttachmentUploads(uploads.attachmentFiles, uploads.keptAttachments);
    const payload: Project = {
      id: `proj-${Date.now()}`,
      ...createProjectFromForm(data),
      attachments: attachments.length ? attachments : undefined,
    };
    setProjects((prev) => [payload, ...prev]);
    setActiveSubTab(payload.status);
    setCurrentPage(1);
    closeFormPage();
  };

  const handleEditSubmit = (data: CreateProjectFormData, uploads: FormUploadsPayload) => {
    if (!editingProject) return;

    const attachments = resolveAttachmentUploads(uploads.attachmentFiles, uploads.keptAttachments);
    const payload: Project = {
      id: editingProject.id,
      ...createProjectFromForm(data),
      attachments: attachments.length ? attachments : undefined,
      status: editingProject.status,
      postedTime: editingProject.postedTime,
      receivedCount: editingProject.receivedCount,
    };

    setProjects((prev) => prev.map((project) => (project.id === editingProject.id ? payload : project)));
    closeFormPage();
  };

  const confirmDelete = () => {
    if (deleteTargetId === null) return;
    setProjects((prev) => prev.filter((project) => project.id !== deleteTargetId));
    setDeleteTargetId(null);
  };

  const subTabClass = (tab: ProjectStatus) =>
    `relative cursor-pointer pb-4 text-[15px] font-normal tracking-tight transition-all outline-none ${
      activeSubTab === tab
        ? 'font-medium text-black after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:w-full after:bg-black'
        : 'text-neutral-400 hover:text-neutral-900'
    }`;

  if (view === 'create') {
    return <DashboardCreateProject mode="create" onBack={closeFormPage} onSubmit={handleCreateSubmit} />;
  }

  if (view === 'edit' && editingProject) {
    return (
      <DashboardCreateProject
        key={editingProject.id}
        mode="edit"
        initialData={projectToFormData(editingProject)}
        initialAttachments={editingProject.attachments ?? []}
        onBack={closeFormPage}
        onSubmit={handleEditSubmit}
      />
    );
  }

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
          onClick={openCreatePage}
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
          onEdit={openEditPage}
          onDelete={setDeleteTargetId}
          onAddClick={openCreatePage}
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

      <DeleteConfirmModal
        open={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
