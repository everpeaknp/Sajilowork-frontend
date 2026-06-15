import { jobService } from '@/services/job.service';
import { projectService } from '@/services/project.service';
import { taskService } from '@/services/task.service';
import type { ApiResponse, TaskQuestion } from '@/types';

export type ListingQuestionKind = 'task' | 'project' | 'job' | 'service';

export const LISTING_QUESTIONS_CHANGED_EVENT = 'listing-questions-changed';

export function notifyListingQuestionsChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(LISTING_QUESTIONS_CHANGED_EVENT));
}

export function resolveListingQuestionKind(kind?: string | null): ListingQuestionKind {
  if (kind === 'project' || kind === 'job' || kind === 'service') {
    return kind;
  }
  return 'task';
}

export async function fetchListingQuestions(
  slug: string,
  kind: ListingQuestionKind = 'task',
): Promise<ApiResponse<TaskQuestion[]>> {
  if (kind === 'project') {
    return projectService.getProjectQuestions(slug);
  }
  if (kind === 'job') {
    const detail = await jobService.getJobBySlug(slug);
    if (!detail.success || !detail.data) {
      return {
        success: false,
        message: detail.message ?? 'Failed to load questions',
        data: [],
      };
    }
    return { success: true, data: detail.data.questions ?? [], message: 'OK' };
  }
  return taskService.getTaskQuestions(slug);
}

export async function askListingQuestion(
  slug: string,
  question: string,
  kind: ListingQuestionKind = 'task',
): Promise<ApiResponse<TaskQuestion>> {
  if (kind === 'project') {
    return projectService.askQuestion(slug, question);
  }
  if (kind === 'job') {
    return jobService.askQuestion(slug, question);
  }
  return taskService.askQuestion(slug, question);
}

export async function answerListingQuestion(
  slug: string,
  questionId: string,
  answer: string,
  kind: ListingQuestionKind = 'task',
): Promise<ApiResponse<TaskQuestion>> {
  if (kind === 'project') {
    return projectService.answerQuestion(slug, questionId, answer);
  }
  if (kind === 'job') {
    return jobService.answerQuestion(slug, questionId, answer);
  }
  return taskService.answerQuestion(slug, questionId, answer);
}
