import { useState, useMemo } from 'react';
import { Filters } from '@/components/task/types';
import { MOCK_TASKS } from '@/components/task/tasks';

export function useTasks() {
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    workType: 'all',
    priceRange: { min: 10, max: 9999 },
    availableOnly: false,
    noOffersOnly: false,
    sortBy: 'recommended',
    searchQuery: ''
  });

  const filteredTasks = useMemo(() => {
    let result = [...MOCK_TASKS];

    // Search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.location.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query)
      );
    }

    if (filters.categories.length > 0) {
      result = result.filter(task => filters.categories.includes(task.category));
    }

    if (filters.workType !== 'all') {
      result = result.filter(task => task.workType === filters.workType);
    }

    result = result.filter(task => task.price >= filters.priceRange.min && task.price <= filters.priceRange.max);

    if (filters.availableOnly) {
      result = result.filter(task => !task.isAssigned);
    }
    if (filters.noOffersOnly) {
      result = result.filter(task => !task.hasOffers);
    }

    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return b.postedDate.getTime() - a.postedDate.getTime();
        case 'price-high':
          return b.price - a.price;
        case 'price-low':
          return a.price - b.price;
        case 'distance':
          const center = [-31.7490, 115.8080];
          const distA = Math.sqrt(Math.pow(a.coordinates[0] - center[0], 2) + Math.pow(a.coordinates[1] - center[1], 2));
          const distB = Math.sqrt(Math.pow(b.coordinates[0] - center[0], 2) + Math.pow(b.coordinates[1] - center[1], 2));
          return distA - distB;
        default:
          return 0;
      }
    });

    return result;
  }, [filters]);

  return {
    tasks: MOCK_TASKS,
    filteredTasks,
    filters,
    setFilters
  };
}
