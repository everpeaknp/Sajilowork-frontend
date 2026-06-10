'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, Loader2, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { getMediaUrl } from '@/lib/utils';
import {
  buildProjectQuestions,
  type Project,
  type ProjectQuestionItem,
} from './projectListData';

interface ProjectQuestionsProps {
  project: Project;
}

const STORAGE_PREFIX = 'project-questions:';

function formatRelativeTime(iso?: string): string {
  if (!iso) return '';
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return '';
  }
}

function loadStoredQuestions(projectId: string): ProjectQuestionItem[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${projectId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProjectQuestionItem[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function saveStoredQuestions(projectId: string, questions: ProjectQuestionItem[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${projectId}`, JSON.stringify(questions));
  } catch {
    // ignore quota errors
  }
}

export default function ProjectQuestions({ project }: ProjectQuestionsProps) {
  const router = useRouter();
  const { user, isCustomer } = useAuth();
  const buyerName = project.companyName;

  const seedQuestions = useMemo(() => buildProjectQuestions(project), [project]);

  const [questions, setQuestions] = useState<ProjectQuestionItem[]>(seedQuestions);
  const [questionText, setQuestionText] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [submittingAnswerId, setSubmittingAnswerId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const canAsk = Boolean(user) && !isCustomer;
  const canAnswer = Boolean(user) && isCustomer;

  useEffect(() => {
    const stored = loadStoredQuestions(project.id);
    setQuestions(stored ?? seedQuestions);
    setQuestionText('');
    setAnswerDrafts({});
    setHydrated(true);
  }, [project.id, seedQuestions]);

  useEffect(() => {
    if (!hydrated) return;
    saveStoredQuestions(project.id, questions);
  }, [hydrated, project.id, questions]);

  const handleAskQuestion = useCallback(async () => {
    const trimmed = questionText.trim();
    if (!trimmed) return;

    if (!user) {
      router.push('/signin');
      return;
    }

    if (isCustomer) {
      toast.error('Only freelancers can ask questions on a project listing.');
      return;
    }

    setSubmittingQuestion(true);
    try {
      const displayName =
        user.full_name ||
        `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
        'Freelancer';

      const newQuestion: ProjectQuestionItem = {
        id: `user-q-${Date.now()}`,
        askedByName: displayName,
        askedByImage: getMediaUrl(user.profile_image) || undefined,
        question: trimmed,
        createdAt: new Date().toISOString(),
      };

      setQuestions((prev) => [newQuestion, ...prev]);
      setQuestionText('');
      toast.success('Question posted');
    } finally {
      setSubmittingQuestion(false);
    }
  }, [isCustomer, questionText, router, user]);

  const handleAnswerQuestion = useCallback(
    async (questionId: string) => {
      const trimmed = (answerDrafts[questionId] || '').trim();
      if (!trimmed) return;

      if (!canAnswer) {
        toast.error('Only the project buyer can reply to questions.');
        return;
      }

      setSubmittingAnswerId(questionId);
      try {
        const answeredAt = new Date().toISOString();
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  answer: trimmed,
                  answeredByName: buyerName,
                  answeredAt,
                }
              : q,
          ),
        );
        setAnswerDrafts((prev) => {
          const next = { ...prev };
          delete next[questionId];
          return next;
        });
        toast.success('Reply posted');
      } finally {
        setSubmittingAnswerId(null);
      }
    },
    [answerDrafts, buyerName, canAnswer],
  );

  const unansweredCount = questions.filter((q) => !q.answer?.trim()).length;

  return (
    <section className="mt-12 border-t border-neutral-200 pt-10" id="project-questions-section">
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-xl font-normal tracking-tight text-black sm:text-2xl">
          <MessageCircle className="h-5 w-5 text-neutral-700" />
          Questions
          <span className="text-base font-normal text-neutral-500">({questions.length})</span>
        </h2>
        <p className="mt-1 text-sm font-normal text-neutral-500">
          Ask about scope, timeline, or requirements before you send a proposal.
        </p>
      </div>

      <div className="space-y-6">
        {canAsk ? (
          <div className="rounded-lg border border-neutral-200 bg-white p-5 sm:p-6">
            <h3 className="mb-3 text-base font-normal text-black sm:text-lg">Ask a question</h3>
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 sm:p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 sm:h-5 sm:w-5" />
              <p className="text-xs font-normal leading-relaxed text-amber-900 sm:text-sm">
                <strong>Important:</strong> Do not share personal contact details in your question.
                Keep all communication on the platform for your safety.
              </p>
            </div>
            <div className="relative">
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Type your question here..."
                rows={4}
                className="w-full resize-none rounded-none border border-neutral-200 bg-white p-4 pr-14 text-sm font-normal text-black outline-none transition-colors focus:border-neutral-400"
              />
              <button
                type="button"
                disabled={!questionText.trim() || submittingQuestion}
                onClick={() => void handleAskQuestion()}
                className="absolute bottom-3 right-3 rounded-full bg-[#222222] p-2.5 text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Post question"
              >
                {submittingQuestion ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        ) : !user ? (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50/80 px-5 py-4 text-sm font-normal text-neutral-600">
            <button
              type="button"
              onClick={() => router.push('/signin')}
              className="font-normal text-black underline underline-offset-2 hover:opacity-80"
            >
              Sign in
            </button>{' '}
            to ask a question about this project.
          </div>
        ) : null}

        {canAnswer && unansweredCount > 0 ? (
          <p className="text-sm font-normal text-neutral-600">
            Reply to {unansweredCount} open question{unansweredCount === 1 ? '' : 's'} so freelancers
            know more about your project.
          </p>
        ) : null}

        <div className="space-y-4">
          <h3 className="text-base font-normal text-black sm:text-lg">
            Previous questions ({questions.length})
          </h3>

          {questions.length === 0 ? (
            <p className="text-sm font-normal text-neutral-500">
              No questions yet. Be the first to ask about this project.
            </p>
          ) : (
            questions.map((q) => (
              <article
                key={q.id}
                className="rounded-lg border border-neutral-200 bg-white px-5 py-5 sm:px-6 sm:py-6"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={
                      q.askedByImage ||
                      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
                    }
                    alt={q.askedByName}
                    className="h-11 w-11 shrink-0 rounded-full border border-neutral-100 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-normal text-black sm:text-base">{q.askedByName}</h4>
                      {q.createdAt ? (
                        <span className="text-xs font-normal text-neutral-400">
                          {formatRelativeTime(q.createdAt)}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm font-normal leading-relaxed text-neutral-700 sm:text-[15px]">
                      {q.question}
                    </p>
                  </div>
                </div>

                {q.answer?.trim() ? (
                  <div className="ml-4 mt-4 border-l-2 border-neutral-200 pl-4 sm:ml-14 sm:pl-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-normal text-white">
                        {buyerName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h4 className="text-xs font-normal text-black sm:text-sm">
                            {q.answeredByName || buyerName}
                          </h4>
                          {q.answeredAt ? (
                            <span className="text-[10px] font-normal text-neutral-400 sm:text-xs">
                              {formatRelativeTime(q.answeredAt)}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs font-normal leading-relaxed text-neutral-600 sm:text-sm">
                          {q.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : canAnswer ? (
                  <div className="ml-4 mt-4 sm:ml-14">
                    <p className="mb-2 text-xs font-normal text-black sm:text-sm">Your reply</p>
                    <div className="relative">
                      <textarea
                        value={answerDrafts[q.id] ?? ''}
                        onChange={(e) =>
                          setAnswerDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                        placeholder="Write your answer..."
                        rows={3}
                        className="w-full resize-none rounded-none border border-neutral-200 bg-white p-4 pr-14 text-sm font-normal text-black outline-none transition-colors focus:border-neutral-400"
                      />
                      <button
                        type="button"
                        disabled={!(answerDrafts[q.id] || '').trim() || submittingAnswerId === q.id}
                        onClick={() => void handleAnswerQuestion(q.id)}
                        className="absolute bottom-3 right-3 rounded-full bg-[#222222] p-2 text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Post reply"
                      >
                        {submittingAnswerId === q.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="ml-4 mt-3 text-xs font-normal italic text-neutral-500 sm:ml-14 sm:text-sm">
                    Waiting for the project buyer to reply.
                  </p>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
