import { MARKETPLACE_HERO_IMAGE } from '@/lib/placeholderImages';

export type FreelancerLevel = 'Entry' | 'Mid' | 'Senior' | 'Expert';

export interface Freelancer {
  id: string;
  username: string;
  name: string;
  role: string;
  headline: string;
  memberSince: string;
  rating: number;
  reviews: number;
  rate: number;
  avatar: string;
  tags: string[];
  location: string;
  availableNow: boolean;
  jobSuccess: number;
  level: FreelancerLevel;
  languages: string[];
  bestSeller: boolean;
  ringColor: string;
}

const MEMBER_MONTHS = [
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
];

export function buildFreelancerHeadline(role: string): string {
  const roleLow = role.toLowerCase();
  if (roleLow.includes('design')) {
    return 'I will design website UI UX in adobe xd or figma';
  }
  if (roleLow.includes('develop') || roleLow.includes('engineer')) {
    return 'I will build fast, scalable web applications for your business';
  }
  if (roleLow.includes('writer') || roleLow.includes('content')) {
    return 'I will write engaging content that converts readers into customers';
  }
  return `Professional ${role.toLowerCase()} services tailored to your project`;
}

export function buildMemberSince(seed: number): string {
  const month = MEMBER_MONTHS[seed % MEMBER_MONTHS.length];
  const year = 2019 + (seed % 6);
  const day = 1 + (seed % 27);
  return `Member since ${month} ${day}, ${year}`;
}

export function getFreelancerSeed(id: string): number {
  const parsed = Number.parseInt(id.replace(/^fl-/, ''), 10);
  return Number.isFinite(parsed) ? parsed : 1;
}

export function buildMemberSinceShort(memberSince: string): string {
  return memberSince.replace(/^Member since /i, '').replace(/ \d+, /, ' ');
}

const ENGLISH_LEVELS = ['Basic', 'Conversational', 'Fluent', 'Native'] as const;

export interface FreelancerAboutStats {
  totalJobs: number;
  totalHours: number;
  inQueue: number;
  lastDelivery: string;
  gender: string;
  englishLevel: string;
  memberSinceShort: string;
  replyMinutes: number;
}

export function buildFreelancerAboutStats(freelancer: Freelancer): FreelancerAboutStats {
  const seed = getFreelancerSeed(freelancer.id);

  return {
    totalJobs: 120 + ((seed * 37) % 800),
    totalHours: 400 + ((seed * 53) % 1200),
    inQueue: 5 + (seed % 20),
    lastDelivery: `${2 + (seed % 6)} days`,
    gender: seed % 2 === 0 ? 'Male' : 'Female',
    englishLevel: ENGLISH_LEVELS[seed % ENGLISH_LEVELS.length],
    memberSinceShort: buildMemberSinceShort(freelancer.memberSince),
    replyMinutes: 8 + (seed % 25),
  };
}

export const FREELANCER_ABOUT_DESCRIPTION = [
  'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English.',
  'Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).',
] as const;

export interface FreelancerEducationItem {
  id: string;
  years: string;
  degree: string;
  institution: string;
  description: string;
  badgeLetter: string;
}

const EDUCATION_DESCRIPTION =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin a ipsum tellus. Interdum et malesuada fames ac ante ipsum primis in faucibus.';

export function buildFreelancerEducation(freelancer: Freelancer): FreelancerEducationItem[] {
  const seed = getFreelancerSeed(freelancer.id);
  const roleLow = freelancer.role.toLowerCase();
  const isDesign = roleLow.includes('design');
  const gradYear = 2012 + (seed % 4);
  const undergradEnd = gradYear;
  const undergradStart = undergradEnd - 4;
  const gradStart = undergradEnd;
  const gradEnd = gradStart + 2;

  const gradDegree = isDesign ? 'Bachelors in Fine Arts' : `Bachelors in ${freelancer.role}`;
  const undergradDegree = isDesign ? 'Computer Science' : 'Diploma in Information Technology';
  const gradSchool = seed % 2 === 0 ? 'Modern College' : 'Kathmandu College of Arts';
  const undergradSchool = seed % 3 === 0 ? 'Tribhuvan University' : 'Pokhara University';

  return [
    {
      id: `${freelancer.id}-edu-1`,
      years: `${gradStart} – ${gradEnd}`,
      degree: gradDegree,
      institution: gradSchool,
      description: EDUCATION_DESCRIPTION,
      badgeLetter: gradSchool.charAt(0).toUpperCase(),
    },
    {
      id: `${freelancer.id}-edu-2`,
      years: `${undergradStart} – ${undergradEnd}`,
      degree: undergradDegree,
      institution: undergradSchool,
      description: EDUCATION_DESCRIPTION,
      badgeLetter: undergradSchool.charAt(0).toUpperCase(),
    },
  ];
}

export interface FreelancerExperienceItem {
  id: string;
  years: string;
  role: string;
  company: string;
  description: string;
  badgeLetter: string;
}

const EXPERIENCE_DESCRIPTION =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin a ipsum tellus. Interdum et malesuada fames ac ante ipsum primis in faucibus.';

const EXPERIENCE_COMPANIES = ['Dropbox', 'Amazon', 'Google', 'Meta', 'Spotify', 'Figma'] as const;
const EXPERIENCE_ROLES = ['UX Designer', 'Art Director', 'Product Designer', 'Frontend Developer'] as const;

export function buildFreelancerExperience(freelancer: Freelancer): FreelancerExperienceItem[] {
  const seed = getFreelancerSeed(freelancer.id);
  const recentEnd = 2014 + (seed % 3);
  const recentStart = recentEnd - 2;
  const earlierEnd = recentStart;
  const earlierStart = earlierEnd - 4;

  const recentRole = seed % 2 === 0 ? 'UX Designer' : freelancer.role;
  const earlierRole = EXPERIENCE_ROLES[seed % EXPERIENCE_ROLES.length];
  const recentCompany = EXPERIENCE_COMPANIES[seed % EXPERIENCE_COMPANIES.length];
  const earlierCompany = EXPERIENCE_COMPANIES[(seed + 2) % EXPERIENCE_COMPANIES.length];

  return [
    {
      id: `${freelancer.id}-exp-1`,
      years: `${recentStart} – ${recentEnd}`,
      role: recentRole,
      company: recentCompany,
      description: EXPERIENCE_DESCRIPTION,
      badgeLetter: recentCompany.charAt(0).toUpperCase(),
    },
    {
      id: `${freelancer.id}-exp-2`,
      years: `${earlierStart} – ${earlierEnd}`,
      role: earlierRole,
      company: earlierCompany,
      description: EXPERIENCE_DESCRIPTION,
      badgeLetter: earlierCompany.charAt(0).toUpperCase(),
    },
  ];
}

export interface FreelancerAwardItem {
  id: string;
  years: string;
  title: string;
  authority: string;
  description: string;
}

const AWARD_DESCRIPTION =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin a ipsum tellus. Interdum et malesuada fames ac ante ipsum primis in faucibus.';

const AWARD_TITLES = ['UI UX Design', 'App Design', 'Web Development', 'Brand Identity'] as const;
const AWARD_AUTHORITIES = ['Udemy', 'Google', 'Coursera', 'LinkedIn Learning'] as const;

export function buildFreelancerAwards(freelancer: Freelancer): FreelancerAwardItem[] {
  const seed = getFreelancerSeed(freelancer.id);
  const recentEnd = 2014 + (seed % 2);
  const recentStart = recentEnd - 2;
  const earlierEnd = recentStart;
  const earlierStart = earlierEnd - 4;

  return [
    {
      id: `${freelancer.id}-award-1`,
      years: `${recentStart} – ${recentEnd}`,
      title: AWARD_TITLES[seed % AWARD_TITLES.length],
      authority: AWARD_AUTHORITIES[seed % AWARD_AUTHORITIES.length],
      description: AWARD_DESCRIPTION,
    },
    {
      id: `${freelancer.id}-award-2`,
      years: `${earlierStart} – ${earlierEnd}`,
      title: AWARD_TITLES[(seed + 1) % AWARD_TITLES.length],
      authority: AWARD_AUTHORITIES[(seed + 1) % AWARD_AUTHORITIES.length],
      description: AWARD_DESCRIPTION,
    },
  ];
}

export interface FreelancerFeaturedServiceItem {
  id: string;
  category: string;
  title: string;
  image: string;
  rating: number;
  reviews: number;
  startingPrice: number;
  description: string;
  details: string[];
}

const FEATURED_SERVICE_TEMPLATES = [
  {
    category: 'Web & App Design',
    title: 'I will design modern websites in figma o...',
    image:
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=400',
    description:
      'Get premium, pixel-perfect user interface design crafted specifically with the highest level of detail in Figma or Adobe XD. Fits all dynamic platforms including responsive web containers and mobile device standards.',
    details: [
      'Interactive high-fidelity clickable prototyping',
      'Ready-to-develop developer handoff assets',
      '100% custom responsive layout interfaces',
    ],
  },
  {
    category: 'Art & Illustration',
    title: 'I will create modern flat design illustr...',
    image:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
    description:
      'Original modern vector flat design illustrations perfectly tailored for websites, landing pages, banners, presentation pitch-decks, and print publications. High custom compatibility.',
    details: [
      '100% original bespoke SVG creations',
      'Harmonious custom color combinations',
      'Source vector file transfers in high detail',
    ],
  },
  {
    category: 'Design & Creative',
    title: 'I will build a fully responsive design i...',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400',
    description:
      'Highly performant and reliable static frontend layouts created with clean code practices. Leverages Tailwind CSS or custom CSS to preserve responsiveness across all viewports.',
    details: [
      'Fully responsive responsive structures',
      'SEO compliant semantic structures',
      'W3C validated clean code templates',
    ],
  },
] as const;

export interface FreelancerReviewItem {
  id: string;
  reviewerName: string;
  reviewerRole: string;
  rating: number;
  date: string;
  comment: string;
  likes: number;
  dislikes: number;
  userVoted?: 'like' | 'dislike';
  isFlagged?: boolean;
}

const FREELANCER_REVIEWER_NAMES = [
  'Theresa Webb',
  'Albert Flores',
  'Eleanor Pena',
  'Annette Black',
  'Robert Fox',
  'Courtney Henry',
] as const;

const FREELANCER_REVIEWER_ROLES = [
  'Startup Founder',
  'Marketing Manager',
  'Product Owner',
  'Creative Director',
  'Operations Lead',
  'E-commerce Manager',
] as const;

const FREELANCER_REVIEW_DATES = [
  'May 20, 2026',
  'April 12, 2026',
  'March 29, 2026',
  'June 01, 2026',
  'May 15, 2026',
] as const;

function buildFreelancerReviewComment(freelancer: Freelancer, index: number): string {
  const templates = [
    `${freelancer.name} delivered exceptional work on our ${freelancer.tags[0] ?? 'design'} project. Communication was clear, milestones were met on time, and revisions were handled professionally. Would hire again without hesitation.`,
    `Great experience working with ${freelancer.name}. The quality exceeded expectations and the handoff was clean. There was a minor delay on one asset, but overall collaboration was smooth and highly productive.`,
    `Outstanding freelancer. ${freelancer.name} understood the brief quickly, asked smart questions, and produced polished deliverables with minimal revision rounds. Highly recommended for ${freelancer.role.toLowerCase()} work.`,
  ];

  return templates[index % templates.length];
}

const FREELANCER_EXTRA_SKILLS = [
  'Software Design',
  'Prototyping',
  'SaaS',
  'Design Writing',
  'Wireframing',
  'UI Systems',
  'Responsive Design',
] as const;

export function buildFreelancerSkills(freelancer: Freelancer): string[] {
  const seed = getFreelancerSeed(freelancer.id);
  const extras = [
    FREELANCER_EXTRA_SKILLS[seed % FREELANCER_EXTRA_SKILLS.length],
    FREELANCER_EXTRA_SKILLS[(seed + 1) % FREELANCER_EXTRA_SKILLS.length],
    FREELANCER_EXTRA_SKILLS[(seed + 2) % FREELANCER_EXTRA_SKILLS.length],
    FREELANCER_EXTRA_SKILLS[(seed + 3) % FREELANCER_EXTRA_SKILLS.length],
  ];

  return [...new Set([...freelancer.tags, ...extras])];
}

export function buildFreelancerReviews(freelancer: Freelancer): FreelancerReviewItem[] {
  const seed = getFreelancerSeed(freelancer.id);

  return [0, 1, 2].map((index) => ({
    id: `${freelancer.id}-rev-${index + 1}`,
    reviewerName: FREELANCER_REVIEWER_NAMES[(seed + index) % FREELANCER_REVIEWER_NAMES.length],
    reviewerRole: FREELANCER_REVIEWER_ROLES[(seed + index * 2) % FREELANCER_REVIEWER_ROLES.length],
    rating: index === 1 ? Math.min(5, Math.max(4, Math.round(freelancer.rating))) : 5,
    date: FREELANCER_REVIEW_DATES[(seed + index) % FREELANCER_REVIEW_DATES.length],
    comment: buildFreelancerReviewComment(freelancer, index),
    likes: 4 + ((seed + index * 3) % 18),
    dislikes: index === 1 && seed % 3 === 0 ? 1 : 0,
  }));
}

export function buildFreelancerFeaturedServices(
  freelancer: Freelancer,
): FreelancerFeaturedServiceItem[] {
  const seed = getFreelancerSeed(freelancer.id);

  return FEATURED_SERVICE_TEMPLATES.map((template, index) => ({
    id: `${freelancer.id}-feat-${index + 1}`,
    category: template.category,
    title: template.title,
    image: template.image,
    rating: Number((freelancer.rating - index * 0.02).toFixed(2)),
    reviews: Math.max(12, freelancer.reviews - index * 7 + (seed % 11)),
    startingPrice: Math.round(freelancer.rate * (2.8 + index * 0.35) + (seed % 9) * 500),
    description: template.description,
    details: [...template.details],
  }));
}

const RING_COLORS = [
  'bg-[#FBE4E7] border-[#F2B0BA]',
  'bg-[#FAF0E3] border-[#E8CBA3]',
  'bg-[#EBF7F2] border-[#A8DBCE]',
  'bg-[#EBF4FA] border-[#AFCBE3]',
];

const AVATAR_POOL = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
];

function slugifyFreelancerUsername(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function uniqueFreelancerUsername(name: string, id: string, used: Set<string>): string {
  const base = slugifyFreelancerUsername(name) || `user-${id.replace(/^fl-/, '')}`;
  let candidate = base;
  let suffix = 2;

  while (used.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  used.add(candidate);
  return candidate;
}

function generateMockFreelancers(): Freelancer[] {
  const usedUsernames = new Set<string>();
  const baseProfiles: Omit<Freelancer, 'id' | 'username' | 'ringColor' | 'headline' | 'memberSince'>[] = [
    {
      name: 'Robert Fox',
      role: 'Nursing Assistant',
      rating: 4.9,
      reviews: 595,
      avatar: AVATAR_POOL[0],
      tags: ['Figma', 'Sketch', 'HTML5'],
      location: 'Kathmandu',
      rate: 2800,
      jobSuccess: 98,
      level: 'Expert',
      languages: ['English', 'Nepali'],
      bestSeller: true,
      availableNow: true,
    },
    {
      name: 'Jane Doe',
      role: 'Graphic Designer',
      rating: 4.8,
      reviews: 423,
      avatar: AVATAR_POOL[1],
      tags: ['Figma', 'Sketch', 'HTML5'],
      location: 'Lalitpur',
      rate: 2600,
      jobSuccess: 98,
      level: 'Senior',
      languages: ['English'],
      bestSeller: true,
      availableNow: true,
    },
    {
      name: 'Michael Johnson',
      role: 'Web Developer',
      rating: 4.7,
      reviews: 312,
      avatar: AVATAR_POOL[2],
      tags: ['Figma', 'Sketch', 'HTML5'],
      location: 'Bhaktapur',
      rate: 3200,
      jobSuccess: 98,
      level: 'Expert',
      languages: ['English', 'Hindi'],
      bestSeller: true,
      availableNow: true,
    },
    {
      name: 'Emily Williams',
      role: 'Content Writer',
      rating: 4.6,
      reviews: 278,
      avatar: AVATAR_POOL[3],
      tags: ['Figma', 'Sketch', 'HTML5'],
      location: 'Pokhara',
      rate: 2200,
      jobSuccess: 98,
      level: 'Mid',
      languages: ['English', 'Nepali'],
      bestSeller: false,
      availableNow: true,
    },
  ];

  const list: Freelancer[] = baseProfiles.map((bp, index) => {
    const id = `fl-${index + 1}`;
    return {
      ...bp,
      id,
      username: uniqueFreelancerUsername(bp.name, id, usedUsernames),
      headline: buildFreelancerHeadline(bp.role),
      memberSince: buildMemberSince(index),
      ringColor: RING_COLORS[index % RING_COLORS.length],
    };
  });

  const names = [
    'Sarah Jenkins',
    'Alex Rivera',
    'Liam Patel',
    'Sophia Martinez',
    'Oliver Bennett',
    'Amelia Fischer',
    'Dmitry Sokolov',
    'Yuki Tanaka',
    'Chloe Robinson',
    'James Wright',
    'Mia Scott',
    'Lucas Carter',
    'Charlotte Lopez',
    'Henry Adams',
    'Avery Wright',
    'Jack Hill',
  ];

  const roles = [
    'UI/UX Architect',
    'React Developer',
    'App Engineer',
    'Logo Specialist',
    'Copywriter',
    'Backend Developer',
    'Maps Specialist',
    'Illustrator',
    'SEO Manager',
    'Fullstack Developer',
    'Framer Animator',
    'Creative Designer',
  ];

  const locations = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan', 'Remote'];
  const levels: FreelancerLevel[] = ['Entry', 'Mid', 'Senior', 'Expert'];
  const languagesPool = [
    ['English'],
    ['English', 'Nepali'],
    ['English', 'Hindi'],
    ['Nepali', 'English'],
    ['Hindi', 'English'],
  ];
  const tagsPool = [
    ['Figma', 'Sketch', 'HTML5'],
    ['React', 'HTML5', 'Sketch'],
    ['Figma', 'React', 'Node.js'],
    ['Figma', 'Framer', 'HTML5'],
    ['Sketch', 'Photoshop', 'Illustrator'],
    ['Node.js', 'Express', 'PostgreSQL'],
  ];

  for (let i = 4; i < 80; i++) {
    const parentName = names[i % names.length];
    const randomizedName = `${parentName} ${String.fromCharCode(65 + (i % 26))}.`;
    const role = roles[i % roles.length];
    const location = locations[i % locations.length];
    const rating = parseFloat((4.5 + (i % 6) * 0.1).toFixed(1));
    const reviews = 45 + ((i * 7) % 400);
    const rate = 1500 + ((i * 5) % 3500);
    const jobSuccess = 90 + ((i * 3) % 11);
    const level = levels[i % levels.length];
    const languages = languagesPool[i % languagesPool.length];
    const tags = tagsPool[i % tagsPool.length];
    const bestSeller = i % 5 === 0;

    const id = `fl-${i + 1}`;
    list.push({
      id,
      username: uniqueFreelancerUsername(randomizedName, id, usedUsernames),
      name: randomizedName,
      role,
      headline: buildFreelancerHeadline(role),
      memberSince: buildMemberSince(i),
      rating,
      reviews,
      avatar: AVATAR_POOL[i % AVATAR_POOL.length],
      tags,
      location,
      rate,
      jobSuccess,
      level,
      languages,
      bestSeller,
      availableNow: i % 3 !== 0,
      ringColor: RING_COLORS[i % RING_COLORS.length],
    });
  }

  return list;
}

export const FREELANCERS_DATA: Freelancer[] = generateMockFreelancers();

export const POPULAR_FREELANCER_TAGS = [
  'Designer',
  'Developer',
  'Web',
  'IOS',
  'PHP',
  'Senior',
  'Engineer',
];

export const FREELANCER_SUGGESTIONS = [
  'UI/UX Designer',
  'React Web Developer',
  'WordPress Specialist',
  'iOS Swift Developer',
  'PHP Laravel Architect',
  'Senior Frontend Engineer',
  'Senior Backend Engineer',
  'Graphic Designer',
  'Logo Branding specialist',
  'Mobile App Developer (Flutter/React Native)',
  'SEO & Content Strategist',
  'AI & Machine Learning Engineer',
];

export const FREELANCER_LOCATION_OPTIONS = [
  { value: '', label: 'City, state, or zip' },
  { value: 'Kathmandu', label: 'Kathmandu' },
  { value: 'Lalitpur', label: 'Lalitpur' },
  { value: 'Bhaktapur', label: 'Bhaktapur' },
  { value: 'Pokhara', label: 'Pokhara' },
  { value: 'Chitwan', label: 'Chitwan' },
  { value: 'Remote', label: 'Remote' },
];

export const FREELANCER_HERO_PORTRAIT = MARKETPLACE_HERO_IMAGE;

export function filterFreelancers(
  freelancers: Freelancer[],
  query: string,
  location: string,
): Freelancer[] {
  if (!query.trim() && !location.trim()) {
    return freelancers;
  }

  const searchLow = query.toLowerCase();
  const locLow = location.toLowerCase();

  return freelancers.filter((freelancer) => {
    const matchSearch =
      !query.trim() ||
      freelancer.name.toLowerCase().includes(searchLow) ||
      freelancer.role.toLowerCase().includes(searchLow) ||
      freelancer.tags.some((tag) => tag.toLowerCase().includes(searchLow));
    const matchLoc =
      !location.trim() || freelancer.location.toLowerCase().includes(locLow);
    return matchSearch && matchLoc;
  });
}
