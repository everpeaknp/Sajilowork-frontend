import { formatNPR } from '@/lib/nepalLocale';

export interface Project {
  id: string;
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
