import type { ScheduleTimeSlot } from '@/components/post-task/ScheduleFields';
import { formatNPR, shortenCommaSeparatedLocation } from '@/lib/nepalLocale';
import { getTimeSlotById } from '@/lib/timeSlot';

export type ProjectScheduleInfo = {
  dateType: 'specific' | 'before' | 'both' | 'flexible' | '';
  specificDate: string;
  beforeDate: string;
  timeOfDayRequired: boolean;
  timeSlot: ScheduleTimeSlot;
};

export interface Project {
  id: string;
  /** Backend task slug when loaded from API */
  slug?: string;
  title: string;
  category: string;
  companyName: string;
  companyLogoBg: string;
  companyIconType: 'wave' | 'face' | 'in' | 'clover';
  verified: boolean;
  location: 'Remote' | 'Hybrid' | 'In-office';
  duration: string;
  type: 'Hourly' | 'Fixed Price' | 'Contract' | 'Full Time';
  experienceLevel: 'Entry Level' | 'Intermediate' | 'Expert';
  budgetLabel: string;
  budgetMin: number;
  budgetMax: number;
  expenseLevel: 'Expensive' | 'Intermediate' | 'Inexpensive';
  description: string;
  skills: string[];
  /** API-backed fields from dashboard form / task */
  languages?: string[];
  freelancerType?: string;
  locationLabel?: string;
  postedDate?: string;
  views?: number;
  attachments?: ProjectAttachment[];
  ownerRating?: number;
  ownerReviews?: number;
  schedule?: ProjectScheduleInfo;
  /** Task owner id — used for Q&A permissions on API-backed projects */
  ownerId?: string;
  /** Owner username for public employer profile links */
  employerSlug?: string;
  /** Poster profile image when loaded from API */
  ownerAvatarUrl?: string;
  /** Business logo initials when no logo image is uploaded */
  employerLogoText?: string;
  /** Loaded from /api/v1/projects/{slug}/ when available */
  questions?: ProjectQuestionItem[];
}

export function getProjectSchedule(project: Project): ProjectScheduleInfo | null {
  const schedule = project.schedule;
  if (!schedule) return null;
  if (
    schedule.dateType ||
    schedule.specificDate ||
    schedule.beforeDate ||
    schedule.timeOfDayRequired
  ) {
    return schedule;
  }
  return null;
}

function formatScheduleDateLabel(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

/** Human-readable value for the metadata grid — "When do you need this done?" */
export function formatProjectScheduleNeedLabel(schedule: ProjectScheduleInfo): string {
  if (schedule.dateType === 'flexible') return "I'm flexible";

  const parts: string[] = [];
  if (schedule.specificDate) {
    parts.push(`On ${formatScheduleDateLabel(schedule.specificDate)}`);
  }
  if (schedule.beforeDate) {
    parts.push(`Before ${formatScheduleDateLabel(schedule.beforeDate)}`);
  }
  if (parts.length) return parts.join(' · ');

  return "I'm flexible";
}

/** Human-readable value for "I need a certain time of day" metadata. */
export function formatProjectTimeOfDayLabel(schedule: ProjectScheduleInfo): string {
  if (!schedule.timeOfDayRequired) return 'Any time';
  const slot = getTimeSlotById(schedule.timeSlot ?? undefined);
  if (slot) return `${slot.label} (${slot.sub})`;
  return 'Preferred time of day';
}

function hourlyLabel(min: number, max: number): string {
  return `${formatNPR(min)} - ${formatNPR(max)}`;
}

const baseProjects: Omit<Project, 'id'>[] = [
  {
    title: 'Food Delivery Mobile App',
    category: 'Design & Creative',
    companyName: 'Mailchimp',
    companyLogoBg: 'bg-[#3366ff]',
    companyIconType: 'face',
    verified: true,
    location: 'Remote',
    duration: '1-5 Days',
    type: 'Hourly',
    experienceLevel: 'Expert',
    budgetMin: 2500,
    budgetMax: 3500,
    budgetLabel: hourlyLabel(2500, 3500),
    expenseLevel: 'Expensive',
    skills: ['Figma', 'Sketch', 'HTML5'],
    description:
      'Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text. Looking for a talented mobile designer to structure high-fidelity components and layouts.',
  },
  {
    title: 'Swift / SwiftUI Developer for B2B iOS apps',
    category: 'Development & IT',
    companyName: 'Slack',
    companyLogoBg: 'bg-[#101426]',
    companyIconType: 'in',
    verified: true,
    location: 'Remote',
    duration: '6-10 Days',
    type: 'Hourly',
    experienceLevel: 'Expert',
    budgetMin: 4000,
    budgetMax: 5000,
    budgetLabel: hourlyLabel(4000, 5000),
    expenseLevel: 'Expensive',
    skills: ['Swift', 'SwiftUI', 'iOS App'],
    description:
      'Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text. Seeking an expert developer to scale custom layout design vectors.',
  },
  {
    title: 'React Frontend Engineer for Visual Sandbox',
    category: 'Development & IT',
    companyName: 'Vercel',
    companyLogoBg: 'bg-[#7941eb]',
    companyIconType: 'face',
    verified: true,
    location: 'Remote',
    duration: '1-5 Days',
    type: 'Hourly',
    experienceLevel: 'Intermediate',
    budgetMin: 1800,
    budgetMax: 2400,
    budgetLabel: hourlyLabel(1800, 2400),
    expenseLevel: 'Intermediate',
    skills: ['React', 'Tailwind CSS', 'Vite'],
    description:
      'Experienced developer needed to handle high-fidelity reactive components, modular styling, and clean API hydration pipelines. We follow rigorous pixel precision standards.',
  },
  {
    title: 'Senior Editorial Brand Copywriter',
    category: 'Writing & Translation',
    companyName: 'Figma',
    companyLogoBg: 'bg-[#e54545]',
    companyIconType: 'wave',
    verified: true,
    location: 'Hybrid',
    duration: '10-15 Days',
    type: 'Contract',
    experienceLevel: 'Intermediate',
    budgetMin: 1200,
    budgetMax: 2000,
    budgetLabel: hourlyLabel(1200, 2000),
    expenseLevel: 'Intermediate',
    skills: ['Copywriting', 'Branding', 'Content Strategy'],
    description:
      'Seeking a senior editorial specialist to author weekly SaaS trends, product updates, and high-conversion subscriber flows with refined storytelling layouts.',
  },
  {
    title: 'PPC Growth Marketer & Google Ads Audit Specialist',
    category: 'Digital Marketing',
    companyName: 'Linear',
    companyLogoBg: 'bg-[#0f766e]',
    companyIconType: 'clover',
    verified: true,
    location: 'Remote',
    duration: '6-10 Days',
    type: 'Fixed Price',
    experienceLevel: 'Expert',
    budgetMin: 3000,
    budgetMax: 4000,
    budgetLabel: hourlyLabel(3000, 4000),
    expenseLevel: 'Expensive',
    skills: ['Google Ads', 'SEM', 'Auditing'],
    description:
      'Help optimize active search networks, perform click rate evaluation audits, restructure conversion tag mechanisms, and output detailed recommendations.',
  },
  {
    title: '2D Motion Designer for SaaS Onboarding Loops',
    category: 'Video & Animation',
    companyName: 'Airbnb',
    companyLogoBg: 'bg-[#e51c5f]',
    companyIconType: 'wave',
    verified: true,
    location: 'In-office',
    duration: '5-10 Days',
    type: 'Hourly',
    experienceLevel: 'Entry Level',
    budgetMin: 1000,
    budgetMax: 1600,
    budgetLabel: hourlyLabel(1000, 1600),
    expenseLevel: 'Inexpensive',
    skills: ['After Effects', 'Lottie Files', 'Motion Graphics'],
    description:
      'Illustrate and animate simple UX workflows into interactive website visualizers. Deliver scalable asset packages suitable for headless integration.',
  },
];

const titlesByCat: Record<string, string[]> = {
  'Design & Creative': [
    'Figma Interface Designer for Web Portal',
    'UI/UX Product Designer for Mobile SaaS',
    'Creative Brand Architect & Identity Designer',
    'Directory Theme Web Layout Designer Props',
    'Senior Iconographer & Design System Lead',
  ],
  'Development & IT': [
    'Senior React Native Mobile Architect',
    'Next.js Development Expert for SSR Client Apps',
    'Full-Stack Node.js Developer with SQL Specialty',
    'Tailwind CSS Web Layout Builder and Integrator',
    'TypeScript Platform Engineer & GraphQL Lead',
  ],
  'Writing & Translation': [
    'Enterprise Technical Copywriter & Editor',
    'SaaS Newsletter Storyteller and Author',
    'Lead Technical Document Specialist & Auditor',
    'SEO Strategy Content Writer and Marketer',
    'Nepali Localization Coordinator',
  ],
  'Digital Marketing': [
    'Facebook & PPC Marketing Lead Specialist',
    'SEO Optimization Consultant & Site Auditor',
    'Growth Marketer & High-Converting Landing Page Builder',
    'E-commerce Growth Specialist & Ads Manager',
    'Social Media Campaign Architect for B2B Startup',
  ],
  'Video & Animation': [
    '3D Generalist & Product Animation Artist',
    'Senior Motion Graphics Video Editor for YouTube',
    'Lottie Animation Developer for Interaction Loops',
    'Explainer Video Storyboarder & Editor',
    'Visual Effects and Particle Loops Designer',
  ],
  'Finance & Accounting': [
    'Venture Pitch Expert & Strategic Pitch Deck Writer',
    'External Fractional CFO and Accounting Analyst',
    'Crypto Portfolio Risk Analyst and Modeler',
    'Corporate Spreadsheet Modeler & Excel Specialist',
    'Audit Compliance lead & Tax Consultant',
  ],
};

export function generateMockProjects(): Project[] {
  const projectsList: Project[] = [];
  const totalItemsNeeded = 320;
  const companies = [
    'Slack',
    'Figma',
    'Stripe',
    'Mailchimp',
    'Airbnb',
    'Vercel',
    'Linear',
    'Webflow',
    'Zoom',
    'GitLab',
    'Notion',
    'Raycast',
    'Retool',
    'Supabase',
    'Upwork',
    'Framer',
  ];
  const companyBgs = [
    'bg-[#3366ff]',
    'bg-[#101426]',
    'bg-[#7941eb]',
    'bg-[#e54545]',
    'bg-[#0f766e]',
    'bg-[#e51c5f]',
    'bg-[#1d4ed8]',
    'bg-[#0369a1]',
    'bg-[#0284c7]',
    'bg-[#4f46e5]',
    'bg-[#0891b2]',
    'bg-[#059669]',
  ];
  const icons: Project['companyIconType'][] = ['wave', 'face', 'in', 'clover'];
  const locations: Project['location'][] = ['Remote', 'Hybrid', 'In-office'];
  const levels: Project['experienceLevel'][] = ['Entry Level', 'Intermediate', 'Expert'];
  const types: Project['type'][] = ['Hourly', 'Fixed Price', 'Contract', 'Full Time'];

  for (let i = 0; i < totalItemsNeeded; i++) {
    const base = baseProjects[i % baseProjects.length];
    const pageNum = Math.floor(i / 8) + 1;
    const itemNumOnPage = (i % 8) + 1;

    let title = base.title;
    if (i >= baseProjects.length) {
      const titleOptions = titlesByCat[base.category] || [base.title];
      title = titleOptions[(pageNum + itemNumOnPage) % titleOptions.length];
    }

    const budgetMinVal = 1000 + (i % 8) * 350;
    const budgetMaxVal = budgetMinVal + 400 + (i % 4) * 150;

    projectsList.push({
      id: `job-${i + 1}`,
      title,
      category: base.category,
      companyName: companies[(i + pageNum) % companies.length],
      companyLogoBg: companyBgs[(i * 3) % companyBgs.length],
      companyIconType: icons[(i + 1) % icons.length],
      verified: i % 2 === 0,
      location: locations[(i + pageNum) % locations.length],
      duration: base.duration,
      type: types[(i + pageNum) % types.length],
      experienceLevel: levels[(i + pageNum) % levels.length],
      budgetMin: budgetMinVal,
      budgetMax: budgetMaxVal,
      budgetLabel: hourlyLabel(budgetMinVal, budgetMaxVal),
      expenseLevel: i % 3 === 0 ? 'Expensive' : i % 3 === 1 ? 'Intermediate' : 'Inexpensive',
      skills: base.skills,
      description: base.description,
    });
  }

  return projectsList;
}

export function locationDisplay(location: Project['location']): string {
  if (location === 'Remote') return 'Kathmandu';
  if (location === 'Hybrid') return 'Lalitpur';
  return 'Pokhara';
}

/** Short label for project cards and headers (API or mock). */
export function formatProjectLocation(project: Project): string {
  if (project.slug?.trim() && project.locationLabel?.trim()) {
    return shortenCommaSeparatedLocation(project.locationLabel, 1);
  }
  return locationDisplay(project.location);
}

export const ALL_PROJECTS = generateMockProjects();

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export type ProjectMeta = {
  locationLabel: string;
  postedDate: string;
  views: number;
};

export function getProjectMeta(project: Project): ProjectMeta {
  const fromApi = Boolean(project.slug?.trim());
  if (fromApi) {
    const raw =
      project.locationLabel?.trim() ||
      `${locationDisplay(project.location)}, Nepal`;
    return {
      locationLabel: shortenCommaSeparatedLocation(raw, 1),
      postedDate: project.postedDate?.trim() || 'Recently posted',
      views: project.views ?? 0,
    };
  }

  const jobNum = parseInt(project.id.replace('job-', ''), 10) || 1;

  if (project.id === 'job-1') {
    return {
      locationLabel: 'London, UK',
      postedDate: 'January 15, 2022',
      views: 902,
    };
  }

  return {
    locationLabel: `${locationDisplay(project.location)}, Nepal`,
    postedDate: `${MONTH_NAMES[jobNum % MONTH_NAMES.length]} ${(jobNum % 27) + 1}, ${2020 + (jobNum % 5)}`,
    views: 400 + ((jobNum * 173) % 900),
  };
}

export type ProjectDetailMeta = {
  sellerType: string;
  durationLabel: string;
  languagesLabel: string;
};

export type ProjectBuyerMeta = {
  rating: number;
  reviews: number;
  buyerLocation: string;
  employees: string;
  department: string;
};

export function getProjectDetailMeta(project: Project): ProjectDetailMeta {
  const fromApi = Boolean(project.slug?.trim());
  if (fromApi) {
    return {
      sellerType: project.freelancerType?.trim() || 'Company',
      durationLabel: project.duration?.trim() || '—',
      languagesLabel: project.languages?.length
        ? project.languages.join(', ')
        : '—',
    };
  }

  const jobNum = parseInt(project.id.replace('job-', ''), 10) || 1;

  return {
    sellerType: 'Company',
    durationLabel: project.id === 'job-1' ? '10-15 Hours' : project.duration,
    languagesLabel: project.id === 'job-1' ? '20 languages' : `${5 + (jobNum % 18)} languages`,
  };
}

export function getProjectBuyerMeta(project: Project): ProjectBuyerMeta {
  const fromApi = Boolean(project.slug?.trim());
  if (fromApi) {
    return {
      rating: project.ownerRating ?? 0,
      reviews: project.ownerReviews ?? 0,
      buyerLocation: project.locationLabel?.trim() || locationDisplay(project.location),
      employees: '—',
      department: project.category,
    };
  }

  const jobNum = parseInt(project.id.replace('job-', ''), 10) || 1;

  if (project.id === 'job-1') {
    return {
      rating: 4.9,
      reviews: 595,
      buyerLocation: 'London',
      employees: '11-20',
      department: 'Designer',
    };
  }

  return {
    rating: Number((4.4 + (jobNum % 6) * 0.1).toFixed(1)),
    reviews: 40 + ((jobNum * 37) % 500),
    buyerLocation: locationDisplay(project.location),
    employees: jobNum % 2 === 0 ? '11-20' : '1-10',
    department: project.category.split(' & ')[0] ?? 'Designer',
  };
}

const PROJECT_DESCRIPTION_PARAGRAPHS = [
  "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.",
  "Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
] as const;

export function getProjectDescriptionParagraphs(project: Project): string[] {
  const fromApi = Boolean(project.slug?.trim());
  const text = project.description?.trim();
  if (fromApi && text) {
    return text
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }
  if (fromApi) return [];
  return [...PROJECT_DESCRIPTION_PARAGRAPHS];
}

export interface ProjectAttachment {
  name: string;
  fileType: string;
  url?: string;
  kind?: 'image' | 'document' | 'video' | 'other';
}

const IMAGE_FILE_TYPES = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp']);
const DOCUMENT_FILE_TYPES = new Set(['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx']);

export const PROJECT_ATTACHMENTS: ProjectAttachment[] = [
  { name: 'Project Brief', fileType: 'PDF', kind: 'document' },
  { name: 'Project Brief', fileType: 'PDF', kind: 'document' },
];

export function getProjectAttachments(project: Project): ProjectAttachment[] {
  if (project.slug?.trim()) {
    return project.attachments ?? [];
  }
  return [...PROJECT_ATTACHMENTS];
}

export function isProjectAttachmentImage(attachment: ProjectAttachment): boolean {
  if (attachment.kind === 'image') return true;
  if (attachment.kind === 'document' || attachment.kind === 'video') return false;
  return IMAGE_FILE_TYPES.has(attachment.fileType.toLowerCase());
}

export function isProjectAttachmentDocument(attachment: ProjectAttachment): boolean {
  if (attachment.kind === 'document') return true;
  if (attachment.kind === 'image' || attachment.kind === 'video') return false;
  return DOCUMENT_FILE_TYPES.has(attachment.fileType.toLowerCase());
}

export function getProjectDocumentAttachments(project: Project): ProjectAttachment[] {
  return getProjectAttachments(project).filter(isProjectAttachmentDocument);
}

export function getProjectGalleryImages(project: Project): string[] {
  return getProjectAttachments(project)
    .filter(isProjectAttachmentImage)
    .map((attachment) => attachment.url?.trim())
    .filter((url): url is string => Boolean(url));
}

export interface ProjectProposalItem {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviews: number;
  rateLabel: string;
  hoursLabel: string;
  submittedAt: string;
  receivedCount: number;
  message: string;
}

const PROPOSAL_FREELANCERS = [
  {
    name: 'Leslie Alexander',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    rating: 4.9,
    reviews: 595,
  },
  {
    name: 'Leslie Alexander',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    rating: 4.9,
    reviews: 595,
  },
  {
    name: 'Leslie Alexander',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    rating: 4.9,
    reviews: 595,
  },
] as const;

const PROPOSAL_MESSAGE =
  'Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text.';

export interface ProjectReviewItem {
  id: string;
  reviewerName: string;
  reviewerRole: string;
  rating: number;
  date: string;
  comment: string;
  likes: number;
  dislikes: number;
}

const PROJECT_REVIEWS_MAP: Record<string, ProjectReviewItem[]> = {
  'job-1': [
    {
      id: 'proj-job1-1',
      reviewerName: 'Theresa Webb',
      reviewerRole: 'Senior UX Designer',
      rating: 5,
      date: 'May 20, 2026',
      comment:
        'Mailchimp outlined milestones clearly for the Food Delivery Mobile App brief. Assets, feedback loops, and payment releases were handled professionally from kickoff through final handoff.',
      likes: 12,
      dislikes: 1,
    },
    {
      id: 'proj-job1-2',
      reviewerName: 'Albert Flores',
      reviewerRole: 'React Developer',
      rating: 4,
      date: 'April 12, 2026',
      comment:
        'Strong project scope and actionable feedback on each deliverable. Credential setup took an extra day, but collaboration with the buyer team was excellent throughout.',
      likes: 8,
      dislikes: 0,
    },
    {
      id: 'proj-job1-3',
      reviewerName: 'Eleanor Pena',
      reviewerRole: 'Product Copywriter',
      rating: 5,
      date: 'March 29, 2026',
      comment:
        'Outstanding buyer experience on this contract. Requirements were documented upfront with minimal revision churn. I would gladly bid on similar Mailchimp projects again.',
      likes: 5,
      dislikes: 0,
    },
  ],
  'job-2': [
    {
      id: 'proj-job2-1',
      reviewerName: 'Annette Black',
      reviewerRole: 'Swift Developer',
      rating: 5,
      date: 'June 01, 2026',
      comment:
        'Slack provided sharp technical specs for the SwiftUI engagement. Communication was fast, milestones were realistic, and approvals came through without unnecessary delays.',
      likes: 15,
      dislikes: 0,
    },
    {
      id: 'proj-job2-2',
      reviewerName: 'Robert Fox',
      reviewerRole: 'iOS Engineer',
      rating: 4,
      date: 'May 15, 2026',
      comment:
        'Well-structured B2B app requirements with clear acceptance criteria. Time zone gaps occasionally slowed reviews, but the overall project management was top tier.',
      likes: 6,
      dislikes: 1,
    },
  ],
};

const PROJECT_REVIEWER_NAMES = [
  'Jane Cooper',
  'Guy Hawkins',
  'Courtney Henry',
  'Robert Fox',
  'Annette Black',
];

const PROJECT_REVIEWER_ROLES = [
  'Freelance Developer',
  'UI/UX Consultant',
  'Product Designer',
  'Full Stack Engineer',
  'Mobile Specialist',
];

const PROJECT_REVIEW_DATES = [
  'May 18, 2026',
  'April 24, 2026',
  'March 12, 2026',
  'February 08, 2026',
  'January 15, 2026',
];

function getProjectSeed(projectId: string): number {
  return projectId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function buildFallbackProjectReviews(project: Project): ProjectReviewItem[] {
  const buyer = project.companyName;
  return [
    {
      id: `${project.id}-rev-1`,
      reviewerName: PROJECT_REVIEWER_NAMES[0],
      reviewerRole: PROJECT_REVIEWER_ROLES[0],
      rating: 5,
      date: PROJECT_REVIEW_DATES[0],
      comment: `Working with ${buyer} on "${project.title}" was smooth and professional. Deliverables were clearly defined, questions were answered promptly, and payment was released on schedule.`,
      likes: 6,
      dislikes: 0,
    },
    {
      id: `${project.id}-rev-2`,
      reviewerName: PROJECT_REVIEWER_NAMES[1],
      reviewerRole: PROJECT_REVIEWER_ROLES[1],
      rating: 4,
      date: PROJECT_REVIEW_DATES[1],
      comment:
        'Excellent brief and structured milestone plan. The buyer gave actionable feedback at each checkpoint and kept the project moving forward.',
      likes: 3,
      dislikes: 0,
    },
    {
      id: `${project.id}-rev-3`,
      reviewerName: PROJECT_REVIEWER_NAMES[2],
      reviewerRole: PROJECT_REVIEWER_ROLES[2],
      rating: 5,
      date: PROJECT_REVIEW_DATES[2],
      comment: `Highly recommend this ${project.category.toLowerCase()} project. Scope matched the listing, communication was respectful, and expectations were realistic throughout.`,
      likes: 5,
      dislikes: 0,
    },
  ];
}

export function buildProjectReviews(project: Project): ProjectReviewItem[] {
  if (PROJECT_REVIEWS_MAP[project.id]) return PROJECT_REVIEWS_MAP[project.id];

  const seed = getProjectSeed(project.id);
  return buildFallbackProjectReviews(project).map((review, index) => ({
    ...review,
    reviewerName: PROJECT_REVIEWER_NAMES[(seed + index) % PROJECT_REVIEWER_NAMES.length],
    reviewerRole: PROJECT_REVIEWER_ROLES[(seed + index * 2) % PROJECT_REVIEWER_ROLES.length],
    date: PROJECT_REVIEW_DATES[(seed + index) % PROJECT_REVIEW_DATES.length],
    likes: 4 + ((seed + index * 3) % 12),
    dislikes: index === 1 && seed % 4 === 0 ? 1 : 0,
  }));
}

export interface ProjectQuestionItem {
  id: string;
  askedByName: string;
  askedByImage?: string;
  question: string;
  answer?: string;
  answeredByName?: string;
  createdAt: string;
  answeredAt?: string;
}

function buildFallbackProjectQuestions(project: Project): ProjectQuestionItem[] {
  const buyer = project.companyName;
  const freelancers = PROPOSAL_FREELANCERS;
  const now = Date.now();

  return [
    {
      id: `${project.id}-q-1`,
      askedByName: freelancers[0].name,
      askedByImage: freelancers[0].avatar,
      question: `What is the expected timeline for the first milestone on "${project.title}"?`,
      answer: `We are targeting the first milestone within the first week. ${buyer} will share a detailed brief after a freelancer is selected.`,
      answeredByName: buyer,
      createdAt: new Date(now - 1000 * 60 * 60 * 28).toISOString(),
      answeredAt: new Date(now - 1000 * 60 * 60 * 20).toISOString(),
    },
    {
      id: `${project.id}-q-2`,
      askedByName: freelancers[1].name,
      askedByImage: freelancers[1].avatar,
      question: 'Is this role fully remote, or are there any on-site requirements?',
      answer:
        project.location === 'Remote'
          ? 'This project is fully remote. All collaboration happens through the platform.'
          : `This is a ${project.location.toLowerCase()} engagement. We will confirm any on-site expectations during onboarding.`,
      answeredByName: buyer,
      createdAt: new Date(now - 1000 * 60 * 60 * 52).toISOString(),
      answeredAt: new Date(now - 1000 * 60 * 60 * 40).toISOString(),
    },
    {
      id: `${project.id}-q-3`,
      askedByName: freelancers[2].name,
      askedByImage: freelancers[2].avatar,
      question: 'Which tools or stack should proposals reference for this project?',
      createdAt: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
    },
  ];
}

export function buildProjectQuestions(project: Project): ProjectQuestionItem[] {
  if (project.questions) return project.questions;
  if (project.slug) return [];
  return buildFallbackProjectQuestions(project);
}

export function buildProjectProposals(project: Project): ProjectProposalItem[] {
  const jobNum = parseInt(project.id.replace('job-', ''), 10) || 1;
  const estimatedHours = [100, 100, 100];

  return PROPOSAL_FREELANCERS.map((freelancer, index) => {
    const rateMin = project.budgetMin - index * 200 + (jobNum % 3) * 50;
    const rateMax = project.budgetMax - index * 150 + (jobNum % 4) * 40;
    const hours = estimatedHours[index] ?? 100;

    return {
      id: `${project.id}-proposal-${index + 1}`,
      name: freelancer.name,
      avatar: freelancer.avatar,
      rating: freelancer.rating,
      reviews: freelancer.reviews,
      rateLabel: hourlyLabel(Math.max(800, rateMin), Math.max(rateMin + 200, rateMax)),
      hoursLabel: `in ${hours} hours`,
      submittedAt: '2 hours ago',
      receivedCount: 1,
      message: PROPOSAL_MESSAGE,
    };
  });
}
