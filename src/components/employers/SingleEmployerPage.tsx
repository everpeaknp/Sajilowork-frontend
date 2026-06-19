'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import {
  Star,
  MapPin,
  Calendar,
  Phone,
  Mail,
  ArrowUpRight,
  Layers,
  Users,
  Check,
  Send,
  MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { EmployerListingCard } from '@/lib/employerApi';
import type { Employer } from './employerData';
import EmployerGallery from './EmployerGallery';
import EmployerProjectsList from './EmployerProjectsList';
import EmployerReviews, { type SingleReview } from './EmployerReviews';
import EmployerJobsAt from './EmployerJobsAt';
import { parseEmployerUserId } from '@/lib/profileReviewDisplay';

interface SingleEmployerPageProps {
  employer: Employer;
  projects?: EmployerListingCard[];
  jobs?: EmployerListingCard[];
  reviews?: SingleReview[];
  useMockProjects?: boolean;
  useMockJobs?: boolean;
  embedded?: boolean;
  onContact?: (name: string) => void;
  onNotification?: (message: string) => void;
  onProjectSelect?: (project: EmployerListingCard) => void;
  onJobSelect?: (job: EmployerListingCard) => void;
}

function formatMemberSince(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatMemberSinceLabel(iso?: string): string {
  const formatted = formatMemberSince(iso);
  return formatted === '—' ? 'Recently joined' : `Since ${formatted}`;
}

const OrganicYellowBlob = () => (
  <div className="pointer-events-none absolute left-0 top-0 h-36 w-36 -translate-x-12 -translate-y-8 rounded-full bg-[#F5D77F]/30 blur-2xl md:h-48 md:w-48" />
);

const OrganicTerracottaBlob = () => (
  <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 translate-x-16 -translate-y-8 rounded-full bg-[#E07A5F]/15 blur-2xl md:h-64 md:w-64" />
);

const YellowLeafShape = () => (
  <div
    className="pointer-events-none absolute left-0 top-0 h-40 w-24 bg-[#F9D689] opacity-75 md:h-56 md:w-32"
    style={{ borderRadius: '0 0 100px 0' }}
  />
);

const TerracottaLeafShape = () => (
  <div
    className="pointer-events-none absolute right-0 top-0 h-32 w-24 bg-[#E29578] opacity-55 md:h-48 md:w-36"
    style={{ borderRadius: '0 0 0 100px' }}
  />
);

function renderInvisionLogo(compact = false) {
  return (
    <div className="relative shrink-0 select-none">
      <div
        className={`flex items-center justify-center overflow-hidden rounded-full border-white bg-[#FF2D65] font-serif text-white shadow-md ${
          compact ? 'h-16 w-16 border-[3px] sm:h-[4.5rem] sm:w-[4.5rem]' : 'h-24 w-24 border-[5px] sm:h-28 sm:w-28'
        }`}
      >
        <span
          className={`mt-[-4px] select-none font-bold tracking-tight ${compact ? 'text-[30px] sm:text-[36px]' : 'text-[44px] sm:text-[52px]'}`}
        >
          in
        </span>
      </div>
      <span
        className={`absolute animate-pulse rounded-full border-white bg-[#22C55E] shadow-sm ${
          compact
            ? 'right-1 top-0.5 h-3.5 w-3.5 border-2'
            : 'right-1.5 top-1 h-5 w-5 border-[3.5px] sm:right-2 sm:top-1.5'
        }`}
      />
    </div>
  );
}

function renderProfileLogo(logoKey: string, name: string, compact = false, logoUrl?: string) {
  if (logoUrl) {
    return (
      <div className="relative shrink-0 select-none">
        <div
          className={`flex items-center justify-center overflow-hidden rounded-full border-white bg-neutral-100 shadow-md ${
            compact ? 'h-16 w-16 border-[3px] sm:h-[4.5rem] sm:w-[4.5rem]' : 'h-24 w-24 border-[5px] sm:h-28 sm:w-28'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt={`${name} logo`} className="h-full w-full object-cover" />
        </div>
        <span className="absolute right-1.5 top-1 h-5 w-5 animate-pulse rounded-full border-[3.5px] border-white bg-[#22C55E] shadow-sm sm:right-2 sm:top-1.5" />
      </div>
    );
  }

  if (logoKey === 'cursive-in' || name.toLowerCase() === 'invision') {
    return renderInvisionLogo(compact);
  }

  const knownKeys = [
    'monkey-face',
    'wave-s',
    'linked-loops',
    'retro-grid',
    'serif-m',
    'cursive-u',
    'slack-icon',
    'airbnb-icon',
    'stripe-icon',
    'shopify-icon',
    'zoom-icon',
    'spotify-icon',
  ];

  return (
    <div className="relative shrink-0 select-none">
      <div
        className={`flex items-center justify-center overflow-hidden rounded-full border-white bg-neutral-900 shadow-md ${
          compact ? 'h-16 w-16 border-[3px] sm:h-[4.5rem] sm:w-[4.5rem]' : 'h-24 w-24 border-[5px] sm:h-28 sm:w-28'
        }`}
      >
        {logoKey === 'monkey-face' && (
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <rect width="100%" height="100%" fill="#4F46E5" />
            <circle cx="50" cy="50" r="30" fill="white" fillOpacity="0.15" />
            <path
              d="M 35 45 A 6 6 0 1 1 47 45 M 53 45 A 6 6 0 1 1 65 45"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 38 62 C 42 70, 58 70, 62 62"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        )}
        {logoKey === 'wave-s' && (
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <rect width="100%" height="100%" fill="#1E293B" />
            <path d="M30,50 Q40,30 50,50 T70,50" fill="none" stroke="#22D3EE" strokeWidth="7" strokeLinecap="round" />
            <path
              d="M30,60 Q40,40 50,60 T70,60"
              fill="none"
              stroke="#06B6D4"
              strokeWidth="7"
              strokeLinecap="round"
              opacity="0.75"
            />
          </svg>
        )}
        {logoKey === 'linked-loops' && (
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <rect width="100%" height="100%" fill="#9D174D" />
            <circle cx="50" cy="50" r="18" stroke="white" strokeWidth="5" fill="none" />
            <circle cx="38" cy="50" r="12" stroke="white" strokeWidth="3.5" strokeOpacity="0.8" fill="none" />
            <circle cx="62" cy="50" r="12" stroke="white" strokeWidth="3.5" strokeOpacity="0.8" fill="none" />
          </svg>
        )}
        {logoKey === 'retro-grid' && (
          <svg viewBox="0 0 100 100" className="h-full w-full bg-white">
            <circle cx="50" cy="50" r="24" fill="#FEE2E2" />
            <circle cx="50" cy="38" r="8" fill="#EF4444" />
            <circle cx="50" cy="62" r="8" fill="#EF4444" />
            <circle cx="38" cy="50" r="8" fill="#EF4444" />
            <circle cx="62" cy="50" r="8" fill="#EF4444" />
          </svg>
        )}
        {logoKey === 'serif-m' && (
          <div className="flex h-full w-full items-center justify-center bg-neutral-950 font-serif text-4xl font-black text-white">
            M
          </div>
        )}
        {logoKey === 'cursive-u' && (
          <svg viewBox="0 0 100 100" className="h-full w-full bg-[#F3E8FF]">
            <path
              d="M35 35 V55 C35 65, 50 68, 50 55 V35 H58 V55 C58 68, 65 72, 72 62"
              stroke="#A855F7"
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        )}
        {logoKey === 'slack-icon' && (
          <div className="flex h-full w-full items-center justify-center bg-white p-3">
            <span className="text-xl font-bold text-neutral-800">Slack</span>
          </div>
        )}
        {logoKey === 'airbnb-icon' && (
          <div className="flex h-full w-full items-center justify-center bg-[#FF5A5F] text-3xl font-bold text-white">
            ♥
          </div>
        )}
        {logoKey === 'stripe-icon' && (
          <div className="flex h-full w-full items-center justify-center bg-[#635BFF] text-3xl font-black italic text-white">
            stripe
          </div>
        )}
        {logoKey === 'shopify-icon' && (
          <div className="flex h-full w-full items-center justify-center bg-[#96BF48] text-3xl font-bold text-white">
            S
          </div>
        )}
        {logoKey === 'zoom-icon' && (
          <div className="flex h-full w-full items-center justify-center bg-[#2D8CFF] text-3xl font-extrabold text-white">
            z
          </div>
        )}
        {logoKey === 'spotify-icon' && (
          <div className="flex h-full w-full items-center justify-center bg-[#1ED760] text-3xl text-black">
            ♫
          </div>
        )}
        {!knownKeys.includes(logoKey) && (
          <span className="font-sans text-3xl font-black uppercase text-white">{name.substring(0, 2)}</span>
        )}
      </div>
      <span className="absolute right-1.5 top-1 h-5 w-5 animate-pulse rounded-full border-[3.5px] border-white bg-[#22C55E] shadow-sm sm:right-2 sm:top-1.5" />
    </div>
  );
}

const ABOUT_COMPANY_INTRO = [
  'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English.',
  'Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).',
] as const;

const ABOUT_COMPANY_SECTIONS = [
  {
    title: 'Who are we?',
    body: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English.',
  },
  {
    title: 'What do we do?',
    body: 'Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).',
  },
] as const;

export default function SingleEmployerPage({
  employer,
  projects,
  jobs,
  reviews,
  useMockProjects = false,
  useMockJobs = false,
  embedded = false,
  onContact,
  onNotification,
  onProjectSelect,
  onJobSelect,
}: SingleEmployerPageProps) {
  const [showContactModal, setShowContactModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [displayRating, setDisplayRating] = useState(employer.rating);
  const [displayReviewCount, setDisplayReviewCount] = useState(employer.reviewCount);

  useEffect(() => {
    setDisplayRating(employer.rating);
    setDisplayReviewCount(employer.reviewCount);
  }, [employer.id, employer.rating, employer.reviewCount]);

  const revieweeUserId = parseEmployerUserId(employer.id);

  const handleReviewsUpdated = useCallback((count: number, average: number) => {
    setDisplayReviewCount((prev) => (prev === count ? prev : count));
    setDisplayRating((prev) => (prev === average ? prev : average));
  }, []);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setShowContactModal(false);
      setSubject('');
      setMessageText('');
      setEmailInput('');
      onContact?.(employer.name);
    }, 1800);
  };

  const isIndividual = employer.accountType === 'individual';
  const aboutTitle = isIndividual ? 'About' : 'About';
  const aboutSubtitle = isIndividual
    ? 'Profile details and how to reach this employer directly.'
    : 'Company details and how to reach this employer directly.';

  const aboutMeCard = (
    <div
      className={`relative flex h-full flex-col bg-white p-6 text-left sm:p-8 ${
        embedded
          ? 'rounded-2xl bg-neutral-50/80'
          : 'border border-neutral-100 shadow-xl'
      }`}
    >
      <h3 className="mb-1.5 font-sans text-xl font-normal tracking-tight text-black">{aboutTitle}</h3>
      <p className="mb-5 text-sm font-normal leading-relaxed text-neutral-900 sm:mb-6 sm:text-base">
        {aboutSubtitle}
      </p>

      <div className="select-none space-y-0.5 text-xs sm:text-sm">
        <div className="flex items-center justify-between border-b border-[#F4F4F4] py-3.5">
          <div className="flex items-center gap-2.5 font-normal text-neutral-500">
            <Layers className="h-4 w-4 text-neutral-400" strokeWidth={2.2} />
            <span>Account type</span>
          </div>
          <span className="font-normal tracking-tight text-black">
            {isIndividual ? 'Individual' : 'Company'}
          </span>
        </div>

        {!isIndividual ? (
          <div className="flex items-center justify-between border-b border-[#F4F4F4] py-3.5">
            <div className="flex items-center gap-2.5 font-normal text-neutral-500">
              <Layers className="h-4 w-4 text-neutral-400" strokeWidth={2.2} />
              <span>Primary industry</span>
            </div>
            <span className="font-normal tracking-tight text-black">{employer.industry}</span>
          </div>
        ) : null}

        {!isIndividual ? (
          <div className="flex items-center justify-between border-b border-[#F4F4F4] py-3.5">
            <div className="flex items-center gap-2.5 font-normal text-neutral-500">
              <Users className="h-4 w-4 text-neutral-400" strokeWidth={2.2} />
              <span>Company size</span>
            </div>
            <span className="font-normal tracking-tight text-black">{employer.teamSize}</span>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-b border-[#F4F4F4] py-3.5">
          <div className="flex items-center gap-2.5 font-normal text-neutral-500">
            <Calendar className="h-4 w-4 text-neutral-400" strokeWidth={2.2} />
            <span>Founded in</span>
          </div>
          <span className="font-normal tracking-tight text-black">
            {formatMemberSince(employer.memberSince).replace(/^—$/, 'Not specified')}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-[#F4F4F4] py-3.5">
          <div className="flex items-center gap-2.5 font-normal text-neutral-500">
            <Phone className="h-4 w-4 text-neutral-400" strokeWidth={2.2} />
            <span>Phone</span>
          </div>
          <span className="font-normal tracking-tight text-black">
            {employer.contactPhone || '—'}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-[#F4F4F4] py-3.5">
          <div className="flex items-center gap-2.5 font-normal text-neutral-500">
            <Mail className="h-4 w-4 text-neutral-400" strokeWidth={2.2} />
            <span>Email</span>
          </div>
          <span className="max-w-[140px] truncate text-right font-normal tracking-tight text-black sm:max-w-none">
            {employer.contactEmail || '—'}
          </span>
        </div>

        <div className="flex items-center justify-between py-3.5">
          <div className="flex items-center gap-2.5 font-normal text-neutral-500">
            <MapPin className="h-4 w-4 text-neutral-400" strokeWidth={2.2} />
            <span>Location</span>
          </div>
          <span className="font-normal tracking-tight text-black">{employer.location}</span>
        </div>
      </div>

      {!embedded ? (
        <button
          type="button"
          onClick={() => setShowContactModal(true)}
          className="mt-auto flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-emerald px-6 py-3 text-sm font-normal tracking-tight text-white shadow-sm transition-all hover:bg-[#3d9665] focus:outline-none"
          id="btn-sidebar-contact-me"
        >
          <span>Contact Me</span>
          <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
        </button>
      ) : null}
    </div>
  );

  return (
    <section
      className={`animate-in fade-in w-full min-w-0 select-none text-black antialiased [&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_h4]:font-normal ${
        embedded ? 'pb-6' : 'pb-16'
      }`}
      id="employer-profile-section"
    >
      <div className="w-full">
        <div
          className={`relative w-full ${
            embedded ? 'px-0 pt-0' : 'px-4 pt-4 sm:px-6 sm:pt-6 md:px-10 lg:px-12 xl:px-16'
          }`}
        >
          <div
            className={`relative mx-auto flex w-full max-w-[1600px] flex-col ${
              embedded ? 'gap-6' : 'lg:block lg:min-h-[28rem]'
            }`}
          >
            <div
              id="single-employer-hero"
              className={`relative z-0 w-full overflow-hidden rounded-3xl bg-[#FDF8F3] sm:rounded-[2rem] ${
                embedded ? '' : 'border border-[#F2ECE6]'
              } ${embedded ? 'order-none' : 'order-1'}`}
            >
              <OrganicYellowBlob />
              <OrganicTerracottaBlob />
              <YellowLeafShape />
              <TerracottaLeafShape />

              <div className="relative z-10 w-full px-4 py-6 sm:px-6 sm:py-7 lg:px-10 lg:py-8 xl:px-12">
                <motion.div
                  className={
                    embedded
                      ? 'text-left'
                      : 'text-left sm:ml-10 lg:ml-16 lg:pr-[min(380px,36%)] xl:ml-24'
                  }
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-5 sm:gap-6 md:gap-8">
                    {renderProfileLogo(employer.logoColor, employer.name, false, employer.logoUrl)}

                    <div className="min-w-0 flex-1 select-none">
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
                        {isIndividual ? 'Individual employer' : 'Company'}
                      </p>
                      <h1 className="mb-1 font-sans text-2xl font-normal leading-tight tracking-tight text-black sm:text-3xl">
                        {employer.name}
                      </h1>
                      <p className="mb-3 max-w-xl text-sm font-normal leading-snug text-black/70 sm:mb-4 sm:text-[15px]">
                        {employer.tagline}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-normal text-black sm:gap-x-6 sm:text-sm">
                        <div className="flex items-center gap-1.5">
                          <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-500" />
                          <span>
                            {displayRating.toFixed(2)} {displayReviewCount} reviews
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 shrink-0 text-neutral-700" strokeWidth={2.5} />
                          <span>{employer.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 shrink-0 text-neutral-700" strokeWidth={2.5} />
                          <span>{formatMemberSinceLabel(employer.memberSince)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            <motion.div
              className={
                embedded
                  ? 'relative z-10 w-full'
                  : 'relative z-20 order-3 mt-6 w-full lg:absolute lg:right-6 lg:top-20 lg:order-none lg:mt-0 lg:max-w-[380px] lg:translate-y-0 xl:right-12 2xl:right-20'
              }
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {aboutMeCard}
            </motion.div>

            <div
              className={
                embedded
                  ? 'relative z-10 w-full min-w-0 pb-6 pt-0'
                  : 'relative z-10 order-2 w-full min-w-0 pb-10 pt-6 lg:order-none lg:pt-8 lg:pr-[calc(380px+3rem)] xl:pr-[calc(380px+4.5rem)] 2xl:pr-[calc(380px+6.5rem)]'
              }
            >
              <div className="space-y-6">
                <h2 className="text-lg font-normal tracking-tight text-black sm:text-xl">
                  {isIndividual ? 'About' : 'About company'}
                </h2>

                <div className="space-y-4">
                  {employer.description.trim() ? (
                    employer.description
                      .split(/\n{2,}/)
                      .map((paragraph) => paragraph.trim())
                      .filter(Boolean)
                      .map((paragraph, index) => (
                        <p
                          key={index}
                          className="text-sm font-normal leading-relaxed text-black/80 sm:text-base"
                        >
                          {paragraph}
                        </p>
                      ))
                  ) : (
                    ABOUT_COMPANY_INTRO.map((paragraph, index) => (
                      <p
                        key={index}
                        className="text-sm font-normal leading-relaxed text-black/80 sm:text-base"
                      >
                        {paragraph}
                      </p>
                    ))
                  )}
                </div>

                {!employer.description.trim()
                  ? ABOUT_COMPANY_SECTIONS.map((section) => (
                      <div key={section.title} className="space-y-2">
                        <h3 className="text-base font-normal tracking-tight text-black sm:text-lg">
                          {section.title}
                        </h3>
                        <p className="text-sm font-normal leading-relaxed text-black/80 sm:text-base">
                          {section.body}
                        </p>
                      </div>
                    ))
                  : null}

                {employer.galleryImages?.length ? (
                  <div className="pt-4">
                    <EmployerGallery images={employer.galleryImages} />
                  </div>
                ) : null}

                <div className="pt-8">
                  <EmployerProjectsList
                    employerName={employer.name}
                    logoColor={employer.logoColor}
                    logoUrl={employer.logoUrl}
                    logoText={employer.logoText}
                    projects={projects}
                    useMockFallback={useMockProjects}
                    triggerNotification={onNotification}
                    onProjectSelect={
                      onProjectSelect ??
                      ((listing) =>
                        onNotification?.(`Opening project brief: "${listing.title}"`))
                    }
                  />
                </div>

                <div className="pt-8">
                  <EmployerReviews
                    employerId={employer.id}
                    employerName={employer.name}
                    initialRating={displayRating}
                    initialReviews={reviews}
                    preferApiReviews={reviews !== undefined}
                    revieweeUserId={revieweeUserId}
                    onReviewsUpdated={handleReviewsUpdated}
                    showToast={onNotification}
                  />
                </div>
              </div>
            </div>

            <div
              className={`relative z-10 w-full min-w-0 pb-10 ${embedded ? 'pt-0' : 'order-4 pt-8 lg:order-none'}`}
            >
              <EmployerJobsAt
                employerName={employer.name}
                logoColor={employer.logoColor}
                logoUrl={employer.logoUrl}
                logoText={employer.logoText}
                jobs={jobs}
                useMockFallback={useMockJobs}
                jobsLive={jobs?.length ?? employer.openJobs}
                triggerNotification={onNotification}
                onJobSelect={
                  onJobSelect ??
                  ((listing) => onNotification?.(`Opening job: "${listing.title}"`))
                }
              />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showContactModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContactModal(false)}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-20 w-full max-w-md space-y-5 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl md:p-8"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="flex items-center gap-2 text-base font-normal tracking-tight text-black">
                  <MessageSquare className="h-5 w-5 text-[#53B782]" />
                  <span>Contact {employer.name}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="cursor-pointer rounded p-1 px-2 text-xs font-normal text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-black"
                >
                  ✕
                </button>
              </div>

              {isSent ? (
                <div className="space-y-3.5 py-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-sm">
                    <Check className="h-6 w-6 animate-bounce" strokeWidth={3} />
                  </div>
                  <h4 className="text-sm font-normal tracking-tight text-black">Message Delivered!</h4>
                  <p className="text-xs font-normal leading-relaxed text-neutral-500">
                    Your inquiry has been successfully dispatched. {employer.name} will reach out to you within 2.5
                    hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="space-y-4 text-xs font-normal text-neutral-500">
                  <p className="font-normal leading-relaxed text-neutral-500">
                    Send a customized project invitation or message to the team at{' '}
                    <span className="font-normal text-black">{employer.name}</span>.
                  </p>

                  <div className="space-y-1.5">
                    <label className="uppercase tracking-wider">Your Registered Email Address</label>
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="e.g. sender@example.com"
                      className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-xs font-medium text-neutral-800 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="uppercase tracking-wider">Project Subject Title</label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Design System Project Collaboration"
                      className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-xs font-medium text-neutral-800 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="uppercase tracking-wider">Brief Message Description</label>
                    <textarea
                      required
                      rows={4}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Write your invitation message details here..."
                      className="w-full resize-none rounded-xl border border-neutral-200 bg-white p-3 text-xs font-medium text-neutral-800 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowContactModal(false)}
                      className="flex-1 cursor-pointer rounded-xl bg-neutral-100 py-3 text-center font-normal text-black transition-all hover:bg-neutral-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#53B782] py-3 text-center font-normal text-white transition-all hover:bg-[#43a16d]"
                    >
                      <span>Send Invitation</span>
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
