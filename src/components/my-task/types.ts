export interface Filters {
  categories: string[];
  workType: 'in-person' | 'remotely' | 'all';
  priceRange: { min: number; max: number };
  availableOnly: boolean;
  noOffersOnly: boolean;
  sortBy: string;
  searchQuery: string;
}

export interface Task {
  id: string; // This is the slug (from transformation in my-tasks/page.tsx)
  slug: string; // Slug field for backend operations (required)
  title: string;
  status: string;
  statusLabel?: string;
  canDelete?: boolean;
  canEdit?: boolean;
  canCancel?: boolean;
  location: string;
  coordinates: [number, number];
  price: number;
  category: string;
  workType: 'in-person' | 'remotely' | 'all';
  postedDate: Date;
  dueDate: Date;
  description: string;
  hasOffers: boolean;
  isAssigned: boolean;
  statusColor?: string;
  posterId?: string | null;
  posterUsername?: string | null;
  user: {
    name: string;
    avatar: string;
    rating: number;
  };
}
