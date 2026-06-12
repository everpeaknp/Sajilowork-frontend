import {
  buildFreelancerProfileBundle,
  type FreelancerProfileBundle,
} from '@/lib/freelancerProfileFromApi';
import { extractReviewList } from '@/lib/publicProfile';
import type { PortfolioItem } from '@/types';
import type { PublicProfileReview } from '@/types/publicProfile';
import { freelancerService } from '@/services/freelancer.service';

function emptyPortfolio(): PortfolioItem[] {
  return [];
}

export async function loadFreelancerPageData(
  slug: string,
): Promise<FreelancerProfileBundle | null> {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    return null;
  }

  try {
    const [profileResult, reviewsResult, portfolioResult] = await Promise.allSettled([
      freelancerService.getFreelancerBySlug(normalizedSlug),
      freelancerService.getFreelancerReviews(normalizedSlug),
      freelancerService.getFreelancerPortfolio(normalizedSlug),
    ]);

    const profileResponse =
      profileResult.status === 'fulfilled' ? profileResult.value : { success: false, data: null };
    if (!profileResponse.success || !profileResponse.data) {
      return null;
    }

    const profile = profileResponse.data;

    let reviews: PublicProfileReview[] = [];
    if (reviewsResult.status === 'fulfilled' && reviewsResult.value.success && reviewsResult.value.data) {
      const list = Array.isArray(reviewsResult.value.data.results)
        ? reviewsResult.value.data.results
        : [];
      reviews = extractReviewList(list as never);
    }

    let portfolio = emptyPortfolio();
    if (
      portfolioResult.status === 'fulfilled' &&
      portfolioResult.value.success &&
      portfolioResult.value.data
    ) {
      portfolio = portfolioResult.value.data.results ?? [];
    }

    return buildFreelancerProfileBundle(profile, reviews, portfolio);
  } catch {
    return null;
  }
}
