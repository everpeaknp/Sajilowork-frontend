'use client';

import { useState } from 'react';
import { Trash2, Star, ChevronLeft, ChevronRight } from 'lucide-react';

type SavedSubTab = 'services' | 'project' | 'jobs';

interface SavedItem {
  id: string;
  category: string;
  title: string;
  rating: number;
  reviewsCount: number;
  image: string;
  authorName: string;
  authorAvatar: string;
  price: number;
}

const INITIAL_SERVICES: SavedItem[] = [
  {
    id: 'srv-1',
    category: 'Web & App Design',
    title: 'I will design modern websites in figma or adobe xd',
    rating: 4.82,
    reviewsCount: 94,
    image:
      'https://images.unsplash.com/photo-1541462608141-ad4979e458c9?auto=format&fit=crop&w=600&q=80',
    authorName: 'Wanda Runo',
    authorAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    price: 983,
  },
  {
    id: 'srv-2',
    category: 'Art & Illustration',
    title: 'I will create modern flat design illustration',
    rating: 4.82,
    reviewsCount: 94,
    image:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    authorName: 'Ali Tufan',
    authorAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    price: 983,
  },
  {
    id: 'srv-3',
    category: 'Design & Creative',
    title: 'I will build a fully responsive design in HTML,CSS, bootstrap, and javascript',
    rating: 4.82,
    reviewsCount: 94,
    image:
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    authorName: 'Wanda Runo',
    authorAvatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    price: 983,
  },
  {
    id: 'srv-4',
    category: 'Web & App Design',
    title: 'I will do mobile app development for ios and android',
    rating: 4.82,
    reviewsCount: 94,
    image:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
    authorName: 'Wanda Runo',
    authorAvatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    price: 983,
  },
  {
    id: 'srv-5',
    category: 'Web & App Design',
    title: 'I will design interactive SaaS web flow prototypes',
    rating: 4.91,
    reviewsCount: 68,
    image:
      'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=600&q=80',
    authorName: 'Ali Tufan',
    authorAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    price: 850,
  },
  {
    id: 'srv-6',
    category: 'Art & Illustration',
    title: 'I will create geometric minimalist vector portraits',
    rating: 4.75,
    reviewsCount: 110,
    image:
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=600&q=80',
    authorName: 'Wanda Runo',
    authorAvatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    price: 450,
  },
  {
    id: 'srv-7',
    category: 'Design & Creative',
    title: 'I will create a comprehensive corporate identity package',
    rating: 4.88,
    reviewsCount: 52,
    image:
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
    authorName: 'Ali Tufan',
    authorAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    price: 1200,
  },
  {
    id: 'srv-8',
    category: 'Web & App Design',
    title: 'I will craft premium custom dashboard widgets in React',
    rating: 4.96,
    reviewsCount: 81,
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    authorName: 'Wanda Runo',
    authorAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    price: 750,
  },
  {
    id: 'srv-9',
    category: 'Web & App Design',
    title: 'I will integrate robust Stripe checkout flows into your site',
    rating: 4.85,
    reviewsCount: 30,
    image:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80',
    authorName: 'Ali Tufan',
    authorAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    price: 600,
  },
  {
    id: 'srv-10',
    category: 'Art & Illustration',
    title: 'I will render cute 3D editorial icons for landing pages',
    rating: 4.9,
    reviewsCount: 45,
    image:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    authorName: 'Wanda Runo',
    authorAvatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    price: 320,
  },
  {
    id: 'srv-11',
    category: 'Design & Creative',
    title: 'I will curate a custom typographic editorial style brandbook',
    rating: 4.67,
    reviewsCount: 22,
    image:
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    authorName: 'Wanda Runo',
    authorAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    price: 1100,
  },
  {
    id: 'srv-12',
    category: 'Web & App Design',
    title: 'I will optimize mobile loading speeds to 100% on lighthouse',
    rating: 4.99,
    reviewsCount: 61,
    image:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
    authorName: 'Ali Tufan',
    authorAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    price: 900,
  },
  {
    id: 'srv-13',
    category: 'Web & App Design',
    title: 'I will build high fidelity Shopify Plus custom storefront themes',
    rating: 4.88,
    reviewsCount: 39,
    image:
      'https://images.unsplash.com/photo-1541462608141-ad4979e408c9?auto=format&fit=crop&w=600&q=80',
    authorName: 'Wanda Runo',
    authorAvatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    price: 1500,
  },
  {
    id: 'srv-14',
    category: 'Art & Illustration',
    title: 'I will design beautiful custom greeting cards with handlettering',
    rating: 4.8,
    reviewsCount: 19,
    image:
      'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80',
    authorName: 'Ali Tufan',
    authorAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    price: 180,
  },
  {
    id: 'srv-15',
    category: 'Design & Creative',
    title: 'I will produce responsive email template designs with MJML',
    rating: 4.79,
    reviewsCount: 28,
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    authorName: 'Wanda Runo',
    authorAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    price: 440,
  },
  {
    id: 'srv-16',
    category: 'Web & App Design',
    title: 'I will perform comprehensive automated and manual UX audit',
    rating: 4.93,
    reviewsCount: 77,
    image:
      'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=600&q=80',
    authorName: 'Wanda Runo',
    authorAvatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    price: 890,
  },
];

const INITIAL_PROJECTS: SavedItem[] = [
  {
    id: 'proj-1',
    category: 'Mobile Layout',
    title: 'High Fidelity iOS Swift UI Kit design structure',
    rating: 4.95,
    reviewsCount: 12,
    image:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
    authorName: 'Wanda Runo',
    authorAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    price: 1200,
  },
  {
    id: 'proj-2',
    category: 'Web Frontend',
    title: 'Corporate Website Redesign for Global Logistics SaaS',
    rating: 4.88,
    reviewsCount: 29,
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    authorName: 'Ali Tufan',
    authorAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    price: 2400,
  },
  {
    id: 'proj-3',
    category: 'E-Commerce',
    title: 'Modern Minimalist Fashion Storefront UI Concept',
    rating: 4.9,
    reviewsCount: 18,
    image:
      'https://images.unsplash.com/photo-1541462608141-ad4979e408c9?auto=format&fit=crop&w=600&q=80',
    authorName: 'Wanda Runo',
    authorAvatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    price: 1800,
  },
  {
    id: 'proj-4',
    category: 'Fintech Platform',
    title: 'Cryptocurrency Real-Time Tracking Sandbox Dashboard',
    rating: 4.76,
    reviewsCount: 35,
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    authorName: 'Ali Tufan',
    authorAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    price: 3200,
  },
  {
    id: 'proj-5',
    category: 'Healthcare App',
    title: 'Patient Tele-health Scheduling & Consultant Portal',
    rating: 4.92,
    reviewsCount: 42,
    image:
      'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=600&q=80',
    authorName: 'Wanda Runo',
    authorAvatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    price: 4300,
  },
  {
    id: 'proj-6',
    category: 'AR VR Systems',
    title: 'Interactive Architectural Spatial Hologram Mockup',
    rating: 4.85,
    reviewsCount: 16,
    image:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    authorName: 'Wanda Runo',
    authorAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    price: 5500,
  },
  {
    id: 'proj-7',
    category: 'Workspace Tools',
    title: 'Collaborative Real-time Whiteboard Widget Pack',
    rating: 4.8,
    reviewsCount: 22,
    image:
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    authorName: 'Ali Tufan',
    authorAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    price: 1950,
  },
  {
    id: 'proj-8',
    category: 'Machine Learning',
    title: 'Computer Vision Tagging and Dataset Cleaning Utility',
    rating: 4.97,
    reviewsCount: 50,
    image:
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
    authorName: 'Wanda Runo',
    authorAvatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    price: 6800,
  },
  {
    id: 'proj-9',
    category: 'Food Delivery',
    title: 'Local Bistro Direct ordering checkout website',
    rating: 4.7,
    reviewsCount: 14,
    image:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
    authorName: 'Ali Tufan',
    authorAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    price: 1100,
  },
  {
    id: 'proj-10',
    category: 'Travel Booker',
    title: 'Interactive Alpine Cabin Rental list with interactive map',
    rating: 4.94,
    reviewsCount: 31,
    image:
      'https://images.unsplash.com/photo-1541462608141-ad4979e408c9?auto=format&fit=crop&w=600&q=80',
    authorName: 'Wanda Runo',
    authorAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    price: 2200,
  },
];

const INITIAL_JOBS: SavedItem[] = [
  {
    id: 'job-1',
    category: 'React Specialist',
    title: 'Need senior React & Tailwind developer for SaaS portal',
    rating: 4.78,
    reviewsCount: 42,
    image:
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    authorName: 'Wanda Runo',
    authorAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    price: 1540,
  },
  {
    id: 'job-2',
    category: 'Mobile Native',
    title: 'iOS Native Developer needed for modern Swift modular SDK',
    rating: 4.91,
    reviewsCount: 23,
    image:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
    authorName: 'Ali Tufan',
    authorAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    price: 3500,
  },
  {
    id: 'job-3',
    category: 'Backend Node',
    title: 'Build highly optimized REST APIs with Prisma & Postgres',
    rating: 4.85,
    reviewsCount: 19,
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    authorName: 'Wanda Runo',
    authorAvatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    price: 2800,
  },
  {
    id: 'job-4',
    category: 'Creative Lead',
    title: 'Figma UI/UX master needed for comprehensive SaaS dashboard',
    rating: 4.96,
    reviewsCount: 51,
    image:
      'https://images.unsplash.com/photo-1541462608141-ad4979e408c9?auto=format&fit=crop&w=600&q=80',
    authorName: 'Wanda Runo',
    authorAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    price: 1800,
  },
  {
    id: 'job-5',
    category: 'Cloud Ops',
    title: 'AWS DevOps specialist required for containerized CI/CD migration',
    rating: 4.79,
    reviewsCount: 30,
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    authorName: 'Ali Tufan',
    authorAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    price: 4900,
  },
  {
    id: 'job-6',
    category: 'AI Integration',
    title: 'Embed Gemini LLM into custom Customer Service chat interface',
    rating: 4.93,
    reviewsCount: 18,
    image:
      'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=600&q=80',
    authorName: 'Wanda Runo',
    authorAvatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    price: 4000,
  },
  {
    id: 'job-7',
    category: 'Vue Specialist',
    title: 'Senior Vue.js developer for custom CMS integration',
    rating: 4.65,
    reviewsCount: 15,
    image:
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    authorName: 'Ali Tufan',
    authorAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    price: 2100,
  },
  {
    id: 'job-8',
    category: 'Cybersecurity',
    title: 'Perform external white box penetration testing on web application',
    rating: 4.97,
    reviewsCount: 34,
    image:
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
    authorName: 'Wanda Runo',
    authorAvatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    price: 6500,
  },
  {
    id: 'job-9',
    category: 'Marketing Graphic',
    title: 'Need high converting social media graphics banner template',
    rating: 4.8,
    reviewsCount: 11,
    image:
      'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80',
    authorName: 'Ali Tufan',
    authorAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    price: 850,
  },
  {
    id: 'job-10',
    category: 'Next.js Builder',
    title: 'Refactor static landing pages to Next.js App Router structure',
    rating: 4.89,
    reviewsCount: 26,
    image:
      'https://images.unsplash.com/photo-1541462608141-ad4979e408c9?auto=format&fit=crop&w=600&q=80',
    authorName: 'Wanda Runo',
    authorAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    price: 1900,
  },
];

function SavedCard({
  item,
  onDelete,
}: {
  item: SavedItem;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-100 bg-white transition-all hover:shadow-md">
      <div>
        <div className="relative h-[200px] w-full overflow-hidden bg-neutral-100">
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            referrerPolicy="no-referrer"
          />
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-neutral-100 bg-white text-black shadow-sm outline-none transition-all hover:scale-110 hover:text-red-500 active:scale-95"
            title="Remove from bookmarks"
          >
            <Trash2 className="h-4 w-4 text-neutral-800" strokeWidth={1.5} />
          </button>
        </div>

        <div className="space-y-2.5 p-5 pb-4">
          <span className="block text-xs font-normal tracking-tight text-neutral-500">
            {item.category}
          </span>
          <h4 className="line-clamp-2 h-11 text-sm font-normal leading-snug tracking-tight text-black">
            {item.title}
          </h4>
          <div className="flex items-center gap-1.5 text-xs font-normal text-neutral-800">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 stroke-none" />
            <span className="font-normal text-neutral-950">{item.rating.toFixed(2)}</span>
            <span className="font-normal text-neutral-500">{item.reviewsCount} reviews</span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <img
              src={item.authorAvatar}
              alt={item.authorName}
              className="h-7 w-7 shrink-0 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 leading-tight">
              {item.authorName === 'Wanda Runo' ? (
                <div className="text-[11.5px] font-normal text-neutral-800">
                  <span>Wanda</span>
                  <br />
                  <span>Runo</span>
                </div>
              ) : (
                <span className="block truncate text-[11.5px] font-normal text-neutral-800">
                  {item.authorName}
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 text-right leading-none">
            {item.authorName === 'Wanda Runo' ? (
              <div className="text-xs font-normal text-neutral-950">
                <span className="mb-0.5 block text-[10.5px] text-neutral-500">Starting</span>
                <span className="mb-0.5 block text-[11.5px] text-neutral-500">at </span>
                <span className="text-sm font-medium text-black">${item.price}</span>
              </div>
            ) : (
              <div className="text-xs font-normal">
                <span className="text-[10px] text-neutral-500">Starting at </span>
                <span className="text-sm font-medium text-black">${item.price}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardSaved() {
  const [activeSubTab, setActiveSubTab] = useState<SavedSubTab>('services');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [services, setServices] = useState<SavedItem[]>(INITIAL_SERVICES);
  const [projects, setProjects] = useState<SavedItem[]>(INITIAL_PROJECTS);
  const [jobs, setJobs] = useState<SavedItem[]>(INITIAL_JOBS);

  const handleTabChange = (tab: SavedSubTab) => {
    setActiveSubTab(tab);
    setCurrentPage(1);
  };

  const handleDelete = (id: string) => {
    if (activeSubTab === 'services') {
      setServices((prev) => prev.filter((item) => item.id !== id));
    } else if (activeSubTab === 'project') {
      setProjects((prev) => prev.filter((item) => item.id !== id));
    } else {
      setJobs((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const activeList =
    activeSubTab === 'services' ? services : activeSubTab === 'project' ? projects : jobs;
  const activeLabel =
    activeSubTab === 'services' ? 'services' : activeSubTab === 'project' ? 'projects' : 'jobs';

  const totalItems = activeList.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = activeList.slice(indexOfFirstItem, indexOfLastItem);

  const pageButtonClass = (page: number) =>
    `flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full border-0 text-sm font-normal outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#52C47F]/30 ${
      currentPage === page
        ? 'bg-[#52C47F] font-medium text-white shadow-sm'
        : 'bg-transparent text-black hover:text-[#52C47F]'
    }`;

  const subTabClass = (tab: SavedSubTab) =>
    `relative cursor-pointer pb-4 text-[15px] font-normal tracking-tight transition-all outline-none ${
      activeSubTab === tab
        ? 'text-black after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-black'
        : 'text-neutral-500 hover:text-neutral-900'
    }`;

  return (
    <div className="animate-in fade-in -mx-4 -my-6 min-h-screen select-none bg-[#f0efec] p-4 font-sans text-black duration-300 sm:-mx-6 sm:p-6 md:-mx-8 md:p-8">
      <div className="mx-auto max-w-7xl rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] md:p-8">
        <div className="mb-8 flex items-center justify-between border-b border-neutral-100">
          <div className="flex gap-8">
            <button type="button" onClick={() => handleTabChange('services')} className={subTabClass('services')}>
              Services
            </button>
            <button type="button" onClick={() => handleTabChange('project')} className={subTabClass('project')}>
              Project
            </button>
            <button type="button" onClick={() => handleTabChange('jobs')} className={subTabClass('jobs')}>
              Jobs
            </button>
          </div>
        </div>

        {totalItems === 0 ? (
          <div className="py-24 text-center text-sm text-neutral-400">
            No saved {activeSubTab} found.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {currentItems.map((item) => (
                <SavedCard key={item.id} item={item} onDelete={handleDelete} />
              ))}
            </div>

            <div className="mt-10 flex select-none flex-col items-center justify-center gap-4 border-t border-neutral-100 pt-12 font-sans">
              <div className="flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.01)] outline-none transition-all hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-[#52C47F]/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
                >
                  <ChevronLeft className="h-5 w-5 text-black" strokeWidth={1.5} />
                </button>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((page) =>
                    totalPages >= page ? (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={pageButtonClass(page)}
                      >
                        {page}
                      </button>
                    ) : null,
                  )}

                  {totalPages > 5 ? (
                    <span className="pointer-events-none flex h-[44px] w-[44px] select-none items-center justify-center text-sm font-normal text-neutral-400">
                      ...
                    </span>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages)}
                    className={pageButtonClass(totalPages > 5 ? totalPages : 20)}
                  >
                    {totalPages > 5 ? totalPages : 20}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.01)] outline-none transition-all hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-[#52C47F]/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
                >
                  <ChevronRight className="h-5 w-5 text-black" strokeWidth={1.5} />
                </button>
              </div>

              <div className="pt-1 text-sm font-normal tracking-tight text-neutral-800">
                {indexOfFirstItem + 1} – {Math.min(indexOfLastItem, totalItems)} of {totalItems * 5}+{' '}
                {activeLabel} available
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
