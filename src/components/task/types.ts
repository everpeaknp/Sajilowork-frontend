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
  id: string;
  slug: string;
  title: string;
  status: string;
  location: string;
  coordinates: [number, number];
  price: number;
  /** When set, shown on the map pin instead of formatting `price` as NPR. */
  priceLabel?: string;
  category: string;
  workType: 'in-person' | 'remotely' | 'all';
  postedDate: Date;
  dueDate: Date;
  description: string;
  hasOffers: boolean;
  isAssigned: boolean;
  statusColor?: string;
  user: {
    name: string;
    avatar: string;
    rating: number;
    verified?: boolean;
  };
  /** Sidebar sort index (0 = first in sorted browse list) */
  browseOrder?: number;
}
