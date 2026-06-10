'use client';

import { useState } from 'react';
import { Star, Flag, CornerDownRight, Send, ChevronLeft, ChevronRight } from 'lucide-react';

type ReviewsSubTab = 'services' | 'project' | 'jobs';

interface ReviewItem {
  id: string;
  authorName: string;
  authorInitials: string;
  avatarBg: string;
  rating: number;
  timeAgo: string;
  content: string;
  response?: string;
}

const INITIAL_SERVICES_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    authorName: 'Ali Tufan',
    authorInitials: 'A.T',
    avatarBg: 'bg-[#183B32]',
    rating: 4.98,
    timeAgo: 'Published 2 months ago',
    content:
      "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.",
    response: '',
  },
  {
    id: 'rev-2',
    authorName: 'Wanda Runo',
    authorInitials: 'W.R',
    avatarBg: 'bg-[#4B43DF]',
    rating: 4.88,
    timeAgo: 'Published 1 month ago',
    content:
      'Excellent communication throughout the website setup project! Professional client who detailed the requirements completely and processed milestone approvals instantly.',
    response: 'Thank you Wanda! It was a pleasure collaborating on this Figma design sprint.',
  },
  {
    id: 'rev-3',
    authorName: 'Jane Cooper',
    authorInitials: 'J.C',
    avatarBg: 'bg-[#F2994A]',
    rating: 5.0,
    timeAgo: 'Published 3 weeks ago',
    content:
      'Highly collaborative and helpful feedback loop. I was able to deliver the full-stack React frontend perfectly within schedule because of the crystal clear instructions.',
    response: '',
  },
];

const INITIAL_PROJECT_REVIEWS: ReviewItem[] = [
  {
    id: 'proj-rev-1',
    authorName: 'Arlene McCoy',
    authorInitials: 'A.M',
    avatarBg: 'bg-[#2D9CDB]',
    rating: 4.95,
    timeAgo: 'Published 2 months ago',
    content:
      'Great experience working on the iOS Swift SDK project. Clear technical documentation was provided, allowing us to align API gateways securely and hit deployment targets.',
    response: '',
  },
];

const INITIAL_JOBS_REVIEWS: ReviewItem[] = [
  {
    id: 'job-rev-1',
    authorName: 'Albert Flores',
    authorInitials: 'A.F',
    avatarBg: 'bg-[#9B51E0]',
    rating: 5.0,
    timeAgo: 'Published 2 months ago',
    content:
      'Outstanding team coordination! The staging feedback loops was fast, efficient, and direct. Standard setting freelance client experience.',
    response: '',
  },
];

export default function DashboardReviews() {
  const [activeSubTab, setActiveSubTab] = useState<ReviewsSubTab>('services');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const itemsPerPage = 10;

  const [servicesReviews, setServicesReviews] = useState<ReviewItem[]>(INITIAL_SERVICES_REVIEWS);
  const [projectReviews, setProjectReviews] = useState<ReviewItem[]>(INITIAL_PROJECT_REVIEWS);
  const [jobsReviews, setJobsReviews] = useState<ReviewItem[]>(INITIAL_JOBS_REVIEWS);

  const activeReviews =
    activeSubTab === 'services'
      ? servicesReviews
      : activeSubTab === 'project'
        ? projectReviews
        : jobsReviews;

  const totalPages = Math.max(1, Math.ceil(activeReviews.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const indexOfLastItem = activePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedReviews = activeReviews.slice(indexOfFirstItem, indexOfLastItem);

  const handleTabChange = (tab: ReviewsSubTab) => {
    setActiveSubTab(tab);
    setCurrentPage(1);
    setActiveReplyId(null);
    setReplyText('');
  };

  const pageButtonClass = (page: number) =>
    `flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full border-0 text-sm font-normal outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#52C47F]/30 ${
      activePage === page
        ? 'bg-[#52C47F] font-medium text-white shadow-sm'
        : 'bg-transparent text-black hover:text-[#52C47F]'
    }`;

  const setActiveReviews = (updater: (prev: ReviewItem[]) => ReviewItem[]) => {
    if (activeSubTab === 'services') {
      setServicesReviews(updater);
    } else if (activeSubTab === 'project') {
      setProjectReviews(updater);
    } else {
      setJobsReviews(updater);
    }
  };

  const handleOpenReply = (id: string, existingReply: string) => {
    setActiveReplyId(id);
    setReplyText(existingReply || '');
  };

  const handleSendReply = (id: string) => {
    if (!replyText.trim()) return;

    setActiveReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, response: replyText.trim() } : r)),
    );

    setActiveReplyId(null);
    setReplyText('');
  };

  const subTabClass = (tab: ReviewsSubTab) =>
    `relative cursor-pointer pb-4 text-[15px] font-normal tracking-tight transition-all outline-none ${
      activeSubTab === tab
        ? 'font-medium text-black after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:w-full after:bg-black'
        : 'text-neutral-400 hover:text-neutral-900'
    }`;

  return (
    <div className="animate-in fade-in -mx-4 -my-6 min-h-screen select-none bg-[#f0efec] p-4 font-sans text-black duration-300 sm:-mx-6 sm:p-6 md:-mx-8 md:p-8">
      <div className="mb-8 max-w-7xl pl-1">
        <h1 className="text-3xl font-normal leading-tight tracking-tight text-neutral-900">Reviews</h1>
        <p className="mt-1 text-[15px] font-normal tracking-tight text-neutral-500">
          Lorem ipsum dolor sit amet, consectetur.
        </p>
      </div>

      <div className="mx-auto max-w-7xl rounded-2xl border border-neutral-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] md:p-8">
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

        <div className="space-y-8">
          {activeReviews.length === 0 ? (
            <div className="py-20 text-center text-sm text-neutral-400">No reviews found on this tab.</div>
          ) : (
            paginatedReviews.map((review) => (
              <div key={review.id} className="border-b border-neutral-100 pb-8 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`${review.avatarBg} flex h-[52px] w-[52px] items-center justify-center rounded-full transition-transform hover:scale-105`}
                    >
                      <span className="font-sans text-sm font-semibold tracking-wide text-white">
                        {review.authorInitials}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-[15px] font-medium leading-tight tracking-tight text-neutral-900">
                        {review.authorName}
                      </h4>
                      <div className="flex items-center gap-2.5 text-xs text-neutral-500">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 stroke-none" />
                          <span className="font-medium text-neutral-800">{review.rating.toFixed(2)}</span>
                        </div>
                        <span className="text-neutral-200">|</span>
                        <span className="font-normal text-neutral-400">{review.timeAgo}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="cursor-pointer rounded-lg p-2 text-neutral-400 transition-all hover:bg-neutral-50 hover:text-neutral-800"
                    title="Flag review for policy violation"
                  >
                    <Flag className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  </button>
                </div>

                <p className="mt-5 max-w-[840px] font-sans text-sm font-normal leading-relaxed text-neutral-600">
                  {review.content}
                </p>

                {review.response ? (
                  <div className="animate-in fade-in mt-4 ml-6 max-w-[800px] rounded-r-xl border-l-2 border-[#52C47F]/40 bg-[#FAFBF9] p-4 duration-300">
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-[#183B32]">
                      <CornerDownRight className="h-3.5 w-3.5 text-[#52C47F]" />
                      <span className="uppercase tracking-wider">Your Response</span>
                    </div>
                    <p className="text-sm font-normal italic text-neutral-600">&quot;{review.response}&quot;</p>
                  </div>
                ) : null}

                <div className="mt-5">
                  {activeReplyId === review.id ? (
                    <div className="animate-in slide-in-from-bottom-2 mt-4 max-w-[650px] space-y-3 rounded-xl border border-neutral-100 bg-[#FAFBF9] p-4 duration-300">
                      <div className="mb-1 text-xs font-medium text-neutral-500">
                        Respond to {review.authorName}:
                      </div>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your professional response..."
                        className="min-h-[90px] w-full resize-none rounded-xl border border-neutral-200 bg-white p-3 text-sm font-normal text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#52C47F]"
                      />
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => setActiveReplyId(null)}
                          className="cursor-pointer rounded-xl bg-neutral-100 px-4 py-2 text-xs font-medium text-neutral-600 transition-all hover:bg-neutral-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendReply(review.id)}
                          className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#52C47F] px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-[#43B26F]"
                        >
                          <span>Publish Response</span>
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenReply(review.id, review.response || '')}
                      className="cursor-pointer rounded-xl bg-[#FCF0ED] px-7 py-3 text-sm font-medium text-[#218F56] transition-all hover:scale-[1.02] hover:bg-[#FCE6E1] active:scale-[0.98]"
                    >
                      {review.response ? 'Edit Response' : 'Respond'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {activeReviews.length > 0 ? (
          <div className="mt-10 flex select-none flex-col items-center justify-center gap-4 border-t border-neutral-100 pt-12 font-sans">
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={activePage === 1}
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.01)] outline-none transition-all hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-[#52C47F]/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
              >
                <ChevronLeft className="h-5 w-5 text-black" strokeWidth={1.5} />
              </button>

              <div className="flex items-center gap-1">
                {totalPages <= 6 ? (
                  Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={pageButtonClass(page)}
                    >
                      {page}
                    </button>
                  ))
                ) : (
                  <>
                    {[1, 2, 3, 4, 5].map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={pageButtonClass(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <span className="pointer-events-none flex h-[44px] w-[44px] select-none items-center justify-center text-sm font-normal text-neutral-400">
                      ...
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(totalPages)}
                      className={pageButtonClass(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={activePage === totalPages}
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.01)] outline-none transition-all hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-[#52C47F]/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
              >
                <ChevronRight className="h-5 w-5 text-black" strokeWidth={1.5} />
              </button>
            </div>

            <div className="pt-1 text-sm font-normal tracking-tight text-neutral-800">
              {indexOfFirstItem + 1} – {Math.min(indexOfLastItem, activeReviews.length)} of{' '}
              {activeReviews.length} reviews
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
