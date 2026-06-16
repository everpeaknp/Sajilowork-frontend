/**
 * Dashboard Service
 * 
 * Handles all dashboard-related API calls
 */

import { apiClient } from '@/lib/api/client';
import { ApiResponse } from '@/types';

// Dashboard Types
export interface PlatformOverview {
  users: {
    total: number;
    customers: number;
    taskers: number;
    verified_taskers: number;
  };
  tasks: {
    total: number;
    open: number;
    completed: number;
    completion_rate: number;
  };
  bids: {
    total: number;
    accepted: number;
    acceptance_rate: number;
  };
  reviews: {
    total: number;
    average_rating: number;
  };
  financials: {
    total_payments: number;
    platform_fees: number;
    currency: string;
  };
}

export interface TaskerTierInfo {
  slug: string;
  name: string;
  min_earnings: number;
  service_fee_percent: number;
}

export interface TaskerTierSnapshot {
  current: TaskerTierInfo;
  next: TaskerTierInfo | null;
  earnings_last_30_days: number;
  amount_to_next_tier: number;
  progress_to_next_tier_percent: number;
  milestones: TaskerTierInfo[];
}

export interface ActiveTaskSummary {
  id: string;
  title: string;
  slug: string;
  status: string;
  budget: number;
  currency: string;
}

export type DashboardStatCard = {
  title: string;
  value: string;
  change_val: string;
  change_text: string;
};

export type DashboardChartPoint = {
  month: string;
  val: number;
};

export type DashboardOverviewService = {
  id: string;
  slug: string;
  title: string;
  rating: number;
  views: number;
  starting_price: number;
  currency: string;
  image: string;
  business_logo_url?: string;
  business_name?: string;
  logo_color?: string;
  logo_text?: string;
};

export type DashboardRecentPurchase = {
  buyer_name: string;
  task_title: string;
  amount: number;
  currency: string;
  date: string;
  avatar_initial: string;
  avatar_url?: string;
};

export type DashboardRecentCompletedProject = {
  client_name: string;
  project_title: string;
  amount: number;
  currency: string;
  date: string;
  avatar_initial: string;
  avatar_url?: string;
  slug: string;
};

export type DashboardRecentActivity = {
  time: string;
  title: string;
  subtitle: string;
  color: string;
};

export type DashboardOverviewListing = {
  id: string;
  slug: string;
  title: string;
  listing_kind: 'job' | 'project' | 'service' | 'task';
  status: string;
  budget_amount: number;
  currency: string;
  date: string;
  image: string;
  business_logo_url?: string;
  business_name?: string;
  logo_color?: string;
  logo_text?: string;
};

export type DashboardOverviewPayload = {
  stat_cards: DashboardStatCard[];
  profile_views_chart: DashboardChartPoint[];
  traffic: {
    direct: number;
    referral: number;
    organic: number;
    direct_percent: number;
    referral_percent: number;
    organic_percent: number;
  };
  most_viewed_services: DashboardOverviewService[];
  recent_purchases: DashboardRecentPurchase[];
  my_listings: DashboardOverviewListing[];
  recent_completed_projects: DashboardRecentCompletedProject[];
  recent_activity: DashboardRecentActivity[];
};

export type DashboardOverviewResponse = UserStats & {
  overview: DashboardOverviewPayload;
};

export interface UserStats {
  role: 'customer' | 'tasker';
  tasks?: {
    total?: number;
    open?: number;
    completed: number;
    active?: number;
    active_list?: ActiveTaskSummary[];
  };
  spending?: {
    total: number;
    currency: string;
  };
  bids?: {
    total: number;
    accepted: number;
    pending?: number;
    acceptance_rate: number;
  };
  earnings?: {
    total: number;
    last_30_days?: number;
    wallet_balance: number;
    currency: string;
  };
  tier?: TaskerTierSnapshot;
  reviews: {
    given?: number;
    received?: number;
    average_rating?: number;
    average_rating_given?: number;
  };
}

export interface GrowthMetrics {
  period_days: number;
  new_users: number;
  new_tasks: number;
  new_bids: number;
  revenue: number;
  currency: string;
}

export interface CategoryStatistics {
  id: number;
  name: string;
  slug: string;
  total_tasks: number;
  open_tasks: number;
  completed_tasks: number;
}

export interface RecentActivity {
  recent_tasks: Array<{
    id: number;
    title: string;
    owner: string;
    category: string;
    budget: number;
    status: string;
    created_at: string;
  }>;
  recent_bids: Array<{
    id: number;
    tasker: string;
    task_title: string;
    amount: number;
    status: string;
    created_at: string;
  }>;
  recent_reviews: Array<{
    id: number;
    reviewer: string;
    reviewee: string;
    rating: number;
    created_at: string;
  }>;
}

export interface FinancialSummary {
  period_days: number;
  total_revenue: number;
  platform_fees: number;
  refunds: number;
  payouts: number;
  net_revenue: number;
  currency: string;
}

export interface TopPerformer {
  id: number;
  name: string;
  email: string;
  completed_tasks: number;
  average_rating: number;
  total_earned: number;
}

class DashboardService {
  private readonly BASE_PATH = '/dashboard';

  /**
   * Get platform overview (admin only)
   */
  async getPlatformOverview(): Promise<ApiResponse<PlatformOverview>> {
    return apiClient.get(`${this.BASE_PATH}/platform_overview/`);
  }

  /**
   * Get current user's statistics
   */
  async getMyStats(): Promise<ApiResponse<UserStats>> {
    return apiClient.get(`${this.BASE_PATH}/my_stats/`);
  }

  async getMyOverview(): Promise<ApiResponse<DashboardOverviewResponse>> {
    return apiClient.get(`${this.BASE_PATH}/my_overview/`);
  }

  /**
   * Get growth metrics (admin only)
   */
  async getGrowthMetrics(days: number = 30): Promise<ApiResponse<GrowthMetrics>> {
    return apiClient.get(`${this.BASE_PATH}/growth_metrics/`, {
      params: { days }
    });
  }

  /**
   * Get category statistics (admin only)
   */
  async getCategoryStatistics(): Promise<ApiResponse<CategoryStatistics[]>> {
    return apiClient.get(`${this.BASE_PATH}/category_statistics/`);
  }

  /**
   * Get recent activity (admin only)
   */
  async getRecentActivity(limit: number = 10): Promise<ApiResponse<RecentActivity>> {
    return apiClient.get(`${this.BASE_PATH}/recent_activity/`, {
      params: { limit }
    });
  }

  /**
   * Get financial summary (admin only)
   */
  async getFinancialSummary(days: number = 30): Promise<ApiResponse<FinancialSummary>> {
    return apiClient.get(`${this.BASE_PATH}/financial_summary/`, {
      params: { days }
    });
  }

  /**
   * Get top performers (admin only)
   */
  async getTopPerformers(limit: number = 10): Promise<ApiResponse<TopPerformer[]>> {
    return apiClient.get(`${this.BASE_PATH}/top_performers/`, {
      params: { limit }
    });
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
