
"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MapPin, Smartphone, Loader2, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import {
  formatNominatimNepalAddress,
  searchNominatimNepal,
  shortenNominatimDisplayName,
  type NominatimPlace,
} from '@/lib/nepalLocale';

export interface TaskData {
  title: string;
  categoryId: string;
  categoryName: string;
  dateType: 'specific' | 'before' | 'flexible' | '';
  specificDate: string;
  beforeDate: string;
  timeOfDayRequired: boolean;
  timeSlot: 'morning' | 'midday' | 'afternoon' | 'evening' | null;
  location: string;
  locationType: 'in-person' | 'remote';
  latitude?: number;
  longitude?: number;
  details: string;
  budgetType: 'total' | 'hourly';
  budgetAmount: number;
  images: File[];
}

interface LocationStepProps {
  data: TaskData;
  updateData: (updates: Partial<TaskData>) => void;
  showErrors?: boolean;
  errors?: Partial<Record<'location', string>>;
}

export const LocationStep: React.FC<LocationStepProps> = ({ data, updateData, showErrors, errors }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [suggestions, setSuggestions] = useState<NominatimPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const searchAbortRef = useRef<AbortController | null>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const suggestionsListId = 'location-suggestions';
  const showLocationError = Boolean(showErrors && errors?.location);

  const clearCoordinates = useCallback(() => {
    updateData({ latitude: undefined, longitude: undefined });
  }, [updateData]);

  const selectSuggestion = useCallback(
    (place: NominatimPlace) => {
      const latitude = Number(parseFloat(place.lat).toFixed(6));
      const longitude = Number(parseFloat(place.lon).toFixed(6));
      updateData({
        location: shortenNominatimDisplayName(place.display_name),
        latitude,
        longitude,
      });
      setSuggestions([]);
      setShowSuggestions(false);
      setHighlightIndex(-1);
    },
    [updateData]
  );

  useEffect(() => {
    if (data.locationType !== 'in-person') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const query = data.location.trim();
    if (query.length < 3) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      searchAbortRef.current?.abort();
      const controller = new AbortController();
      searchAbortRef.current = controller;
      setIsSearching(true);

      try {
        const results = await searchNominatimNepal(query, {
          limit: 6,
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
          setHighlightIndex(-1);
        }
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
      searchAbortRef.current?.abort();
    };
  }, [data.location, data.locationType]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationInputRef.current &&
        !locationInputRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('[data-location-suggestions]')
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When switching to remote, set a default location value
  const handleLocationTypeChange = (type: 'in-person' | 'remote') => {
    if (type === 'remote') {
      updateData({ locationType: type, location: 'Remote' });
    } else {
      updateData({ locationType: type, location: '' });
    }
  };

  // Auto-detect user's current location
  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsDetecting(true);
    toast.info('Detecting your location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // Backend stores lat/lng as DecimalField(decimal_places=6).
        // Round here so downstream code never has to.
        const latitude = Number(position.coords.latitude.toFixed(6));
        const longitude = Number(position.coords.longitude.toFixed(6));

        try {
          // Use reverse geocoding to get address from coordinates
          // Using OpenStreetMap Nominatim API (free, no API key required)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&countrycodes=np`,
            {
              headers: {
                'Accept-Language': 'en',
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to get location details');
          }

          const geo = await response.json();
          const location = formatNominatimNepalAddress(geo.address);

          updateData({
            location,
            latitude,
            longitude,
          });
          toast.success(`Location detected: ${location}`);
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          toast.error('Could not determine your location address');
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        setIsDetecting(false);
        
        let errorMessage = 'Could not detect your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="w-full">
      <h1
        className="mb-6 text-2xl font-bold uppercase tracking-tight text-[#0a1452] sm:mb-8 sm:text-3xl lg:mb-12 lg:text-4xl"
        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
      >
        Tell us where
      </h1>

      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <button
            type="button"
            onClick={() => handleLocationTypeChange('in-person')}
            className={`flex-1 rounded-2xl border-2 p-5 text-center transition-all cursor-pointer sm:p-8 ${
              data.locationType === 'in-person'
                ? 'bg-[#0a1452] border-[#0a1452] text-white shadow-xl shadow-blue-900/20'
                : 'bg-gray-50 border-transparent text-[#0a1452] hover:border-gray-200'
            }`}
          >
            <MapPin className={`mx-auto mb-3 h-7 w-7 sm:mb-4 sm:h-8 sm:w-8 ${data.locationType === 'in-person' ? 'text-white' : 'text-[#0a1452]'}`} />
            <div className="mb-1 text-lg font-bold sm:mb-2 sm:text-xl">In-person</div>
            <div className={`text-sm font-medium leading-relaxed ${data.locationType === 'in-person' ? 'text-blue-100' : 'text-gray-500'}`}>
              Select this if you need the Tasker physically there
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleLocationTypeChange('remote')}
            className={`flex-1 rounded-2xl border-2 p-5 text-center transition-all cursor-pointer sm:p-8 ${
              data.locationType === 'remote'
                ? 'bg-[#0a1452] border-[#0a1452] text-white shadow-xl shadow-blue-900/20'
                : 'bg-gray-50 border-transparent text-[#0a1452] hover:border-gray-200'
            }`}
          >
            <Smartphone className={`mx-auto mb-3 h-7 w-7 sm:mb-4 sm:h-8 sm:w-8 ${data.locationType === 'remote' ? 'text-white' : 'text-[#0a1452]'}`} />
            <div className="mb-1 text-lg font-bold sm:mb-2 sm:text-xl">Online</div>
            <div className={`text-sm font-medium leading-relaxed ${data.locationType === 'remote' ? 'text-blue-100' : 'text-gray-500'}`}>
              Select this if the Tasker can do it from home
            </div>
          </button>
        </div>

        {data.locationType === 'in-person' && (
          <div className="space-y-4">
            <label className="block text-[15px] font-bold text-[#0a1452]">
              Where in Nepal do you need this done?
            </label>
            <div className="relative" ref={locationInputRef}>
              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 z-10 pointer-events-none" />
              <input
                type="text"
                role="combobox"
                aria-expanded={showSuggestions}
                aria-controls={suggestionsListId}
                aria-autocomplete="list"
                autoComplete="off"
                className={`w-full rounded-2xl bg-gray-50 py-4 pl-12 pr-14 text-base placeholder:text-gray-400 outline-none transition-all sm:py-5 sm:pl-14 sm:pr-16 sm:text-lg ${
                  showLocationError ? 'ring-2 ring-[#ff4d00]' : 'focus:ring-2 focus:ring-[#0066ff]'
                }`}
                placeholder="e.g. Kalimati, Kathmandu or Lalitpur"
                value={data.location}
                onChange={(e) => {
                  updateData({ location: e.target.value });
                  clearCoordinates();
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (!showSuggestions || suggestions.length === 0) return;

                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setHighlightIndex((i) =>
                      i < suggestions.length - 1 ? i + 1 : 0
                    );
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setHighlightIndex((i) =>
                      i > 0 ? i - 1 : suggestions.length - 1
                    );
                  } else if (e.key === 'Enter' && highlightIndex >= 0) {
                    e.preventDefault();
                    selectSuggestion(suggestions[highlightIndex]);
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                    setHighlightIndex(-1);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isDetecting}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#0066ff] hover:text-[#0052cc] disabled:text-gray-400 transition-colors z-10"
                title="Detect my location"
              >
                {isDetecting || isSearching ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Navigation className="w-6 h-6" />
                )}
              </button>

              {showSuggestions && suggestions.length > 0 && (
                <ul
                  id={suggestionsListId}
                  role="listbox"
                  data-location-suggestions
                  className="absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-gray-100 bg-white py-2 shadow-lg shadow-gray-200/80"
                >
                  {suggestions.map((place, index) => (
                    <li key={place.place_id} role="option" aria-selected={index === highlightIndex}>
                      <button
                        type="button"
                        className={`flex w-full items-start gap-3 px-4 py-3 text-left text-[15px] transition-colors ${
                          index === highlightIndex
                            ? 'bg-[#f1f4f9] text-[#0a1452]'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectSuggestion(place)}
                        onMouseEnter={() => setHighlightIndex(index)}
                      >
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0066ff]" />
                        <span className="leading-snug">
                          {shortenNominatimDisplayName(place.display_name, 4)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {showSuggestions &&
                !isSearching &&
                data.location.trim().length >= 3 &&
                suggestions.length === 0 && (
                  <div
                    data-location-suggestions
                    className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-500 shadow-lg"
                  >
                    No addresses found. Try a nearby area or ward name.
                  </div>
                )}
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              Start typing for address suggestions, or use the icon to detect your location
            </p>
            {showLocationError && (
              <p className="mt-2 text-[13px] font-bold text-[#ff4d00]">{errors?.location}</p>
            )}
          </div>
        )}
        
        {data.locationType === 'remote' && (
          <div className="space-y-4">
            <p className="text-[15px] font-medium text-gray-600">
              This task can be completed remotely. No physical location required.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
