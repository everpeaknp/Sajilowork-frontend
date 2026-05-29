import type { UserSkill, UserBadge } from '@/types';

export interface PublicUserProfile {
  id: string;
  username?: string | null;
  first_name?: string;
  last_name?: string;
  full_name: string;
  display_name: string;
  profile_image?: string | null;
  cover_image?: string | null;
  bio?: string;
  tagline?: string;
  city?: string;
  state?: string;
  country?: string;
  location_display?: string;
  role?: string;
  average_rating?: number | string;
  total_reviews?: number;
  tasks_completed?: number;
  tasks_posted?: number;
  completion_rate?: number | string;
  hourly_rate?: number | string;
  response_time?: number;
  is_verified_tasker?: boolean;
  is_online?: boolean;
  last_seen?: string;
  online_status?: string;
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
  transportation_tags?: string[];
  skills?: UserSkill[];
  badges?: UserBadge[];
  date_joined?: string;
}

export interface PublicProfileReview {
  id: string;
  task?: string;
  task_title?: string;
  rating: number;
  comment?: string;
  reviewer?: {
    id?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    profile_image?: string;
  };
  created_at?: string;
}
