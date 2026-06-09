export type FreelancerLevel = 'Entry' | 'Mid' | 'Senior' | 'Expert';

export interface Freelancer {
  id: string;
  name: string;
  role: string;
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

function generateMockFreelancers(): Freelancer[] {
  const baseProfiles: Omit<Freelancer, 'id' | 'ringColor'>[] = [
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

  const list: Freelancer[] = baseProfiles.map((bp, index) => ({
    ...bp,
    id: `fl-${index + 1}`,
    ringColor: RING_COLORS[index % RING_COLORS.length],
  }));

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

    list.push({
      id: `fl-${i + 1}`,
      name: randomizedName,
      role,
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

export const FREELANCER_HERO_PORTRAIT =
  'https://freeio-app-nextjs.vercel.app/_next/image?url=%2Fimages%2Fabout%2Fhome6-hero-img-1.png&w=1200&q=75';

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
