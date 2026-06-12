'use client';

import { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  ThumbsUp,
  MessageSquareMore,
  ChevronDown,
  Star,
} from 'lucide-react';
import type { DashboardTab } from './DashboardSidebar';
import { formatNPR, legacyUsdToNpr } from '@/lib/nepalLocale';

interface DashboardOverviewProps {
  onTabChange?: (tab: DashboardTab) => void;
}

export default function DashboardOverview({ onTabChange: _onTabChange }: DashboardOverviewProps) {
  const [timeRange, setTimeRange] = useState('This Week');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<{
    x: number;
    y: number;
    val: number;
    month: string;
  } | null>(null);

  const statCards = [
    {
      title: 'Services Offered',
      value: '25',
      changeVal: '10',
      changeText: 'New Offered',
      icon: FileText,
    },
    {
      title: 'Completed Services',
      value: '1292',
      changeVal: '80+',
      changeText: 'New Completed',
      icon: CheckCircle2,
    },
    {
      title: 'in Queue Services',
      value: '182',
      changeVal: '35+',
      changeText: 'New Queue',
      icon: ThumbsUp,
    },
    {
      title: 'Total Review',
      value: '22,786',
      changeVal: '290+',
      changeText: 'New Review',
      icon: MessageSquareMore,
    },
  ];

  const chartData = [
    { month: 'Jan', val: 148 },
    { month: 'Feb', val: 136 },
    { month: 'Marc', val: 210 },
    { month: 'April', val: 120 },
    { month: 'May', val: 160 },
    { month: 'June', val: 120 },
    { month: 'July', val: 190 },
    { month: 'Agust', val: 170 },
    { month: 'Sept', val: 135 },
    { month: 'Oct', val: 210 },
    { month: 'Nov', val: 180 },
    { month: 'Dec', val: 248 },
  ];

  const svgWidth = 1000;
  const svgHeight = 350;
  const padLeft = 60;
  const padRight = 960;
  const padTop = 30;
  const padBottom = 290;

  const plottedPoints = chartData.map((d, idx) => {
    const x = padLeft + (idx / 11) * (padRight - padLeft);
    const y = padBottom - (d.val / 300) * (padBottom - padTop);
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

  const gridYLabels = [300, 250, 200, 150, 100, 50, 0];

  return (
    <div className="animate-in fade-in -mx-4 -my-6 min-h-screen space-y-6 bg-[#f0efec] p-4 font-sans text-black duration-300 sm:-mx-6 sm:p-6 md:-mx-8 md:p-8">
      <div className="grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, idx) => {
          const IconComp = card.icon;
          return (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-[#e2e1dd] bg-white p-[22px] py-6 shadow-[0_2px_8px_rgba(0,0,0,0.015)] transition-all hover:shadow-md"
            >
              <div className="space-y-1">
                <span className="text-[13px] font-medium tracking-tight text-neutral-500">
                  {card.title}
                </span>
                <h3 className="pt-0.5 text-3xl font-semibold leading-none tracking-tight text-black">
                  {card.value}
                </h3>
                <p className="flex items-center pt-0.5 text-[11.5px] font-medium text-neutral-500">
                  <span className="mr-1 font-semibold text-[#3ca871]">{card.changeVal}</span>
                  <span>{card.changeText}</span>
                </p>
              </div>

              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                <div className="absolute bottom-0.5 right-0 h-[34px] w-[34px] rounded-full bg-[#FAF5EE]" />
                <IconComp strokeWidth={1.5} className="relative z-10 h-[22px] w-[22px] text-[#193E32]" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-[22px] lg:grid-cols-12">
        <div
          id="card_profile_views"
          className="flex flex-col justify-between rounded-xl border border-[#e2e1dd] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.015)] lg:col-span-8"
        >
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-[15px] font-semibold tracking-tight text-black">Profile Views</h4>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#e2e1dd] bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-all hover:bg-neutral-50"
              >
                <span>{timeRange}</span>
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
              </button>

              {isDropdownOpen ? (
                <div className="absolute right-0 z-30 mt-1.5 w-32 rounded-lg border border-neutral-200 bg-white py-1 text-xs font-medium shadow-lg">
                  {['This Week', 'This Month', 'This Year'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setTimeRange(opt);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full cursor-pointer px-3 py-2 text-left text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-emerald-600"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex justify-center pb-[22px]">
            <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-neutral-500">
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
                  <stop offset="0%" stopColor="#F9F6EE" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#F9F6EE" stopOpacity="0.05" />
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
                      stroke="#F0F0F0"
                      strokeWidth="0.8"
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
                    stroke="#F0F0F0"
                    strokeWidth="0.8"
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
                      fill="white"
                      stroke="#4BBB80"
                      strokeWidth={isHovered ? '2.5' : '1.8'}
                      className="transition-all duration-150"
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
          className="flex flex-col justify-between rounded-xl border border-[#e2e1dd] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.015)] lg:col-span-4"
        >
          <div>
            <h4 className="mb-4 text-[15px] font-semibold tracking-tight text-black">Traffic</h4>
            <div className="mb-4 w-full border-b border-neutral-100" />

            <div className="mb-5 flex flex-wrap items-center justify-center gap-3 py-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500">
                <span className="inline-block h-2.5 w-5 rounded-xs bg-[#4BBB80]" />
                <span>Direct 50%</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500">
                <span className="inline-block h-2.5 w-5 rounded-xs bg-[#FEECE9]" />
                <span>Referal 25%</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500">
                <span className="inline-block h-2.5 w-5 rounded-xs border border-neutral-200 bg-[#FAF7F0]" />
                <span>Organic 25%</span>
              </div>
            </div>

            <div className="relative flex items-center justify-center py-4">
              <svg className="h-60 w-60 max-w-full overflow-visible" viewBox="0 0 200 200">
                <g transform="rotate(-90 100 100)">
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    stroke="#4BBB80"
                    strokeWidth="26"
                    strokeDasharray="219.91 439.82"
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
                    strokeDasharray="109.95 439.82"
                    strokeDashoffset="-219.91"
                    fill="none"
                    className="transition-all duration-300"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    stroke="#FAF7F0"
                    strokeWidth="26"
                    strokeDasharray="109.95 439.82"
                    strokeDashoffset="-329.86"
                    fill="none"
                    className="transition-all duration-300"
                  />
                  <line x1="100" y1="17" x2="100" y2="43" stroke="white" strokeWidth="2.5" />
                  <line x1="100" y1="157" x2="100" y2="183" stroke="white" strokeWidth="2.5" />
                  <line x1="17" y1="100" x2="43" y2="100" stroke="white" strokeWidth="2.5" />
                </g>
              </svg>
            </div>
          </div>

          <div className="mt-2 rounded-lg border border-neutral-100/50 bg-neutral-50/50 py-2 text-center text-[10px] font-medium tracking-wide text-neutral-400">
            Analytics breakdown calculated based on client page referrers.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[22px] md:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col justify-between rounded-xl border border-[#e2e1dd] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.015)]">
          <div>
            <div className="mb-5 flex items-center justify-between border-b border-neutral-100 pb-3.5">
              <h4 className="text-[14px] font-semibold tracking-tight text-black">
                Most Viewed Services
              </h4>
              <a href="#view-all" className="text-[11.5px] font-medium text-[#4138C4] hover:underline">
                View All
              </a>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3.5 border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
                <img
                  src="https://images.unsplash.com/photo-1541462608141-2f58c7340273?auto=format&fit=crop&w=120&q=80"
                  alt="design figma"
                  className="h-[50px] w-[72px] shrink-0 rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <h5
                    className="line-clamp-2 text-[11.5px] font-medium leading-snug text-black"
                    title="I will design modern websites in figma or adobe xd"
                  >
                    I will design modern websites in figma or adobe xd
                  </h5>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5 text-[10.5px] font-medium text-amber-500">
                      <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
                      <span>4.82</span>
                    </div>
                    <span className="text-[10px] font-medium text-neutral-400">
                      Starting at <span className="text-[11px] font-semibold text-black">{formatNPR(legacyUsdToNpr(983))}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
                <img
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80"
                  alt="flat illustration"
                  className="h-[50px] w-[72px] shrink-0 rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <h5
                    className="line-clamp-2 text-[11.5px] font-medium leading-snug text-black"
                    title="I will create modern flat design illustration"
                  >
                    I will create modern flat design illustration
                  </h5>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5 text-[10.5px] font-medium text-amber-500">
                      <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
                      <span>4.82</span>
                    </div>
                    <span className="text-[10px] font-medium text-neutral-400">
                      Starting at <span className="text-[11px] font-semibold text-black">{formatNPR(legacyUsdToNpr(983))}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
                <img
                  src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=120&q=80"
                  alt="responsive html css"
                  className="h-[50px] w-[72px] shrink-0 rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <h5
                    className="line-clamp-2 text-[11.5px] font-medium leading-snug text-black"
                    title="I will build a fully responsive design in HTML,CSS, bootstrap, and javascript"
                  >
                    I will build a fully responsive design in HTML,CSS, bootstrap, and javascript
                  </h5>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5 text-[10.5px] font-medium text-amber-500">
                      <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
                      <span>4.82</span>
                    </div>
                    <span className="text-[10px] font-medium text-neutral-400">
                      Starting at <span className="text-[11px] font-semibold text-black">{formatNPR(legacyUsdToNpr(983))}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-[#e2e1dd] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.015)]">
          <div>
            <div className="mb-5 flex items-center justify-between border-b border-neutral-100 pb-3.5">
              <h4 className="text-[14px] font-semibold tracking-tight text-black">
                Recent Purchased Services
              </h4>
              <a href="#view-all" className="text-[11.5px] font-medium text-[#4138C4] hover:underline">
                View All
              </a>
            </div>

            <div className="space-y-[18px]">
              <div className="flex items-start gap-3 border-b border-neutral-100 pb-[18px] last:border-0 last:pb-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e3e35] text-white">
                  <svg
                    className="h-5 w-5 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                      strokeWidth="1.8"
                    />
                  </svg>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-[11.5px] leading-snug text-black">
                    <span className="font-semibold text-black">Medium.</span>{' '}
                    <span className="font-medium text-[#3ca871]">has purchased</span> I will deal
                    with your item Description and assets
                  </p>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-neutral-400">February 26, 2021</span>
                    <span className="font-semibold text-black">{formatNPR(legacyUsdToNpr(983))}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 border-b border-neutral-100 pb-[18px] last:border-0 last:pb-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <svg
                    className="h-5 w-5 text-indigo-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-[11.5px] leading-snug text-black">
                    <span className="font-semibold text-black">Medium.</span>{' '}
                    <span className="font-medium text-[#3ca871]">has purchased</span> I will deal
                    with your item Description and assets
                  </p>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-neutral-400">February 26, 2021</span>
                    <span className="font-semibold text-black">{formatNPR(legacyUsdToNpr(983))}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 border-b border-neutral-100 pb-[18px] last:border-0 last:pb-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500 font-sans text-sm font-semibold tracking-tighter text-white">
                  in
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-[11.5px] leading-snug text-black">
                    <span className="font-semibold text-black">Medium.</span>{' '}
                    <span className="font-medium text-[#3ca871]">has purchased</span> I will deal
                    with your item Description and assets
                  </p>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-neutral-400">February 26, 2021</span>
                    <span className="font-semibold text-black">{formatNPR(legacyUsdToNpr(983))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-[#e2e1dd] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.015)]">
          <div>
            <div className="mb-5 flex items-center justify-between border-b border-neutral-100 pb-3.5">
              <h4 className="text-[14px] font-semibold tracking-tight text-black">
                Recent Activity
              </h4>
            </div>

            <div className="relative pl-1">
              <div className="absolute bottom-3 left-[54px] top-2 w-[1.5px] bg-[#f0f0f0]" />

              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="mr-4 mt-0.5 w-11 whitespace-nowrap text-right text-[10.5px] font-medium text-neutral-400">
                    08:42
                  </span>
                  <div className="relative z-10 mr-3 mt-1 flex h-[18px] w-[18px] items-center justify-center">
                    <span className="h-3.5 w-3.5 rounded-full border-[3px] border-[#9a0026] bg-white" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-[11.5px] font-semibold leading-snug text-black">
                      Purchase by Ali Price
                    </p>
                    <p className="text-[10.5px] font-normal leading-normal text-neutral-500">
                      Product noise evolve smartwatch
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="mr-4 mt-0.5 w-11 whitespace-nowrap text-right text-[10.5px] font-medium text-neutral-400">
                    14:37
                  </span>
                  <div className="relative z-10 mr-3 mt-1 flex h-[18px] w-[18px] items-center justify-center">
                    <span className="h-3.5 w-3.5 rounded-full border-[3px] border-[#f43f5e] bg-white" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-[11.5px] font-semibold leading-snug text-black">
                      Make deposit <span className="font-semibold text-[#4138C4]">{formatNPR(legacyUsdToNpr(700))}</span> to
                      TFN
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="mr-4 mt-0.5 w-11 whitespace-nowrap text-right text-[10.5px] font-medium text-neutral-400">
                    16:50
                  </span>
                  <div className="relative z-10 mr-3 mt-1 flex h-[18px] w-[18px] items-center justify-center">
                    <span className="h-3.5 w-3.5 rounded-full border-[3px] border-[#3b82f6] bg-white" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-[11.5px] font-semibold leading-snug text-black">
                      Natasha Carey have liked the products
                    </p>
                    <p className="text-[10.5px] font-normal leading-normal text-neutral-500">
                      Allow users to like products in your WooCommerce store.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="mr-4 mt-0.5 w-11 whitespace-nowrap text-right text-[10.5px] font-medium text-neutral-400">
                    21:03
                  </span>
                  <div className="relative z-10 mr-3 mt-1 flex h-[18px] w-[18px] items-center justify-center">
                    <span className="h-3.5 w-3.5 rounded-full border-[3px] border-[#f97316] bg-white" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-[11.5px] font-semibold leading-snug text-black">
                      Favoried Product
                    </p>
                    <p className="text-[10.5px] font-normal leading-normal text-neutral-500">
                      Esther James have favorited product.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="mr-4 mt-0.5 w-11 whitespace-nowrap text-right text-[10.5px] font-medium text-neutral-400">
                    23:07
                  </span>
                  <div className="relative z-10 mr-3 mt-1 flex h-[18px] w-[18px] items-center justify-center">
                    <span className="h-3.5 w-3.5 rounded-full border-[3px] border-[#8b5cf6] bg-white" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-[11.5px] font-semibold leading-snug text-black">
                      Today offers by Digitech Galaxy
                    </p>
                    <p className="text-[10.5px] font-normal leading-normal text-neutral-500">
                      Offer is valid on orders of Rs.500 Or above for selected products only.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
