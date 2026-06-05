/**
 * Location Service — /api/v1/locations/
 */

import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types';

export interface Country {
  id: string;
  name: string;
  code: string;
  code3?: string;
}

export interface State {
  id: string;
  name: string;
  code?: string;
  country: string;
  country_code?: string;
}

export interface City {
  id: string;
  name: string;
  state?: string;
  state_name?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
  is_popular?: boolean;
}

class LocationService {
  async getCountries(params?: { search?: string }): Promise<ApiResponse<Country[]>> {
    const res = await apiClient.get<Country[] | { results: Country[] }>('/locations/countries/', {
      params,
    });
    if (!res.success || !res.data) return res as ApiResponse<Country[]>;
    const raw = res.data;
    return { ...res, data: Array.isArray(raw) ? raw : raw.results ?? [] };
  }

  async getStatesByCountry(countryCode: string): Promise<ApiResponse<State[]>> {
    return apiClient.get('/locations/states/by_country/', {
      params: { country_code: countryCode },
    });
  }

  async searchCities(params: {
    query: string;
    country_code?: string;
    state_code?: string;
    limit?: number;
  }): Promise<City[]> {
    if (params.query.trim().length < 2) return [];
    const res = await apiClient.get<City[]>('/locations/cities/search/', {
      params: {
        query: params.query,
        country_code: params.country_code,
        state_code: params.state_code,
        limit: params.limit ?? 12,
      },
    });
    if (!res.success || !res.data) return [];
    return Array.isArray(res.data) ? res.data : [];
  }

  async getPopularCities(countryCode?: string, limit = 12): Promise<City[]> {
    const res = await apiClient.get<City[]>('/locations/cities/popular/', {
      params: { country_code: countryCode, limit },
    });
    if (!res.success || !res.data) return [];
    return Array.isArray(res.data) ? res.data : [];
  }
}

export const locationService = new LocationService();
export default locationService;
