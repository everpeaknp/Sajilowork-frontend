'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  CheckCircle2,
  ThumbsUp,
  MessageSquareMore,
  ChevronDown,
  Star,
} from 'lucide-react';
import type { DashboardTab } from './DashboardSidebar';
import { formatNPR } from '@/lib/nepalLocale';
import { getMediaUrl } from '@/lib/utils';
import UserAvatar from '@/components/common/UserAvatar';
import EmployerAvatarCircle from '@/components/employers/EmployerAvatarCircle';
import { resolveOwnerAvatarBg } from '@/lib/employerAvatarUtils';
import {
  dashboardService,
  type DashboardOverviewPayload,
  type DashboardStatCard,
} from '@/services/dashboard.service';
import { useDashboardSidebarRole } from './DashboardRoleSwitchContext';
import { DASHBOARD_PAGE_ROOT } from './dashboardResponsive';
import DashboardLoadingFallback from './DashboardLoadingFallback';
import {
  getDashboardEditHref,
  getDashboardListHref,
  type DashboardCreateTab,
} from './dashboardTabs';

const STAT_ICONS = [FileText, CheckCircle2, ThumbsUp, MessageSquareMore] as const;

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1541462608141-ad4979e458c9?auto=format&fit=crop&w=120&q=80';

const EMPTY_OVERVIEW: DashboardOverviewPayload = {
  stat_cards: [
    { title: 'Services Offered', value: '0', change_val: '0', change_text: 'Currently open' },
    { title: 'Completed Services', value: '0', change_val: '0', change_text: 'Last 30 days' },
    { title: 'in Queue Services', value: '0', change_val: '0', change_text: 'Pending proposals' },
    { title: 'Total Review', value: '0', change_val: '0.0', change_text: 'Average rating' },
  ],
  profile_views_chart: [
    { month: 'Jan', val: 0 },
    { month: 'Feb', val: 0 },
    { month: 'Mar', val: 0 },
    { month: 'Apr', val: 0 },
    { month: 'May', val: 0 },
    { month: 'Jun', val: 0 },
    { month: 'Jul', val: 0 },
    { month: 'Aug', val: 0 },
    { month: 'Sep', val: 0 },
    { month: 'Oct', val: 0 },
    { month: 'Nov', val: 0 },
    { month: 'Dec', val: 0 },
  ],
  traffic: {
    direct: 0,
    referral: 0,
    organic: 0,
    direct_percent: 0,
    referral_percent: 0,
    organic_percent: 0,
  },
  most_viewed_services: [],
  recent_purchases: [],
  my_listings: [],
  recent_completed_projects: [],
  recent_activity: [],
};

interface DashboardOverviewProps {
  onTabChange?: (tab: DashboardTab) => void;
}

function formatOverviewDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function listingKindLabel(kind: string) {
  switch (kind) {
    case 'job':
      return 'Job';
    case 'project':
      return 'Project';
    case 'service':
      return 'Service';
    default:
      return 'Task';
  }
}

function listingKindToTab(kind: string): DashboardCreateTab {
  if (kind === 'job') return 'jobs';
  if (kind === 'project') return 'project';
  if (kind === 'service') return 'services';
  return 'task';
}

function formatListingStatus(status: string) {
  const normalized = status.trim().toLowerCase();
  if (!normalized) return 'Unknown';
  return normalized
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function DashboardOverview({ onTabChange }: DashboardOverviewProps) {
  const role = useDashboardSidebarRole();
  const [timeRange, setTimeRange] = useState('This Week');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<DashboardOverviewPayload>(EMPTY_OVERVIEW);
  const [hoveredNode, setHoveredNode] = useState<{
    x: number;
    y: number;
    val: number;
    month: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const timeoutId = window.setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 12_000);

    void dashboardService
      .getMyOverview()
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data?.overview) {
          setOverview(res.data.overview);
        }
      })
      .catch(() => {
        if (!cancelled) setOverview(EMPTY_OVERVIEW);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [role]);

  const statCards = useMemo(
    () =>
      overview.stat_cards.map((card: DashboardStatCard, index) => ({
        title: card.title,
        value: card.value,
        changeVal: card.change_val,
        changeText: card.change_text,
        icon: STAT_ICONS[index] ?? FileText,
      })),
    [overview.stat_cards],
  );

  const chartData = overview.profile_views_chart;
  const chartMax = Math.max(...chartData.map((point) => point.val), 1);

  const svgWidth = 1000;
  const svgHeight = 350;
  const padLeft = 60;
  const padRight = 960;
  const padTop = 30;
  const padBottom = 290;

  const plottedPoints = chartData.map((d, idx) => {
    const x =
      padLeft +
      (chartData.length > 1 ? idx / (chartData.length - 1) : 0) * (padRight - padLeft);
    const y = padBottom - (d.val / chartMax) * (padBottom - padTop);
    return { x, y, val: d.val, month: d.month };
  });

  const getSplinePath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];

      const cp1x = p0.x + (p1.x - p0.x) / 3.4;
      const cp1y = p0.y;
      const cp2x = p0.x + (2 * (p1.x - p0.x)) / 3.4;
      const cp2y = p1.y;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const linePathD = getSplinePath(plottedPoints);
  const fillPathD =
    plottedPoints.length > 0
      ? `${linePathD} L ${plottedPoints[plottedPoints.length - 1].x} ${padBottom} L ${plottedPoints[0].x} ${padBottom} Z`
      : '';

  const gridYLabels = useMemo(() => {
    const step = Math.max(Math.ceil(chartMax / 6 / 10) * 10, 10);
    return Array.from({ length: 7 }, (_, index) => step * (6 - index));
  }, [chartMax]);

  const traffic = overview.traffic;
  const trafficTotal = traffic.direct + traffic.referral + traffic.organic;
  const circumference = 439.82;
  const directDash = (traffic.direct_percent / 100) * circumference;
  const referralDash = (traffic.referral_percent / 100) * circumference;
  const organicDash = (traffic.organic_percent / 100) * circumference;
  const middleCardTitle =
    role === 'tasker' ? 'Recently Done Projects' : 'Services, Projects & Tasks';
  const middleCardViewAllHref =
    role === 'tasker' ? '/dashboard/contracts' : getDashboardListHref('jobs');
  const mostViewedCardTitle =
    role === 'tasker' ? 'Most Viewed Services' : 'Most Viewed Jobs';
  const mostViewedEmptyText =
    role === 'tasker' ? 'No services yet.' : 'No jobs yet.';
  const mostViewedViewAllHref = role === 'tasker' ? '/dashboard/contracts' : '/dashboard/jobs';

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} space-y-6`}>
      {loading ? <DashboardLoadingFallback fullScreen={false} /> : null}
      <div className="grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, idx) => {
          const IconComp = card.icon;
          return (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-[#e2e1dd] bg-white p-[22px] py-6 shadow-[0_2px_8px_rgba(0,0,0,0.015)] transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none dark:hover:shadow-none"
            >
              <div className="space-y-1">
                <span className="text-[13px] font-medium tracking-tight text-neutral-500 dark:text-neutral-400">
                  {card.title}
                </span>
                <h3 className="pt-0.5 text-3xl font-semibold leading-none tracking-tight text-black dark:text-stone-100">
                  {card.value}
                </h3>
                <p className="flex items-center pt-0.5 text-[11.5px] font-medium text-neutral-500 dark:text-neutral-400">
                  <span className="mr-1 font-semibold text-[#3ca871]">{card.changeVal}</span>
                  <span>{card.changeText}</span>
                </p>
              </div>

              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                <div className="absolute bottom-0.5 right-0 h-[34px] w-[34px] rounded-full bg-[#FAF5EE] dark:bg-neutral-800" />
                <IconComp strokeWidth={1.5} className="relative z-10 h-[22px] w-[22px] text-[#193E32] dark:text-[#52C47F]" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-[22px] lg:grid-cols-12">
        <div
          id="card_profile_views"
          className="flex flex-col justify-between rounded-xl border border-[#e2e1dd] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.015)] lg:col-span-8 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none"
        >
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-[15px] font-semibold tracking-tight text-black dark:text-stone-100">Profile Views</h4>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#e2e1dd] bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <span>{timeRange}</span>
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
              </button>

              {isDropdownOpen ? (
                <div className="absolute right-0 z-30 mt-1.5 w-32 rounded-lg border border-neutral-200 bg-white py-1 text-xs font-medium shadow-lg dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-none">
                  {['This Week', 'This Month', 'This Year'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setTimeRange(opt);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full cursor-pointer px-3 py-2 text-left text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-emerald-600 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-emerald-400"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex justify-center pb-[22px]">
            <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-neutral-500 dark:text-neutral-400">
              <span className="inline-block h-3.5 w-[26px] rounded-sm border border-[#4BBB80] bg-[#4BBB80]/5" />
              <span>Dataset</span>
            </div>
          </div>

          <div className="relative w-full overflow-hidden">
            <svg
              className="h-auto w-full select-none overflow-visible"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="warmChartBgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F9F6EE" stopOpacity="0.85" className="dark:[stop-color:#262626]" />
                  <stop offset="100%" stopColor="#F9F6EE" stopOpacity="0.05" className="dark:[stop-color:#171717]" />
                </linearGradient>
              </defs>

              {gridYLabels.map((lbl, idx) => {
                const y = padTop + (idx / 6) * (padBottom - padTop);
                return (
                  <g key={idx}>
                    <text
                      x={padLeft - 18}
                      y={y}
                      textAnchor="end"
                      dominantBaseline="middle"
                      className="fill-neutral-400 font-mono text-[11px] font-medium"
                    >
                      {lbl}
                    </text>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={padRight}
                      y2={y}
                      strokeWidth="0.8"
                      className="stroke-[#F0F0F0] dark:stroke-neutral-800"
                    />
                  </g>
                );
              })}

              {plottedPoints.map((pt, idx) => (
                <g key={idx}>
                  <line
                    x1={pt.x}
                    y1={padTop}
                    x2={pt.x}
                    y2={padBottom}
                    strokeWidth="0.8"
                    className="stroke-[#F0F0F0] dark:stroke-neutral-800"
                  />
                  <text
                    x={pt.x}
                    y={padBottom + 25}
                    textAnchor="middle"
                    className="fill-neutral-400 font-sans text-[11px] font-medium"
                  >
                    {pt.month}
                  </text>
                </g>
              ))}

              {fillPathD ? (
                <path
                  d={fillPathD}
                  fill="url(#warmChartBgGrad)"
                  className="transition-all duration-300"
                />
              ) : null}

              {linePathD ? (
                <path
                  d={linePathD}
                  fill="none"
                  stroke="#4BBB80"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                />
              ) : null}

              {plottedPoints.map((pt, idx) => {
                const isHovered = hoveredNode?.month === pt.month;
                return (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredNode(pt)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {isHovered ? (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="8"
                        fill="#4BBB80"
                        opacity="0.15"
                        className="animate-ping"
                      />
                    ) : null}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? '5' : '3.8'}
                      stroke="#4BBB80"
                      strokeWidth={isHovered ? '2.5' : '1.8'}
                      className="fill-white transition-all duration-150 dark:fill-neutral-900"
                    />
                  </g>
                );
              })}
            </svg>

            {hoveredNode ? (
              <div
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-md bg-neutral-900 px-2.5 py-1.5 font-mono text-[10px] text-white shadow-md transition-all duration-100"
                style={{
                  left: `${((hoveredNode.x - padLeft) / (padRight - padLeft)) * (100 - (2 * padLeft) / 10) + padLeft / 12}%`,
                  top: `${hoveredNode.y - 12}px`,
                }}
              >
                <div className="text-center font-semibold text-emerald-400">{hoveredNode.val}</div>
                <div className="text-[9px] text-neutral-300">{hoveredNode.month} views</div>
              </div>
            ) : null}
          </div>
        </div>

        <div
          id="card_traffic_stats"
          className="flex flex-col justify-between rounded-xl border border-[#e2e1dd] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.015)] lg:col-span-4 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none"
        >
          <div>
            <h4 className="mb-4 text-[15px] font-semibold tracking-tight text-black dark:text-stone-100">Traffic</h4>
            <div className="mb-4 w-full border-b border-neutral-100 dark:border-neutral-800" />

            <div className="mb-5 flex flex-wrap items-center justify-center gap-3 py-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                <span className="inline-block h-2.5 w-5 rounded-xs bg-[#4BBB80]" />
                <span>Direct {traffic.direct_percent}%</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                <span className="inline-block h-2.5 w-5 rounded-xs bg-[#FEECE9] dark:bg-[#5c403c]" />
                <span>Referal {traffic.referral_percent}%</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                <span className="inline-block h-2.5 w-5 rounded-xs border border-neutral-200 bg-[#FAF7F0] dark:border-neutral-700 dark:bg-neutral-800" />
                <span>Organic {traffic.organic_percent}%</span>
              </div>
            </div>

            <div className="relative flex items-center justify-center py-4">
              {trafficTotal === 0 ? (
                <div className="flex h-60 w-60 max-w-full flex-col items-center justify-center rounded-full border border-dashed border-neutral-200 bg-neutral-50/80 px-6 text-center dark:border-neutral-700 dark:bg-neutral-800/80">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">No listing views yet</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-neutral-400">
                    Traffic appears when people view your tasks, jobs, projects, or services.
                  </p>
                </div>
              ) : (
              <svg className="h-60 w-60 max-w-full overflow-visible" viewBox="0 0 200 200">
                <g transform="rotate(-90 100 100)">
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    stroke="#4BBB80"
                    strokeWidth="26"
                    strokeDasharray={`${directDash} ${circumference}`}
                    strokeDashoffset="0"
                    fill="none"
                    className="transition-all duration-300"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    stroke="#FEECE9"
                    strokeWidth="26"
                    strokeDasharray={`${referralDash} ${circumference}`}
                    strokeDashoffset={`-${directDash}`}
                    fill="none"
                    className="transition-all duration-300 dark:stroke-[#5c403c]"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    stroke="#FAF7F0"
                    strokeWidth="26"
                    strokeDasharray={`${organicDash} ${circumference}`}
                    strokeDashoffset={`-${directDash + referralDash}`}
                    fill="none"
                    className="transition-all duration-300 dark:stroke-neutral-700"
                  />
                  <line x1="100" y1="17" x2="100" y2="43" strokeWidth="2.5" className="stroke-white dark:stroke-neutral-900" />
                  <line x1="100" y1="157" x2="100" y2="183" strokeWidth="2.5" className="stroke-white dark:stroke-neutral-900" />
                  <line x1="17" y1="100" x2="43" y2="100" strokeWidth="2.5" className="stroke-white dark:stroke-neutral-900" />
                </g>
              </svg>
              )}
            </div>
          </div>

          <div className="mt-2 rounded-lg border border-neutral-100/50 bg-neutral-50/50 py-2 text-center text-[10px] font-medium tracking-wide text-neutral-400 dark:border-neutral-800 dark:bg-neutral-800/50">
            {trafficTotal > 0
              ? `${trafficTotal} listing views in the last 12 months, grouped by referrer.`
              : 'Analytics breakdown calculated from listing page views and referrers.'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[22px] md:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col justify-between rounded-xl border border-[#e2e1dd] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.015)] dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none">
          <div>
            <div className="mb-5 flex items-center justify-between border-b border-neutral-100 pb-3.5 dark:border-neutral-800">
              <h4 className="text-[14px] font-semibold tracking-tight text-black dark:text-stone-100">
                {mostViewedCardTitle}
              </h4>
              <Link href={mostViewedViewAllHref} className="text-[11.5px] font-medium text-[#4138C4] hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {overview.most_viewed_services.length === 0 ? (
                <p className="py-6 text-center text-xs text-neutral-400">{mostViewedEmptyText}</p>
              ) : (
                overview.most_viewed_services.map((service) => {
                  const businessName = service.business_name?.trim() || service.title;
                  const businessLogoUrl = service.business_logo_url?.trim()
                    ? getMediaUrl(service.business_logo_url)
                    : undefined;
                  const avatarBg =
                    service.logo_color?.startsWith('bg-')
                      ? service.logo_color
                      : resolveOwnerAvatarBg(businessName);

                  return (
                  <div
                    key={service.id}
                    className="flex items-center gap-3.5 border-b border-neutral-100 pb-4 last:border-0 last:pb-0 dark:border-neutral-800"
                  >
                    {role === 'customer' ? (
                      <div className="relative shrink-0">
                        <EmployerAvatarCircle
                          name={businessName}
                          avatarUrl={businessLogoUrl}
                          avatarBg={avatarBg}
                          sizeClass="h-[50px] w-[50px]"
                          textClass="text-sm font-bold uppercase"
                        />
                      </div>
                    ) : (
                    <img
                      src={getMediaUrl(service.image) || FALLBACK_IMAGE}
                      alt={service.title}
                      className="h-[50px] w-[72px] shrink-0 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                    )}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <h5
                        className="line-clamp-2 text-[11.5px] font-medium leading-snug text-black dark:text-stone-100"
                        title={service.title}
                      >
                        {service.title}
                      </h5>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0.5 text-[10.5px] font-medium text-amber-500">
                          <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
                          <span>{service.rating > 0 ? service.rating.toFixed(2) : '—'}</span>
                        </div>
                        <span className="text-[10px] font-medium text-neutral-400">
                          Starting at{' '}
                          <span className="text-[11px] font-semibold text-black dark:text-stone-100">
                            {formatNPR(service.starting_price)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-[#e2e1dd] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.015)] dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none">
          <div>
            <div className="mb-5 flex items-center justify-between border-b border-neutral-100 pb-3.5 dark:border-neutral-800">
              <h4 className="text-[14px] font-semibold tracking-tight text-black dark:text-stone-100">
                {middleCardTitle}
              </h4>
              <Link
                href={middleCardViewAllHref}
                className="text-[11.5px] font-medium text-[#4138C4] hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="space-y-[18px]">
              {role === 'tasker' ? (
                (overview.recent_completed_projects ?? []).length === 0 ? (
                  <p className="py-6 text-center text-xs text-neutral-400">
                    No completed projects yet.
                  </p>
                ) : (
                  (overview.recent_completed_projects ?? []).map((project, index) => (
                    <div
                      key={`${project.slug}-${index}`}
                      className="flex items-start gap-3 border-b border-neutral-100 pb-[18px] last:border-0 last:pb-0 dark:border-neutral-800"
                    >
                      <UserAvatar
                        src={project.avatar_url}
                        name={project.client_name}
                        size="md"
                        className="shrink-0"
                      />
                      <div className="flex-1 space-y-1">
                        <p className="text-[11.5px] leading-snug text-black dark:text-stone-100">
                          <span className="font-medium text-[#3ca871]">Completed</span>{' '}
                          {project.project_title}{' '}
                          <span className="font-medium text-neutral-500 dark:text-neutral-400">for</span>{' '}
                          <span className="font-semibold text-black dark:text-stone-100">{project.client_name}</span>
                        </p>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-medium text-neutral-400">
                            {formatOverviewDate(project.date)}
                          </span>
                          <span className="font-semibold text-black dark:text-stone-100">
                            {formatNPR(project.amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (overview.my_listings ?? []).length === 0 ? (
                <p className="py-6 text-center text-xs text-neutral-400">
                  No services, projects, or tasks yet.
                </p>
              ) : (
                (overview.my_listings ?? []).map((listing) => {
                  const businessName = listing.business_name?.trim() || listing.title;
                  const businessLogoUrl = listing.business_logo_url?.trim()
                    ? getMediaUrl(listing.business_logo_url)
                    : undefined;
                  const avatarBg =
                    listing.logo_color?.startsWith('bg-')
                      ? listing.logo_color
                      : resolveOwnerAvatarBg(businessName);
                  const editHref = getDashboardEditHref(listingKindToTab(listing.listing_kind), listing.slug);

                  return (
                    <Link
                      key={listing.id}
                      href={editHref}
                      className="flex items-start gap-3 border-b border-neutral-100 pb-[18px] last:border-0 last:pb-0 transition-colors hover:bg-neutral-50/60 dark:border-neutral-800 dark:hover:bg-neutral-800"
                    >
                      <div className="relative shrink-0">
                        <EmployerAvatarCircle
                          name={businessName}
                          avatarUrl={businessLogoUrl}
                          avatarBg={avatarBg}
                          sizeClass="h-10 w-10"
                          textClass="text-xs font-bold uppercase"
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="line-clamp-2 text-[11.5px] font-medium leading-snug text-black dark:text-stone-100">
                          {listing.title}
                        </p>
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="shrink-0 rounded-full bg-[#F0F8FF] px-2 py-0.5 text-[10px] font-medium text-[#0080FF] dark:bg-neutral-800 dark:text-[#5BA8FF]">
                              {listingKindLabel(listing.listing_kind)}
                            </span>
                            <span className="truncate font-medium text-neutral-400">
                              {formatListingStatus(listing.status)}
                            </span>
                          </div>
                          <span className="shrink-0 font-semibold text-black dark:text-stone-100">
                            {formatNPR(listing.budget_amount)}
                          </span>
                        </div>
                        <p className="text-[10.5px] font-medium text-neutral-400">
                          Updated {formatOverviewDate(listing.date)}
                        </p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-[#e2e1dd] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.015)] dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none">
          <div>
            <div className="mb-5 flex items-center justify-between border-b border-neutral-100 pb-3.5 dark:border-neutral-800">
              <h4 className="text-[14px] font-semibold tracking-tight text-black dark:text-stone-100">
                Recent Activity
              </h4>
            </div>

            <div className="relative pl-1">
              <div className="absolute bottom-3 left-[54px] top-2 w-[1.5px] bg-[#f0f0f0] dark:bg-neutral-800" />

              <div className="space-y-4">
                {overview.recent_activity.length === 0 ? (
                  <p className="py-6 text-center text-xs text-neutral-400">No recent activity yet.</p>
                ) : (
                  overview.recent_activity.map((activity, index) => (
                    <div key={`${activity.time}-${index}`} className="flex items-start">
                      <span className="mr-4 mt-0.5 w-11 whitespace-nowrap text-right text-[10.5px] font-medium text-neutral-400">
                        {activity.time}
                      </span>
                      <div className="relative z-10 mr-3 mt-1 flex h-[18px] w-[18px] items-center justify-center">
                        <span
                          className="h-3.5 w-3.5 rounded-full border-[3px] bg-white dark:bg-neutral-900"
                          style={{ borderColor: activity.color }}
                        />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <p className="text-[11.5px] font-semibold leading-snug text-black dark:text-stone-100">
                          {activity.title}
                        </p>
                        {activity.subtitle ? (
                          <p className="text-[10.5px] font-normal leading-normal text-neutral-500 dark:text-neutral-400">
                            {activity.subtitle}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
