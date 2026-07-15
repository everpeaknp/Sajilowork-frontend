'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, Loader2, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { mapTaskQuestionToProjectItem } from '@/lib/projectApi';
import {
  askListingQuestion,
  answerListingQuestion,
  fetchListingQuestions,
  notifyListingQuestionsChanged,
  resolveListingQuestionKind,
  type ListingQuestionKind,
} from '@/lib/listingQuestions';
import {
  type Project,
  type ProjectQuestionItem,
} from '@/components/projects/projectListData';
import UserAvatar from '@/components/common/UserAvatar';
import EmployerAvatarCircle from '@/components/employers/EmployerAvatarCircle';

interface TaskQuestionsProps {
  project: Project;
  listingKind?: ListingQuestionKind;
  /** Render inside tab panel — hides section chrome */
  embedded?: boolean;
  onCountChange?: (count: number) => void;
}

function formatRelativeTime(iso?: string): string {
  if (!iso) return '';
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return '';
  }
}

export default function TaskQuestions({
  project,
  listingKind = 'task',
  embedded = false,
  onCountChange,
}: TaskQuestionsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const posterName = project.companyName;
  const taskSlug = project.slug;
  const resolvedKind = resolveListingQuestionKind(listingKind);
  const listingLabel = resolvedKind === 'project' ? 'project' : 'task';
  const applicantLabel = resolvedKind === 'project' ? 'freelancers' : 'taskers';

  const [questions, setQuestions] = useState<ProjectQuestionItem[]>([]);
  const [questionText, setQuestionText] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [submittingAnswerId, setSubmittingAnswerId] = useState<string | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(Boolean(taskSlug));

  const isOwner = Boolean(
    user?.id && project.ownerId && String(user?.id) === String(project.ownerId),
  );
  const showAskBox = !isOwner;
  const canAnswer = isOwner;

  const loadQuestions = useCallback(async () => {
    if (!taskSlug) return;

    setLoadingQuestions(true);
    try {
      const response = await fetchListingQuestions(taskSlug, resolvedKind);
      if (response.success && response.data) {
        setQuestions(
          response.data.map((item) => mapTaskQuestionToProjectItem(item, posterName)),
        );
      } else {
        setQuestions([]);
      }
    } catch {
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  }, [posterName, resolvedKind, taskSlug]);

  useEffect(() => {
    setQuestionText('');
    setAnswerDrafts({});
    if (taskSlug) {
      void loadQuestions();
    } else {
      setQuestions([]);
    }
  }, [project.id, taskSlug, loadQuestions]);

  const handleAskQuestion = useCallback(async () => {
    const trimmed = questionText.trim();
    if (!trimmed) return;

    if (!user) {
      router.push('/signin');
      return;
    }

    if (isOwner) {
      toast.error(
        resolvedKind === 'project'
          ? 'You cannot ask questions on your own project.'
          : 'You cannot ask questions on your own task.',
      );
      return;
    }

    if (!taskSlug) {
      toast.error(`Questions are not available for this ${listingLabel}.`);
      return;
    }

    setSubmittingQuestion(true);
    try {
      const response = await askListingQuestion(taskSlug, trimmed, resolvedKind);
      if (response.success && response.data) {
        setQuestionText('');
        toast.success('Question posted');
        await loadQuestions();
        notifyListingQuestionsChanged();
      } else {
        toast.error(response.message || 'Failed to post question');
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err && typeof (err as { message: string }).message === 'string'
          ? (err as { message: string }).message
          : 'Failed to post question';
      toast.error(message);
    } finally {
      setSubmittingQuestion(false);
    }
  }, [isOwner, listingLabel, loadQuestions, questionText, resolvedKind, router, taskSlug, user]);

  const handleAnswerQuestion = useCallback(
    async (questionId: string) => {
      const trimmed = (answerDrafts[questionId] || '').trim();
      if (!trimmed) return;

      if (!canAnswer) {
        toast.error(`Only the ${listingLabel} poster can reply to questions.`);
        return;
      }

      if (!taskSlug) {
        toast.error(`Questions are not available for this ${listingLabel}.`);
        return;
      }

      setSubmittingAnswerId(questionId);
      try {
        const response = await answerListingQuestion(
          taskSlug,
          questionId,
          trimmed,
          resolvedKind,
        );
        if (response.success && response.data) {
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === questionId
                ? mapTaskQuestionToProjectItem(response.data!, posterName)
                : q,
            ),
          );
          setAnswerDrafts((prev) => {
            const next = { ...prev };
            delete next[questionId];
            return next;
          });
          toast.success('Reply posted');
          notifyListingQuestionsChanged();
        } else {
          toast.error(response.message || 'Failed to post reply');
        }
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'message' in err && typeof (err as { message: string }).message === 'string'
            ? (err as { message: string }).message
            : 'Failed to post reply';
        toast.error(message);
      } finally {
        setSubmittingAnswerId(null);
      }
    },
    [answerDrafts, canAnswer, listingLabel, posterName, resolvedKind, taskSlug],
  );

  const unansweredCount = questions.filter((q) => !q.answer?.trim()).length;

  useEffect(() => {
    onCountChange?.(questions.length);
  }, [questions.length, onCountChange]);

  return (
    <section
      className={embedded ? '' : 'mt-12 border-t border-neutral-200 pt-10 dark:border-neutral-800'}
      id={embedded ? undefined : 'task-questions-section'}
    >
      {!embedded ? (
        <div className="mb-6">
          <h2 className="flex items-center gap-2 text-xl font-normal tracking-tight text-black sm:text-2xl dark:text-stone-100">
            <MessageCircle className="h-5 w-5 text-neutral-700 dark:text-neutral-400" />
            Questions
            <span className="text-base font-normal text-neutral-500 dark:text-neutral-400">({questions.length})</span>
          </h2>
          <p className="mt-1 text-sm font-normal text-neutral-500 dark:text-neutral-400">
            Ask about scope, timing, or requirements before you{' '}
          {resolvedKind === 'project' ? 'send a proposal' : 'make an offer'}.
          </p>
        </div>
      ) : (
        <p className="mb-4 text-sm font-normal text-neutral-500 dark:text-neutral-400">
          Ask about scope, timing, or requirements before you{' '}
          {resolvedKind === 'project' ? 'send a proposal' : 'make an offer'}.
        </p>
      )}

      <div className="space-y-6">
        {showAskBox ? (
          <div className="rounded-lg border border-neutral-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 text-base font-normal text-black sm:text-lg dark:text-stone-100">Ask a question</h3>
            {!user ? (
              <p className="mb-4 text-sm font-normal text-neutral-600 dark:text-neutral-400">
                <button
                  type="button"
                  onClick={() => router.push('/signin')}
                  className="font-normal text-black underline underline-offset-2 hover:opacity-80 dark:text-stone-100"
                >
                  Sign in
                </button>{' '}
                to post your question.
              </p>
            ) : null}
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 sm:p-3 dark:border-amber-800/50 dark:bg-amber-950/30">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
              <p className="text-[11px] font-normal leading-snug text-amber-900 sm:text-xs dark:text-amber-200/90">
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
                className="w-full resize-none rounded-none border border-neutral-200 bg-white p-4 pr-14 text-sm font-normal text-black outline-none transition-colors focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-stone-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500"
              />
              <button
                type="button"
                disabled={!questionText.trim() || submittingQuestion}
                onClick={() => void handleAskQuestion()}
                className="absolute bottom-3 right-3 rounded-full bg-[#52C47F] p-2.5 text-white transition-colors hover:bg-[#49b071] disabled:cursor-not-allowed disabled:opacity-50"
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
        ) : (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50/80 px-5 py-4 text-sm font-normal text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-400">
            You posted this {listingLabel}. {applicantLabel.charAt(0).toUpperCase()}
            {applicantLabel.slice(1)} can ask questions here — reply in the list below when
            questions come in.
          </div>
        )}

        {canAnswer && unansweredCount > 0 ? (
          <p className="text-sm font-normal text-neutral-600 dark:text-neutral-400">
            Reply to {unansweredCount} open question{unansweredCount === 1 ? '' : 's'} so{' '}
            {applicantLabel} know more about your {listingLabel}.
          </p>
        ) : null}

        <div className="space-y-4">
          <h3 className="text-base font-normal text-black sm:text-lg dark:text-stone-100">
            Previous questions ({questions.length})
          </h3>

          {loadingQuestions ? (
            <div className="flex items-center gap-2 text-sm font-normal text-neutral-500 dark:text-neutral-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading questions…
            </div>
          ) : questions.length === 0 ? (
            <p className="text-sm font-normal text-neutral-500 dark:text-neutral-400">
              No questions yet. Be the first to ask about this {listingLabel}.
            </p>
          ) : (
            questions.map((q) => (
              <article
                key={q.id}
                className="rounded-lg border border-neutral-200 bg-white px-5 py-5 sm:px-6 sm:py-6 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-start gap-4">
                  <UserAvatar
                    src={q.askedByImage}
                    name={q.askedByName}
                    alt={q.askedByName}
                    size="md"
                    className="h-11 w-11 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-normal text-black sm:text-base dark:text-stone-100">{q.askedByName}</h4>
                      {q.createdAt ? (
                        <span className="text-xs font-normal text-neutral-400">
                          {formatRelativeTime(q.createdAt)}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm font-normal leading-relaxed text-neutral-700 sm:text-[15px] dark:text-neutral-300">
                      {q.question}
                    </p>
                  </div>
                </div>

                {q.answer?.trim() ? (
                  <div className="ml-4 mt-4 border-l-2 border-neutral-200 pl-4 sm:ml-14 sm:pl-6 dark:border-neutral-700">
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <EmployerAvatarCircle
                          name={project.employerLogoText || posterName}
                          avatarUrl={project.ownerAvatarUrl}
                          avatarBg={project.companyLogoBg}
                          verified={project.verified}
                          sizeClass="h-9 w-9"
                          textClass="text-xs font-semibold"
                          useDemoIcon={!project.slug}
                          iconType={project.companyIconType}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h4 className="text-xs font-normal text-black sm:text-sm dark:text-stone-100">
                            {q.answeredByName || posterName}
                          </h4>
                          {q.answeredAt ? (
                            <span className="text-[10px] font-normal text-neutral-400 sm:text-xs">
                              {formatRelativeTime(q.answeredAt)}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs font-normal leading-relaxed text-neutral-600 sm:text-sm dark:text-neutral-400">
                          {q.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : canAnswer ? (
                  <div className="ml-4 mt-4 sm:ml-14">
                    <p className="mb-2 text-xs font-normal text-black sm:text-sm dark:text-stone-100">Your reply</p>
                    <div className="relative">
                      <textarea
                        value={answerDrafts[q.id] ?? ''}
                        onChange={(e) =>
                          setAnswerDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                        placeholder="Write your answer..."
                        rows={3}
                        className="w-full resize-none rounded-none border border-neutral-200 bg-white p-4 pr-14 text-sm font-normal text-black outline-none transition-colors focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-stone-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500"
                      />
                      <button
                        type="button"
                        disabled={!(answerDrafts[q.id] || '').trim() || submittingAnswerId === q.id}
                        onClick={() => void handleAnswerQuestion(q.id)}
                        className="absolute bottom-3 right-3 rounded-full bg-[#52C47F] p-2 text-white transition-colors hover:bg-[#49b071] disabled:cursor-not-allowed disabled:opacity-50"
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
                  <p className="ml-4 mt-3 text-xs font-normal italic text-neutral-500 sm:ml-14 sm:text-sm dark:text-neutral-400">
                    Waiting for the {listingLabel} poster to reply.
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
