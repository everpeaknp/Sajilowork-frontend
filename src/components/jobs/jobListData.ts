export interface Job {
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

function budgetLabel(min: number, max: number): string {
  const fmt = (n: number) =>
    n >= 1000 ? `Rs. ${Math.round(n / 1000)}k` : `Rs. ${n}`;
  return `${fmt(min)}–${fmt(max)}`;
}

const baseJobs: Omit<Job, 'id'>[] = [
  {
    title: 'Website Designer Required For Directory Theme',
    category: 'Design & Creative',
    companyName: 'Mailchimp',
    companyLogoBg: 'bg-[#192338]',
    companyIconType: 'wave',
    verified: true,
    location: 'Remote',
    duration: '1-5 Days',
    type: 'Hourly',
    experienceLevel: 'Expert',
    budgetMin: 85000,
    budgetMax: 95000,
    budgetLabel: budgetLabel(85000, 95000),
    expenseLevel: 'Expensive',
    skills: ['Figma', 'UI/UX Design', 'Directory Theme', 'Component Library'],
    description:
      'Looking for an elite visual website designer to structure a modern Directory and Listings Theme in Figma. Needs high focus on layout grid aesthetics, typography, and clear visual hierarchy.',
  },
  {
    title: 'React Frontend Engineer for Visual Sandbox',
    category: 'Development & IT',
    companyName: 'Vercel',
    companyLogoBg: 'bg-[#3f3ebd]',
    companyIconType: 'face',
    verified: true,
    location: 'Remote',
    duration: '1-5 Days',
    type: 'Hourly',
    experienceLevel: 'Expert',
    budgetMin: 90000,
    budgetMax: 110000,
    budgetLabel: budgetLabel(90000, 110000),
    expenseLevel: 'Expensive',
    skills: ['React', 'Tailwind CSS', 'Vite', 'Headless CMS'],
    description:
      'Experienced developer needed to handle high-fidelity reactive components, modular styling, and clean API hydration pipelines.',
  },
  {
    title: 'Senior Editorial Brand Copywriter',
    category: 'Writing & Translation',
    companyName: 'Slack',
    companyLogoBg: 'bg-[#ff1a53]',
    companyIconType: 'in',
    verified: true,
    location: 'Remote',
    duration: '1-5 Days',
    type: 'Hourly',
    experienceLevel: 'Expert',
    budgetMin: 75000,
    budgetMax: 90000,
    budgetLabel: budgetLabel(75000, 90000),
    expenseLevel: 'Expensive',
    skills: ['Content Writing', 'Copywriting', 'Newsletter Design', 'Brand Voice'],
    description:
      'Seeking a senior editorial specialist to author weekly SaaS trends, product updates, and high-conversion subscriber flows.',
  },
  {
    title: 'Brand Vector Illustrator & Visual Designer',
    category: 'Design & Creative',
    companyName: 'Figma',
    companyLogoBg: 'bg-[#ab004b]',
    companyIconType: 'clover',
    verified: true,
    location: 'Remote',
    duration: '1-5 Days',
    type: 'Hourly',
    experienceLevel: 'Expert',
    budgetMin: 80000,
    budgetMax: 100000,
    budgetLabel: budgetLabel(80000, 100000),
    expenseLevel: 'Expensive',
    skills: ['Logo Design', 'Illustration', 'Brand Guidelines', 'Aesthetics'],
    description:
      'Craft unique geometric logos, brand design matrices, and responsive icons that project modern simplicity and professional confidence.',
  },
  {
    title: 'PPC Growth Marketer & Google Ads Audit Specialist',
    category: 'Digital Marketing',
    companyName: 'Linear',
    companyLogoBg: 'bg-[#192338]',
    companyIconType: 'wave',
    verified: true,
    location: 'Remote',
    duration: '6-10 Days',
    type: 'Hourly',
    experienceLevel: 'Intermediate',
    budgetMin: 55000,
    budgetMax: 75000,
    budgetLabel: budgetLabel(55000, 75000),
    expenseLevel: 'Intermediate',
    skills: ['Google Ads', 'SEM', 'Auditing', 'Landing Pages'],
    description:
      'Help optimize active search networks, perform click rate evaluation audits, and restructure conversion tag mechanisms.',
  },
  {
    title: '2D Motion Designer for SaaS Product Onboarding Loops',
    category: 'Video & Animation',
    companyName: 'Airbnb',
    companyLogoBg: 'bg-[#3f3ebd]',
    companyIconType: 'face',
    verified: true,
    location: 'Hybrid',
    duration: '5-10 Days',
    type: 'Hourly',
    experienceLevel: 'Intermediate',
    budgetMin: 60000,
    budgetMax: 85000,
    budgetLabel: budgetLabel(60000, 85000),
    expenseLevel: 'Intermediate',
    skills: ['After Effects', 'Animation', 'Lottie Files', 'UX Flow'],
    description:
      'Illustrate and animate simple UX workflows into interactive website visualizers with scalable asset packages.',
  },
  {
    title: 'Laravel Platform Engineer & Headless API Builder',
    category: 'Development & IT',
    companyName: 'Webflow',
    companyLogoBg: 'bg-[#ff1a53]',
    companyIconType: 'in',
    verified: true,
    location: 'Hybrid',
    duration: '10-15 Days',
    type: 'Hourly',
    experienceLevel: 'Entry Level',
    budgetMin: 35000,
    budgetMax: 55000,
    budgetLabel: budgetLabel(35000, 55000),
    expenseLevel: 'Inexpensive',
    skills: ['Laravel', 'PHP', 'API Customization', 'Webhooks'],
    description:
      'Write clean custom controllers, build secure webhook endpoints, and manage SQL database triggers.',
  },
  {
    title: 'Lead Financial Analyst for Venture Funding Pitch Deck',
    category: 'Finance & Accounting',
    companyName: 'Stripe',
    companyLogoBg: 'bg-[#ab004b]',
    companyIconType: 'clover',
    verified: true,
    location: 'Remote',
    duration: '1-5 Days',
    type: 'Contract',
    experienceLevel: 'Expert',
    budgetMin: 100000,
    budgetMax: 130000,
    budgetLabel: budgetLabel(100000, 130000),
    expenseLevel: 'Expensive',
    skills: ['Financial Analysis', 'SaaS Outlook', 'Excel Modeling', 'Slide Deck'],
    description:
      'Build authoritative financial projections, 5-year balance models, metrics dashboards, and high-fidelity summary slides.',
  },
];

const titlesByCat: Record<string, string[]> = {
  'Design & Creative': [
    'Figma Interface Designer for Web Portal',
    'UI/UX Product Designer for Mobile SaaS',
    'Creative Brand Architect & Identity Designer',
    'Directory Theme Web Layout Designer',
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
    'English to Nepali Localization Coordinator',
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
    'Portfolio Risk Analyst and Modeler',
    'Corporate Spreadsheet Modeler & Excel Specialist',
    'Audit Compliance Lead & Tax Consultant',
  ],
};

export function generateMockJobs(): Job[] {
  const jobsList: Job[] = [];
  const totalItemsNeeded = 320;
  const companies = [
    'Slack', 'Figma', 'Stripe', 'Mailchimp', 'Airbnb', 'Vercel', 'Linear', 'Webflow',
    'Zoom', 'GitLab', 'Notion', 'Raycast', 'Retool', 'Supabase', 'Upwork', 'Framer',
  ];
  const companyBgs = [
    'bg-[#192338]', 'bg-[#3f3ebd]', 'bg-[#ff1a53]', 'bg-[#ab004b]',
    'bg-[#0f766e]', 'bg-[#1d4ed8]', 'bg-[#b91c1c]', 'bg-[#4d7c0f]', 'bg-[#4338ca]',
  ];
  const icons: Job['companyIconType'][] = ['wave', 'face', 'in', 'clover'];
  const locations: Job['location'][] = ['Remote', 'Hybrid', 'In-office'];
  const levels: Job['experienceLevel'][] = ['Entry Level', 'Intermediate', 'Expert'];
  const types: Job['type'][] = ['Hourly', 'Fixed Price', 'Contract', 'Full Time'];
  const durations = ['1-5 Days', '6-10 Days', '10-15 Days', '20-30 Days'];

  for (let i = 0; i < totalItemsNeeded; i++) {
    const base = baseJobs[i % baseJobs.length];
    const pageNum = Math.floor(i / 16) + 1;
    const itemNumOnPage = (i % 16) + 1;

    let title = base.title;
    if (i >= baseJobs.length) {
      const titleOptions = titlesByCat[base.category] || [base.title];
      title = titleOptions[(pageNum + itemNumOnPage) % titleOptions.length];
    }

    const experienceLevel = levels[(i + itemNumOnPage) % levels.length];
    let budgetMin = 35000;
    let budgetMax = 55000;
    let expenseLevel: Job['expenseLevel'] = 'Inexpensive';

    if (experienceLevel === 'Expert') {
      budgetMin = 80000 + ((i * 11) % 5) * 5000;
      budgetMax = budgetMin + 15000;
      expenseLevel = 'Expensive';
    } else if (experienceLevel === 'Intermediate') {
      budgetMin = 50000 + ((i * 7) % 5) * 5000;
      budgetMax = budgetMin + 10000;
      expenseLevel = 'Intermediate';
    } else {
      budgetMin = 25000 + ((i * 5) % 4) * 5000;
      budgetMax = budgetMin + 10000;
      expenseLevel = 'Inexpensive';
    }

    jobsList.push({
      id: `job-${i + 1}`,
      title,
      category: base.category,
      companyName: companies[(i + pageNum) % companies.length],
      companyLogoBg: companyBgs[(i * 3) % companyBgs.length],
      companyIconType: icons[(i + 1) % icons.length],
      verified: i % 3 === 0,
      location: locations[(i + pageNum) % locations.length],
      duration: durations[i % durations.length],
      type: types[(i + pageNum) % types.length],
      experienceLevel,
      budgetMin,
      budgetMax,
      budgetLabel: budgetLabel(budgetMin, budgetMax),
      expenseLevel,
      skills: base.skills,
      description: base.description,
    });
  }

  return jobsList;
}
