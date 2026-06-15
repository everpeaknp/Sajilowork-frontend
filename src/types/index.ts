// ============================================================================
// CORE TYPES - Aligned with Django Backend Models
// ============================================================================

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]> | null;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// ============================================================================
// User & Authentication Types
// ============================================================================

export type UserRole = 'customer' | 'tasker' | 'admin';

export interface User {
  id: string;
  email: string;
  username?: string | null;
  username_changed_at?: string | null;
  username_can_change?: boolean;
  username_next_change_at?: string | null;
  first_name: string;
  last_name: string;
  full_name: string;
  role: UserRole;
  phone_number?: string;
  profile_image?: string;
  bio?: string;
  tagline?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  
  // Location
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  
  // Tasker specific
  is_verified_tasker?: boolean;
  hourly_rate?: number;
  availability_status?: 'available' | 'busy' | 'offline';
  service_radius?: number;
  
  // Ratings & Stats
  average_rating?: number;
  total_reviews?: number;
  completed_tasks?: number;
  success_rate?: number;
  response_time?: number;
  
  // Financial
  wallet_balance?: number;
  total_earned?: number;
  
  // Metadata
  is_active?: boolean;
  is_email_verified?: boolean;
  is_phone_verified?: boolean;
  has_payment_method?: boolean;
  last_login?: string;
  date_joined?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSkill {
  id: string;
  user?: string;
  name: string;
  details?: string;
  category?: string;
  proficiency_level?: 'beginner' | 'intermediate' | 'expert';
  years_of_experience?: number;
  verified?: boolean;
  created_at?: string;
}

export type SkillCategory =
  | 'skill'
  | 'transport'
  | 'language'
  | 'qualification'
  | 'experience';

export interface UserSkillInput {
  name: string;
  details?: string;
  category?: SkillCategory | string;
  proficiency_level?: 'beginner' | 'intermediate' | 'expert';
  years_of_experience?: number;
}

export interface UserBadge {
  id: string;
  user: string;
  badge_type: string;
  name: string;
  description?: string;
  icon_url?: string;
  is_verified?: boolean;
  verified_at?: string;
  earned_at?: string;
  created_at?: string;
}

export interface Badge {
  id: string;
  user: string;
  badge_type:
    | 'police_check'
    | 'payment_verified'
    | 'mobile_verified'
    | 'electrical_licence'
    | 'plumbing_licence'
    | 'custom_licence'
    | 'identity_verified';
  name?: string;
  description?: string;
  document_number?: string;
  is_verified: boolean;
  verified_at?: string;
  expires_at?: string;
  /** URL of uploaded JPG/PNG/PDF (from API) */
  verification_document?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type UserDocumentStatus = 'pending' | 'approved' | 'rejected';

export type UserDocumentType =
  | 'id_card'
  | 'passport'
  | 'driver_license'
  | 'proof_of_address'
  | 'business_license'
  | 'certificate'
  | 'police_check'
  | 'electrical_licence'
  | 'plumbing_licence'
  | 'custom_licence'
  | 'portfolio';

export interface UserDocument {
  id: string;
  document_type: UserDocumentType | string;
  document_type_display?: string;
  document_url: string;
  document_number?: string;
  status: UserDocumentStatus;
  status_display?: string;
  rejection_reason?: string;
  uploaded_at?: string;
  verified_at?: string | null;
}

export type UserKYCStatus =
  | 'not_started'
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected';

export interface UserKYC {
  id: string;
  pan_number?: string;
  status: UserKYCStatus;
  status_display?: string;
  rejection_reason?: string;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  documents?: UserDocument[];
}

export interface MarketplaceSkill {
  id: string;
  name: string;
  slug: string;
  listing_kind: 'task' | 'job' | 'project' | 'service';
  description?: string;
  is_active?: boolean;
  order?: number;
}

export interface MarketplaceLanguage {
  id: string;
  name: string;
  slug: string;
  is_active?: boolean;
  order?: number;
}

export type PortfolioDocumentStatus = 'pending' | 'approved' | 'rejected';

export interface PortfolioItem {
  id: string;
  user?: string;
  title: string;
  description?: string;
  file: string;
  file_type: string;
  file_size?: number;
  thumbnail?: string;
  order?: number;
  status?: PortfolioDocumentStatus;
  status_display?: string;
  rejection_reason?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone_number?: string;
}

// ============================================================================
// Bid/Offer Types
// ============================================================================

export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';

export interface Bid {
  id: string;
  task: string | Task;
  task_title?: string;
  task_slug?: string;
  task_city?: string;
  task_listing_kind?: string | null;
  task_owner_logo_url?: string | null;
  task_owner_logo_text?: string | null;
  task_owner_logo_color?: string | null;
  task_owner_business_name?: string | null;
  task_owner_name?: string | null;
  task_image?: string | null;
  task_status?: TaskStatus;
  tasker: User;
  amount: number;
  currency?: string;
  proposal: string;
  cover_letter?: string;
  estimated_duration?: number;
  estimated_completion_date?: string;
  status: BidStatus;
  attachments?: string[];
  is_counter_offer?: boolean;
  original_bid?: string;
  counter_offers?: Bid[];
  rejection_reason?: string;
  withdrawal_reason?: string;
  is_pending?: boolean;
  is_accepted?: boolean;
  is_rejected?: boolean;
  messages?: BidMessage[];
  review?: BidReview;
  created_at?: string;
  updated_at?: string;
  accepted_at?: string;
  rejected_at?: string;
  withdrawn_at?: string;
}

export interface BidFormData {
  task: string;
  amount: number;
  currency?: string;
  proposal: string;
  cover_letter?: string;
  estimated_duration?: number;
  estimated_completion_date?: string;
  attachments?: Array<{
    file_url: string;
    file_name: string;
    file_size: number;
    file_type: string;
  }>;
}

export interface BidMessage {
  id: string;
  bid: string;
  sender: string;
  sender_name: string;
  sender_image?: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  created_at?: string;
}

export interface BidReview {
  id: string;
  bid: string;
  reviewer: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at?: string;
}

export interface BidStats {
  total_bids: number;
  pending_bids: number;
  accepted_bids: number;
  rejected_bids: number;
  withdrawn_bids: number;
  average_bid_amount: number;
  acceptance_rate: number;
  total_earned: number;
}

export interface BidNotification {
  id: string;
  bid: string;
  recipient: string;
  notification_type: 'new_bid' | 'bid_accepted' | 'bid_rejected' | 'bid_withdrawn' | 'counter_offer' | 'bid_message';
  message: string;
  is_read: boolean;
  read_at?: string;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ============================================================================
// Task Types
// ============================================================================

export type TaskStatus =
  | 'draft'
  | 'open'
  | 'assigned'
  | 'funded'
  | 'in_progress'
  | 'pending_approval'
  | 'completed'
  | 'cancelled'
  | 'disputed';
export type TaskType = 'one_time' | 'recurring';
export type LocationType = 'remote' | 'in_person' | 'flexible';

export interface Task {
  id: string;
  title: string;
  slug?: string;
  description: string;
  category?: Category | string;
  category_name?: string;
  poster?: User;
  /** UUID string from list API, or nested user from detail API */
  owner?: User | string;
  
  // Flat owner fields (from TaskListSerializer)
  owner_name?: string;
  owner_username?: string;
  owner_image?: string;
  /** Employer business logo (EmployerProfile.logo_image), not personal avatar */
  owner_logo_url?: string;
  owner_logo_text?: string;
  owner_logo_color?: string;
  owner_business_name?: string;
  owner_rating?: number;
  owner_is_verified?: boolean;
  
  // Budget & Payment
  budget_type: 'fixed' | 'hourly';
  budget_amount: number;
  budget_min?: number;
  budget_max?: number;
  budget_currency?: string;
  
  // Location
  location_type: LocationType;
  work_type?: LocationType; // Same as location_type (remote/in_person/flexible)
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  
  // Scheduling
  task_type?: TaskType;
  due_date?: string;
  flexible_date?: boolean;
  estimated_duration?: number;
  start_date?: string | null;
  
  // Status & Assignment
  status: TaskStatus;
  is_open?: boolean;
  assigned_to?: User;
  /** UUID string from list API, or nested user from detail API */
  assigned_tasker?: User | string;
  assigned_at?: string;
  
  // Engagement
  view_count?: number;
  views_count?: number;
  bid_count?: number;
  bids_count?: number;
  bookmark_count?: number;
  bookmarks_count?: number;
  is_bookmarked?: boolean;
  
  // Metadata
  is_featured?: boolean;
  is_urgent?: boolean;
  requires_verification?: boolean;
  created_at?: string;
  updated_at?: string;
  published_at?: string;

  /** Present on task detail responses */
  questions?: TaskQuestion[];

  /** Present on task detail responses */
  attachments?: TaskAttachment[];

  tags?: string[];
  listing_kind?: 'service' | 'project' | 'job' | null;
  /** Parsed dashboard_meta from /api/v1/services/ responses */
  service_meta?: Record<string, unknown> | null;
  /** Parsed dashboard_meta from /api/v1/projects/ responses */
  project_meta?: Record<string, unknown> | null;
  /** Parsed dashboard_meta from /api/v1/jobs/ responses */
  job_meta?: Record<string, unknown> | null;
  primary_image?: string | null;

  /** Present on task detail responses (e.g. time_slot) */
  requirements?: Array<{ type?: string; value?: string; label?: string }>;

  /** Set when merging /my-tasks posted + assigned API lists */
  is_posted_by_me?: boolean;
  is_assigned_to_me?: boolean;

  /** Dual confirmation before escrow release */
  tasker_marked_complete_at?: string | null;
  owner_marked_complete_at?: string | null;
  completion_date?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parent?: string | Category;
  subcategories?: Category[];
  is_active?: boolean;
  task_count?: number;
  order?: number;
  created_at?: string;
}

export interface TaskAttachment {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size?: number;
  uploaded_by?: string;
  uploaded_by_name?: string;
  uploaded_at?: string;
}

export interface TaskQuestion {
  id: string;
  task?: string;
  asked_by?: string;
  asked_by_name?: string;
  asked_by_image?: string;
  /** @deprecated use asked_by_name */
  user?: User;
  question: string;
  answer?: string;
  is_answered?: boolean;
  is_public?: boolean;
  answered_at?: string;
  created_at?: string;
}

// ============================================================================
// Legacy Bid Types (Deprecated - use Bid/Offer types above)
// ============================================================================

// ============================================================================
// Review Types
// ============================================================================

export interface Review {
  id: string;
  task: string;
  task_title?: string;
  task_budget_type?: 'fixed' | 'hourly';
  task_listing_kind?: 'task' | 'service' | 'project' | 'job' | null;
  reviewer: User;
  reviewee: User;
  reviewer_type?: 'customer' | 'tasker';
  review_type?: 'owner_to_provider' | 'provider_to_owner';
  rating: number;
  comment?: string;
  response_text?: string;
  response_at?: string;
  tags?: string[];

  // Detailed ratings
  communication_rating?: number;
  quality_rating?: number;
  professionalism_rating?: number;
  timeliness_rating?: number;

  // Metadata
  is_verified?: boolean;
  helpful_count?: number;
  not_helpful_count?: number;
  user_vote?: 'helpful' | 'not_helpful' | null;
  is_reported?: boolean;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// Chat & Messaging Types
// ============================================================================

export interface Conversation {
  id: string;
  participants: User[];
  task?: string | Task;
  bid?: string;
  other_participant?: User;
  last_message?: {
    id: string;
    sender: string;
    content: string;
    message_type?: string;
    created_at?: string;
    is_read?: boolean;
  };
  last_message_at?: string;
  unread_count?: number;
  is_archived?: boolean;
  is_active?: boolean;
  /** Linked task status (assigned / in_progress / completed / …) */
  task_status?: TaskStatus;
  /** Whether the API allows sending new messages in this thread */
  messaging_enabled?: boolean;
  /** Linked task title for inbox / header display */
  task_title?: string;
  /** URL slug for /task/[slug] navigation */
  task_slug?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  conversation: string;
  sender: User;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  attachment?: string;
  is_read?: boolean;
  read_at?: string;
  created_at?: string;
}

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationType = 
  | 'task_created'
  | 'bid_received'
  | 'bid_accepted'
  | 'bid_rejected'
  | 'task_assigned'
  | 'task_completed'
  | 'review_received'
  | 'message_received'
  | 'payment_received'
  | 'payment_sent';

export interface Notification {
  id: string;
  user: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  action_url?: string;
  is_read?: boolean;
  read_at?: string;
  created_at?: string;
}

// ============================================================================
// Payment Types
// ============================================================================

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'bank_transfer' | 'wallet' | 'paypal' | 'stripe';

export interface Payment {
  id: string;
  task: Task;
  payer: User;
  payee: User;
  amount: number;
  currency?: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  transaction_id?: string;
  platform_fee?: number;
  net_amount?: number;
  created_at?: string;
  completed_at?: string;
}

export interface PaymentMethodData {
  id: string;
  user: string;
  method_type: PaymentMethod | 'esewa';
  is_default?: boolean;
  last_four?: string;
  expiry_date?: string;
  // eSewa fields
  esewa_account_name?: string;
  esewa_phone_number?: string;
  created_at?: string;
}

// ============================================================================
// Wallet Types
// ============================================================================

export interface Wallet {
  id: string;
  user: string;
  balance: number;
  currency?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WalletTransaction {
  id: string;
  wallet: string;
  transaction_type: 'credit' | 'debit';
  amount: number;
  description?: string;
  reference_id?: string;
  created_at?: string;
}

// ============================================================================
// Search & Filter Types
// ============================================================================

export interface SearchFilters {
  query?: string;
  category?: string;
  location?: string;
  budget_min?: number;
  budget_max?: number;
  task_type?: TaskType;
  /** How the task is performed (maps to backend work_type). */
  work_type?: LocationType;
  /** @deprecated Use work_type for browse filters */
  location_type?: LocationType;
  /** Max distance from user_latitude/user_longitude in km */
  distance_km?: number;
  user_latitude?: number;
  user_longitude?: number;
  status?: TaskStatus;
  poster?: string;
  assigned_to?: string;
  sort_by?: 'newest' | 'budget_high' | 'budget_low' | 'closest';
  page?: number;
  page_size?: number;
}

export interface SearchResult {
  tasks: Task[];
  taskers: User[];
  categories: Category[];
  total_count: number;
}

// ============================================================================
// Dashboard & Analytics Types
// ============================================================================

export interface DashboardStats {
  total_tasks?: number;
  active_tasks?: number;
  completed_tasks?: number;
  total_earnings?: number;
  pending_payments?: number;
  average_rating?: number;
  total_reviews?: number;
  response_rate?: number;
}

export interface TaskStats {
  total: number;
  open: number;
  in_progress: number;
  completed: number;
  cancelled: number;
}

// ============================================================================
// Form Types
// ============================================================================

export interface TaskFormData {
  title: string;
  description: string;
  category: string;
  budget_type: 'fixed' | 'hourly';
  budget_amount: number;
  location_type: LocationType;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  due_date?: string;
  flexible_date?: boolean;
  estimated_duration?: number;
  attachments?: File[];
}

export interface ProfileFormData {
  first_name: string;
  last_name: string;
  username?: string;
  phone_number?: string;
  phone?: string;
  role?: 'customer' | 'tasker';
  tagline?: string;
  gender?: string;
  bio?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  hourly_rate?: number;
  service_radius?: number;
}

// ============================================================================
// Legacy Types (for backward compatibility)
// ============================================================================

/** @deprecated Use Task instead */
export interface Job extends Task {}

/** @deprecated Use Bid instead */
export interface Application extends Bid {}

