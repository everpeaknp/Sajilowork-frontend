'use client';

import { useMemo, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import ServiceTable from './ServiceTable';
import DashboardCreateService, {
  createServiceFromForm,
  type CreateServiceFormData,
} from './DashboardCreateService';
import type { FormUploadsPayload, Service } from './types';
import DeleteConfirmModal from './DeleteConfirmModal';
import { initialGalleryUrls, resolveGalleryUploads } from './uploadUtils';

type ServiceStatus = Service['status'];

const STATUS_TABS: ServiceStatus[] = ['Active', 'Pending', 'Ongoing', 'Completed', 'Canceled'];

const SERVICE_IMAGES = [
  'https://images.unsplash.com/photo-1541462608141-ad4979e458c9?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
];

function buildInitialServices(): Service[] {
  const list: Service[] = [
    {
      id: 'svc-p1-1',
      title: 'I will design modern websites in figma or adobe xd',
      bullets: ['3 unique homepage concepts', 'Responsive mobile layouts', 'Developer handoff specs'],
      category: 'Web & App Design',
      typeCost: '$500.00/Fixed',
      costVal: 500,
      status: 'Active',
      image: SERVICE_IMAGES[0],
    },
    {
      id: 'svc-p1-2',
      title: 'I will create modern flat design illustration',
      bullets: ['Custom vector artwork', 'Commercial usage rights', 'Source files included'],
      category: 'Art & Illustration',
      typeCost: '$350.00/Fixed',
      costVal: 350,
      status: 'Active',
      image: SERVICE_IMAGES[1],
    },
    {
      id: 'svc-p1-3',
      title: 'I will build a fully responsive design in HTML, CSS, bootstrap, and javascript',
      bullets: ['Pixel-perfect conversion', 'Cross-browser testing', 'Performance optimized'],
      category: 'Design & Creative',
      typeCost: '$75.00/Hour',
      costVal: 75,
      status: 'Pending',
      image: SERVICE_IMAGES[2],
    },
    {
      id: 'svc-p2-1',
      title: 'I will design website UI UX in adobe xd or figma',
      bullets: ['Wireframe to high-fidelity UI', 'Interactive component library', 'Design QA support'],
      category: 'Web & App Design',
      typeCost: '$829.00/Fixed',
      costVal: 829,
      status: 'Active',
      image: SERVICE_IMAGES[3],
    },
    {
      id: 'svc-p2-2',
      title: 'I will design website UI UX in adobe xd or figma',
      bullets: ['Mobile-first responsive screens', 'Auto-layout Figma systems', 'Export-ready assets'],
      category: 'Web & App Design',
      typeCost: '$829.00/Fixed',
      costVal: 829,
      status: 'Active',
      image: SERVICE_IMAGES[4],
    },
    {
      id: 'svc-p2-3',
      title: 'Tailwind CSS responsive code overhaul and theme support',
      bullets: ['Dark mode token mapping', 'Utility class cleanup', 'Component refactor pass'],
      category: 'Design & Creative',
      typeCost: '$829.00/Fixed',
      costVal: 829,
      status: 'Active',
      image: SERVICE_IMAGES[5],
    },
  ];

  const titles = [
    'I will optimize NextJS React application performance',
    'I will create Stripe checkout and subscription flows',
    'I will build custom WordPress themes with Gutenberg blocks',
    'I will develop REST API gateways with secure auth',
    'I will craft premium dashboard widgets in React',
    'I will design brand identity and logo systems',
    'I will implement SEO-ready landing page structures',
    'I will animate micro-interactions with Framer Motion',
  ];
  const categories = ['Web & App Design', 'Art & Illustration', 'Design & Creative', 'Development & IT'];
  const bulletsPool = [
    ['Fast delivery turnaround', 'Unlimited revisions', 'Source files included'],
    ['Pixel-perfect handoff', 'Responsive breakpoints', 'Accessibility checked'],
    ['SEO optimized markup', 'Performance tuned assets', 'Cross-browser tested'],
  ];

  const sampleByStatus: Service[] = [
    {
      id: 'svc-sample-ongoing',
      title: 'I will do mobile app development for ios and android',
      bullets: ['React Native builds', 'App Store deployment', 'Push notification setup'],
      category: 'Web & App Design',
      typeCost: '$1.200.00/Fixed',
      costVal: 1200,
      status: 'Ongoing',
      image: SERVICE_IMAGES[3],
    },
    {
      id: 'svc-sample-completed',
      title: 'I will design interactive SaaS web flow prototypes',
      bullets: ['User journey mapping', 'Clickable Figma prototype', 'Design system tokens'],
      category: 'Web & App Design',
      typeCost: '$850.00/Fixed',
      costVal: 850,
      status: 'Completed',
      image: SERVICE_IMAGES[4],
    },
    {
      id: 'svc-sample-canceled',
      title: 'I will create geometric minimalist vector portraits',
      bullets: ['High-resolution export', '2 revision rounds', 'Fast 48h delivery'],
      category: 'Art & Illustration',
      typeCost: '$120.00/Fixed',
      costVal: 120,
      status: 'Canceled',
      image: SERVICE_IMAGES[5],
    },
  ];

  list.push(...sampleByStatus);

  for (let i = 6; i < 60; i++) {
    const costVal = 200 + ((i * 95) % 1800);

    list.push({
      id: `svc-gen-${i}`,
      title: titles[i % titles.length],
      bullets: bulletsPool[i % bulletsPool.length],
      category: categories[i % categories.length],
      typeCost: i % 3 === 0 ? `$${costVal}.00/Hour` : `$${costVal}.00/Fixed`,
      costVal,
      status: 'Active',
      image: SERVICE_IMAGES[i % SERVICE_IMAGES.length],
    });
  }

  return list;
}

type ServicesView = 'list' | 'create' | 'edit';

function serviceToFormData(service: Service): Partial<CreateServiceFormData> {
  return {
    title: service.title,
    price: String(service.costVal),
    category: service.category,
    serviceDetail: service.bullets.join('\n'),
  };
}

export default function DashboardServices() {
  const [services, setServices] = useState<Service[]>(buildInitialServices);
  const [activeSubTab, setActiveSubTab] = useState<ServiceStatus>('Active');
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState<ServicesView>('list');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const filteredServices = useMemo(
    () => services.filter((svc) => svc.status === activeSubTab),
    [services, activeSubTab],
  );

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredServices.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedServices = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return filteredServices.slice(start, start + itemsPerPage);
  }, [filteredServices, activePage, itemsPerPage]);

  const pageButtonClass = (page: number) =>
    `flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full text-sm font-normal transition-all ${
      activePage === page
        ? 'bg-[#52C47F] font-semibold text-white shadow-sm'
        : 'bg-transparent text-black hover:text-[#52C47F]'
    }`;

  const closeFormPage = () => {
    setView('list');
    setEditingService(null);
  };

  const openCreatePage = () => {
    setEditingService(null);
    setView('create');
  };

  const openEditPage = (service: Service) => {
    setEditingService(service);
    setView('edit');
  };

  const handleCreateSubmit = (data: CreateServiceFormData, uploads: FormUploadsPayload) => {
    const resolved = resolveGalleryUploads(uploads.galleryFiles, uploads.keptGalleryUrls);
    const payload: Service = {
      id: `svc-${Date.now()}`,
      ...createServiceFromForm(data, resolved.image),
      gallery: resolved.gallery,
    };
    setServices((prev) => [payload, ...prev]);
    setActiveSubTab(payload.status);
    setCurrentPage(1);
    closeFormPage();
  };

  const handleEditSubmit = (data: CreateServiceFormData, uploads: FormUploadsPayload) => {
    if (!editingService) return;

    const resolved = resolveGalleryUploads(
      uploads.galleryFiles,
      uploads.keptGalleryUrls,
      editingService.image,
    );
    const payload: Service = {
      id: editingService.id,
      ...createServiceFromForm(data, resolved.image),
      gallery: resolved.gallery,
      status: editingService.status,
    };

    setServices((prev) => prev.map((svc) => (svc.id === editingService.id ? payload : svc)));
    closeFormPage();
  };

  const confirmDelete = () => {
    if (deleteTargetId === null) return;
    setServices((prev) => prev.filter((svc) => svc.id !== deleteTargetId));
    setDeleteTargetId(null);
  };

  const subTabClass = (tab: ServiceStatus) =>
    `relative cursor-pointer pb-4 text-[15px] font-normal tracking-tight transition-all outline-none ${
      activeSubTab === tab
        ? 'font-medium text-black after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:w-full after:bg-black'
        : 'text-neutral-400 hover:text-neutral-900'
    }`;

  if (view === 'create') {
    return <DashboardCreateService mode="create" onBack={closeFormPage} onSubmit={handleCreateSubmit} />;
  }

  if (view === 'edit' && editingService) {
    return (
      <DashboardCreateService
        key={editingService.id}
        mode="edit"
        initialData={serviceToFormData(editingService)}
        initialGalleryUrls={initialGalleryUrls(editingService.image, editingService.gallery)}
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
            Manage Services
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
          <span>Add New Service</span>
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

        <ServiceTable
          services={paginatedServices}
          activeSubTab={activeSubTab}
          onEdit={openEditPage}
          onDelete={setDeleteTargetId}
          onAddClick={openCreatePage}
        />

        {filteredServices.length > 0 ? (
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
