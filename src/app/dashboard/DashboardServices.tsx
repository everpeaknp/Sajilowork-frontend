'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ServiceTable from './ServiceTable';
import type { Service } from './types';

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

const EMPTY_FORM = {
  title: '',
  category: 'Web & App Design',
  typeCost: '$500.00/Fixed',
  costVal: '500',
  bullets: '',
  image: '',
  status: 'Active' as ServiceStatus,
};

export default function DashboardServices() {
  const [services, setServices] = useState<Service[]>(buildInitialServices);
  const [activeSubTab, setActiveSubTab] = useState<ServiceStatus>('Active');
  const [currentPage, setCurrentPage] = useState(2);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filteredServices = useMemo(
    () => services.filter((svc) => svc.status === activeSubTab),
    [services, activeSubTab],
  );

  const itemsPerPage = 3;
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

  const openAddModal = () => {
    setEditingService(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setForm({
      title: service.title,
      category: service.category,
      typeCost: service.typeCost,
      costVal: String(service.costVal),
      bullets: service.bullets.join('\n'),
      image: service.image,
      status: service.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setServices((prev) => prev.filter((svc) => svc.id !== id));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const bullets = form.bullets
      .split('\n')
      .map((b) => b.trim())
      .filter(Boolean);

    const payload: Service = {
      id: editingService?.id ?? `svc-${Date.now()}`,
      title: form.title.trim(),
      bullets,
      category: form.category,
      typeCost: form.typeCost,
      costVal: Number(form.costVal) || 0,
      status: form.status,
      image:
        form.image.trim() ||
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    };

    if (editingService) {
      setServices((prev) => prev.map((svc) => (svc.id === editingService.id ? payload : svc)));
    } else {
      setServices((prev) => [payload, ...prev]);
      setActiveSubTab(payload.status);
    }

    setIsModalOpen(false);
    setEditingService(null);
    setForm(EMPTY_FORM);
  };

  const subTabClass = (tab: ServiceStatus) =>
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
            Manage Services
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
          onEdit={openEditModal}
          onDelete={handleDelete}
          onAddClick={openAddModal}
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

      {isModalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close service modal"
            onClick={() => setIsModalOpen(false)}
            className="animate-in fade-in absolute inset-0 bg-neutral-900/40 backdrop-blur-sm duration-300"
          />

          <div className="animate-in slide-in-from-bottom-2 relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-neutral-100 bg-white p-6 shadow-2xl duration-300 md:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-4">
              <h3 className="text-lg font-bold text-neutral-900">
                {editingService ? 'Edit Service' : 'Add New Service'}
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
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Title</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="I will design modern websites in figma..."
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#52C47F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Category</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#52C47F]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ServiceStatus }))}
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
                  <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Type/Cost</label>
                  <input
                    value={form.typeCost}
                    onChange={(e) => setForm((f) => ({ ...f, typeCost: e.target.value }))}
                    placeholder="$500.00/Fixed"
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
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                  Feature Bullets (one per line)
                </label>
                <textarea
                  rows={3}
                  value={form.bullets}
                  onChange={(e) => setForm((f) => ({ ...f, bullets: e.target.value }))}
                  placeholder="3 unique homepage concepts&#10;Responsive mobile layouts"
                  className="w-full resize-none rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:ring-2 focus:ring-[#52C47F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Image URL</label>
                <input
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  placeholder="https://..."
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
                  {editingService ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
