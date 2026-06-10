export interface ServicePackage {
  id: 'basic' | 'standard' | 'premium';
  name: string;
  price: number;
  title: string;
  description: string;
  deliveryDays: number;
  revisions: number;
  pageCount: number;
  sourceFile: boolean;
  features: string[];
}

export interface Service {
  id: string;
  category: string;
  title: string;
  rating: number;
  reviews: number;
  views?: number;
  ordersInQueue?: number;
  image: string;
  images?: string[];
  author: {
    name: string;
    avatar: string;
    online: boolean;
    role?: string;
    hourlyRate?: number;
    jobSuccess?: number;
  };
  startingPrice: number;
  deliveryTime: '24h' | '3days' | '7days' | 'anytime';
  budget: number;
  designTool: 'Figma' | 'Sketch' | 'Adobe XD' | 'Illustrator' | 'Photoshop';
  location: 'United States' | 'United Kingdom' | 'Germany' | 'Remote';
  speaks: 'English' | 'Spanish' | 'French' | 'German';
  level: 'New Seller' | 'Level 1' | 'Level 2' | 'Top Rated';
  description?: string;
  aboutIntro?: string;
  aboutOutro?: string;
  servicesProvided?: string[];
  appTypes?: string[];
  designTools?: string[];
  devices?: string[];
  faq?: ServiceFaqItem[];
  reviewsData?: ServiceReviewItem[];
}

export interface ServiceReviewItem {
  id: string;
  reviewerName: string;
  reviewerRole: string;
  rating: number;
  date: string;
  comment: string;
  likes: number;
  dislikes: number;
}

export interface ServiceFaqItem {
  question: string;
  answer: string;
}

export interface ServiceAboutContent {
  intro: string;
  outro: string;
  servicesProvided: string[];
  appTypes: string[];
  designTools: string[];
  devices: string[];
}

const DEFAULT_SERVICES_PROVIDED = [
  'Website Design',
  'Mobile App Design',
  'Brochure Design',
  'Business Card Design',
  'Flyer Design',
];

const DEFAULT_SERVICE_FAQ: ServiceFaqItem[] = [
  {
    question: 'What methods of payments are supported?',
    answer:
      'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable English.',
  },
  {
    question: 'Can I cancel at anytime?',
    answer:
      'You may cancel before work begins without a fee. After an order is in progress, cancellation terms depend on how much work has been completed. Contact the seller or support if you need help resolving a cancellation.',
  },
  {
    question: 'How do I get a receipt for my purchase?',
    answer:
      'A receipt is emailed to you after payment is confirmed. You can also download invoices from your dashboard under Payments or Order history at any time.',
  },
  {
    question: 'Which license do I need?',
    answer:
      'Standard packages include commercial use for one project. If you need extended rights, white-label usage, or resale, message the seller before ordering so the correct license can be added to your package.',
  },
  {
    question: 'How do I get access to a theme I purchased?',
    answer:
      'Source files and deliverables are shared in the order workspace once the seller completes the work. You will receive a notification when files are ready to download.',
  },
];

const DESIGN_TOOL_SETS: Record<Service['designTool'], string[]> = {
  Figma: ['Adobe XD', 'Figma', 'Adobe Photoshop'],
  Sketch: ['Sketch', 'Figma', 'Adobe Photoshop'],
  'Adobe XD': ['Adobe XD', 'Figma', 'Adobe Photoshop'],
  Illustrator: ['Adobe Illustrator', 'Figma', 'Adobe Photoshop'],
  Photoshop: ['Adobe Photoshop', 'Figma', 'Adobe Illustrator'],
};

export const ALL_SERVICES: Service[] = [
  {
    id: 'av-1',
    category: 'Web & App Design',
    title: 'I will design website UI UX in adobe xd or figma',
    rating: 4.82,
    reviews: 94,
    views: 902,
    ordersInQueue: 2,
    image:
      'https://images.unsplash.com/photo-1541462608141-ad4979e408c9?auto=format&fit=crop&q=80&w=400',
    images: [
      'https://images.unsplash.com/photo-1541462608141-ad4979e408c9?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1618005198143-d3663a89228a?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&q=80&w=1200',
    ],
    author: {
      name: 'Eleanor Pena',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
      online: true,
      role: 'UI/UX Designer',
      hourlyRate: 90,
      jobSuccess: 98,
    },
    startingPrice: 8500,
    deliveryTime: '24h',
    budget: 8500,
    designTool: 'Figma',
    location: 'United States',
    speaks: 'English',
    level: 'Level 2',
    description:
      'Professional UI/UX design for websites and web apps. High-fidelity screens, interactive prototypes, and design systems delivered in Figma or Adobe XD.',
    aboutIntro:
      'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable English.',
    aboutOutro:
      'Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for lorem ipsum will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).',
  },
  {
    id: 'av-2',
    category: 'Art & Illustration',
    title: 'I will create modern flat design illustration elements',
    rating: 4.82,
    reviews: 94,
    views: 640,
    ordersInQueue: 1,
    image:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1618005198143-d3663a89228a?auto=format&fit=crop&q=80&w=400',
    ],
    author: {
      name: 'Ali Tufan',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
      online: true,
    },
    startingPrice: 6500,
    deliveryTime: '3days',
    budget: 6500,
    designTool: 'Illustrator',
    location: 'Remote',
    speaks: 'English',
    level: 'Top Rated',
  },
  {
    id: 'av-3',
    category: 'Design & Creative',
    title: 'I will build a fully responsive design in HTML, CSS layout',
    rating: 4.82,
    reviews: 94,
    views: 512,
    ordersInQueue: 0,
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400',
    author: {
      name: 'Wanda Runo',
      avatar:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100',
      online: true,
    },
    startingPrice: 4500,
    deliveryTime: '7days',
    budget: 4500,
    designTool: 'Figma',
    location: 'United Kingdom',
    speaks: 'Spanish',
    level: 'Level 1',
  },
  {
    id: 'av-4',
    category: 'Web & App Design',
    title: 'I will do mobile app development for iOS and Android devices',
    rating: 4.82,
    reviews: 94,
    views: 1180,
    ordersInQueue: 3,
    image:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
    author: {
      name: 'Wanda Runo',
      avatar:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100',
      online: true,
    },
    startingPrice: 12000,
    deliveryTime: '7days',
    budget: 12000,
    designTool: 'Adobe XD',
    location: 'Remote',
    speaks: 'English',
    level: 'Top Rated',
  },
  {
    id: 'av-5',
    category: 'Web & App Design',
    title: 'I will design modern websites in figma or Adobe XD prototype',
    rating: 4.82,
    reviews: 94,
    views: 756,
    ordersInQueue: 1,
    image:
      'https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&q=80&w=400',
    author: {
      name: 'Emma Watson',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
      online: true,
    },
    startingPrice: 9000,
    deliveryTime: '24h',
    budget: 9000,
    designTool: 'Figma',
    location: 'Germany',
    speaks: 'German',
    level: 'Level 2',
  },
  {
    id: 'av-6',
    category: 'Art & Illustration',
    title: 'I will paint modern minimalist canvas backgrounds & assets',
    rating: 4.91,
    reviews: 124,
    views: 430,
    ordersInQueue: 0,
    image:
      'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&q=80&w=400',
    author: {
      name: 'Ali Tufan',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
      online: true,
    },
    startingPrice: 3500,
    deliveryTime: '3days',
    budget: 3500,
    designTool: 'Photoshop',
    location: 'United States',
    speaks: 'English',
    level: 'Level 2',
  },
  {
    id: 'av-7',
    category: 'Design & Creative',
    title: 'I will make responsive design layouts & vector drawings',
    rating: 4.75,
    reviews: 42,
    views: 289,
    ordersInQueue: 0,
    image:
      'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=400',
    author: {
      name: 'Emma Watson',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
      online: true,
    },
    startingPrice: 5500,
    deliveryTime: 'anytime',
    budget: 5500,
    designTool: 'Illustrator',
    location: 'Germany',
    speaks: 'French',
    level: 'New Seller',
  },
  {
    id: 'av-8',
    category: 'Web & App Design',
    title: 'I will create low-fidelity wireframes in Sketch application',
    rating: 4.88,
    reviews: 67,
    views: 367,
    ordersInQueue: 1,
    image:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
    author: {
      name: 'Marcus Thorne',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
      online: false,
    },
    startingPrice: 4800,
    deliveryTime: '3days',
    budget: 4800,
    designTool: 'Sketch',
    location: 'United Kingdom',
    speaks: 'English',
    level: 'Level 1',
  },
  {
    id: 'av-9',
    category: 'Design & Creative',
    title: 'I will construct pristine vector mockups for high-tier companies',
    rating: 4.98,
    reviews: 180,
    views: 1540,
    ordersInQueue: 4,
    image:
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=400',
    author: {
      name: 'Marcus Thorne',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
      online: false,
    },
    startingPrice: 15000,
    deliveryTime: '24h',
    budget: 15000,
    designTool: 'Figma',
    location: 'United States',
    speaks: 'English',
    level: 'Top Rated',
  },
];

const LOCATION_LABELS: Record<Service['location'], string> = {
  'United States': 'New York',
  'United Kingdom': 'London',
  Germany: 'Berlin',
  Remote: 'Remote',
};

const GALLERY_FALLBACKS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1618005198143-d3663a89228a?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&q=80&w=800',
];

const SERVICE_GALLERY_MAX = 5;

export function getServiceGallery(service: Service): string[] {
  if (service.images?.length) return service.images.slice(0, SERVICE_GALLERY_MAX);
  return [service.image, ...GALLERY_FALLBACKS].slice(0, SERVICE_GALLERY_MAX);
}

export function getDeliveryLabel(service: Service): string {
  switch (service.deliveryTime) {
    case '24h':
      return '1-3 Days';
    case '3days':
      return '3 Days';
    case '7days':
      return '7 Days';
    default:
      return 'Flexible';
  }
}

export function getEnglishLevel(service: Service): string {
  if (service.level === 'Top Rated' || service.level === 'Level 2') return 'Professional';
  if (service.level === 'Level 1') return 'Fluent';
  return 'Conversational';
}

export function getLocationLabel(service: Service): string {
  return LOCATION_LABELS[service.location];
}

export function getServicePackages(service: Service): ServicePackage[] {
  const base = service.startingPrice;

  return [
    {
      id: 'basic',
      name: 'Basic',
      price: base,
      title: 'High-converting Landing Pages',
      description:
        'I will redesign your current landing page or create one for you (upto 4 sections)',
      deliveryDays: 2,
      revisions: 1,
      pageCount: 2,
      sourceFile: true,
      features: ['2 Page / Screen', 'Source file'],
    },
    {
      id: 'standard',
      name: 'Standard',
      price: Math.round(base * 1.6),
      title: 'Full Website UI Kit',
      description:
        'Complete homepage plus inner pages with responsive layouts and component library',
      deliveryDays: 3,
      revisions: 3,
      pageCount: 4,
      sourceFile: true,
      features: ['4 Page / Screen', 'Source file', 'Prototype'],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: Math.round(base * 2.4),
      title: 'End-to-end Product Design',
      description:
        'Research, wireframes, high-fidelity UI, prototype, and handoff documentation',
      deliveryDays: 4,
      revisions: 5,
      pageCount: 6,
      sourceFile: true,
      features: ['6 Page / Screen', 'Source file', 'Prototype', 'Design system'],
    },
  ];
}

export function getServiceFaq(service: Service): ServiceFaqItem[] {
  return service.faq ?? DEFAULT_SERVICE_FAQ;
}

export function getServiceAbout(service: Service): ServiceAboutContent {
  return {
    intro:
      service.aboutIntro ??
      service.description ??
      `Professional ${service.category.toLowerCase()} delivered by ${service.author.name}. I focus on clean layouts, clear hierarchy, and designs that convert visitors into customers.`,
    outro:
      service.aboutOutro ??
      `I work closely with clients through every stage — from wireframes and mood boards to polished UI files ready for development. Delivery is on time, revisions are included, and source files are always provided.`,
    servicesProvided: service.servicesProvided ?? DEFAULT_SERVICES_PROVIDED,
    appTypes: service.appTypes ?? ['Business', 'Food & drink', 'Graphics & design'],
    designTools: service.designTools ?? DESIGN_TOOL_SETS[service.designTool],
    devices: service.devices ?? ['Mobile', 'Desktop'],
  };
}

export function getSellerMeta(service: Service) {
  return {
    role: service.author.role ?? service.category,
    hourlyRate: service.author.hourlyRate ?? Math.round(service.startingPrice / 10),
    jobSuccess: service.author.jobSuccess ?? 96,
    location: getLocationLabel(service),
  };
}

export function getServiceMeta(service: Service) {
  return {
    views: service.views ?? 420,
    ordersInQueue: service.ordersInQueue ?? 0,
    gallery: getServiceGallery(service),
  };
}

const SERVICE_REVIEWS_MAP: Record<string, ServiceReviewItem[]> = {
  'av-1': [
    {
      id: 'srv-av1-1',
      reviewerName: 'Kristin Watson',
      reviewerRole: 'Startup Founder',
      rating: 5,
      date: 'May 22, 2026',
      comment:
        'Eleanor delivered a stunning UI kit in Figma with clean components and thoughtful spacing. The landing page design converted better than our previous version and handoff to dev was seamless.',
      likes: 14,
      dislikes: 0,
    },
    {
      id: 'srv-av1-2',
      reviewerName: 'Albert Flores',
      reviewerRole: 'Product Manager',
      rating: 4,
      date: 'April 18, 2026',
      comment:
        'Great communication and fast turnaround on wireframes and high-fidelity screens. One revision round was needed for mobile breakpoints, but the final Adobe XD files were well organized.',
      likes: 9,
      dislikes: 1,
    },
    {
      id: 'srv-av1-3',
      reviewerName: 'Theresa Webb',
      reviewerRole: 'Marketing Director',
      rating: 5,
      date: 'March 30, 2026',
      comment:
        'Professional service from start to finish. Prototypes were interactive, documentation was clear, and the seller went above and beyond on the design system tokens.',
      likes: 11,
      dislikes: 0,
    },
  ],
};

const SERVICE_REVIEWER_NAMES = [
  'Jane Cooper',
  'Guy Hawkins',
  'Courtney Henry',
  'Robert Fox',
  'Annette Black',
];

const SERVICE_REVIEWER_ROLES = [
  'Business Owner',
  'Product Manager',
  'Marketing Lead',
  'Startup Founder',
  'Operations Manager',
];

const SERVICE_REVIEW_DATES = [
  'May 18, 2026',
  'April 24, 2026',
  'March 12, 2026',
  'February 08, 2026',
  'January 15, 2026',
];

function getServiceSeed(serviceId: string): number {
  return serviceId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function buildFallbackServiceReviews(service: Service): ServiceReviewItem[] {
  const seller = service.author.name;
  return [
    {
      id: `${service.id}-rev-1`,
      reviewerName: SERVICE_REVIEWER_NAMES[0],
      reviewerRole: SERVICE_REVIEWER_ROLES[0],
      rating: 5,
      date: SERVICE_REVIEW_DATES[0],
      comment: `${seller} delivered exactly what was promised for "${service.title}". Files were organized, revisions were handled quickly, and the overall quality exceeded expectations.`,
      likes: 6,
      dislikes: 0,
    },
    {
      id: `${service.id}-rev-2`,
      reviewerName: SERVICE_REVIEWER_NAMES[1],
      reviewerRole: SERVICE_REVIEWER_ROLES[1],
      rating: Math.min(5, Math.max(4, Math.round(service.rating))),
      date: SERVICE_REVIEW_DATES[1],
      comment:
        'Smooth ordering experience with clear milestones and responsive messaging. Would hire again for similar design work.',
      likes: 3,
      dislikes: 0,
    },
    {
      id: `${service.id}-rev-3`,
      reviewerName: SERVICE_REVIEWER_NAMES[2],
      reviewerRole: SERVICE_REVIEWER_ROLES[2],
      rating: 5,
      date: SERVICE_REVIEW_DATES[2],
      comment: `Excellent attention to detail on this ${service.category.toLowerCase()} package. Delivery was on schedule and source files were included as described.`,
      likes: 5,
      dislikes: 0,
    },
  ];
}

export function buildServiceReviews(service: Service): ServiceReviewItem[] {
  if (service.reviewsData?.length) return service.reviewsData;
  if (SERVICE_REVIEWS_MAP[service.id]) return SERVICE_REVIEWS_MAP[service.id];

  const seed = getServiceSeed(service.id);
  return buildFallbackServiceReviews(service).map((review, index) => ({
    ...review,
    reviewerName: SERVICE_REVIEWER_NAMES[(seed + index) % SERVICE_REVIEWER_NAMES.length],
    reviewerRole: SERVICE_REVIEWER_ROLES[(seed + index * 2) % SERVICE_REVIEWER_ROLES.length],
    date: SERVICE_REVIEW_DATES[(seed + index) % SERVICE_REVIEW_DATES.length],
    likes: 4 + ((seed + index * 3) % 12),
    dislikes: index === 1 && seed % 4 === 0 ? 1 : 0,
  }));
}
