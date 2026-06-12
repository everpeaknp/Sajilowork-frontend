'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MapPin, Smartphone, Loader2, Navigation, Blend } from 'lucide-react';
import { toast } from 'sonner';
import { detectNepalLocationFromBrowser, GeolocationDetectError } from '@/lib/detectUserLocation';
import {
  searchNominatimNepal,
  shortenNominatimDisplayName,
  type NominatimPlace,
} from '@/lib/nepalLocale';
import { locationService, type City } from '@/services/location.service';
import { cn } from '@/lib/utils';
import {
  postTaskLabel,
  postTaskInputMd,
  postTaskInputError,
  postTaskErrorText,
  postTaskCardActive,
  postTaskCardInactive,
} from '@/components/post-task/postTaskStyles';

export type LocationType = 'in-person' | 'remote' | 'hybrid';

export type LocationFieldsData = {
  location: string;
  locationType: LocationType;
  latitude?: number;
  longitude?: number;
};

type LocationFieldsProps = {
  data: LocationFieldsData;
  onChange: (updates: Partial<LocationFieldsData>) => void;
  variant?: 'post-task' | 'dashboard';
  showErrors?: boolean;
  locationError?: string;
  /** When true, shows Remote / Location / Hybrid (profile-style) instead of two post-task modes only. */
  enableHybrid?: boolean;
  showWorkModeHeading?: boolean;
};

export default function LocationFields({
  data,
  onChange,
  variant = 'post-task',
  showErrors,
  locationError,
  enableHybrid = false,
  showWorkModeHeading = true,
}: LocationFieldsProps) {
  const isDashboard = variant === 'dashboard';
  const needsAddress = data.locationType === 'in-person' || data.locationType === 'hybrid';
  const [isDetecting, setIsDetecting] = useState(false);
  const [suggestions, setSuggestions] = useState<NominatimPlace[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<City[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const searchAbortRef = useRef<AbortController | null>(null);
  const locationInputRef = useRef<HTMLDivElement>(null);
  const suggestionsListId = 'location-fields-suggestions';
  const showLocationError = Boolean(showErrors && locationError);

  const clearCoordinates = useCallback(() => {
    onChange({ latitude: undefined, longitude: undefined });
  }, [onChange]);

  const selectSuggestion = useCallback(
    (place: NominatimPlace) => {
      const latitude = Number(parseFloat(place.lat).toFixed(6));
      const longitude = Number(parseFloat(place.lon).toFixed(6));
      onChange({
        location: shortenNominatimDisplayName(place.display_name),
        latitude,
        longitude,
      });
      setSuggestions([]);
      setCitySuggestions([]);
      setShowSuggestions(false);
      setHighlightIndex(-1);
    },
    [onChange],
  );

  const selectCity = useCallback(
    (city: City) => {
      const label = [city.name, city.state_name].filter(Boolean).join(', ');
      onChange({
        location: label,
        latitude: city.latitude,
        longitude: city.longitude,
      });
      setSuggestions([]);
      setCitySuggestions([]);
      setShowSuggestions(false);
      setHighlightIndex(-1);
    },
    [onChange],
  );

  useEffect(() => {
    if (!needsAddress) {
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
        const [results, cities] = await Promise.all([
          searchNominatimNepal(query, { limit: 6, signal: controller.signal }),
          locationService.searchCities({ query, country_code: 'NP', limit: 6 }),
        ]);
        if (!controller.signal.aborted) {
          setSuggestions(results);
          setCitySuggestions(cities);
          setShowSuggestions(results.length > 0 || cities.length > 0);
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
  }, [data.location, data.locationType, needsAddress]);

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

  const handleLocationTypeChange = (type: LocationType) => {
    if (type === 'remote') {
      onChange({ locationType: type, location: 'Remote', latitude: undefined, longitude: undefined });
      return;
    }

    onChange({
      locationType: type,
      location: data.location === 'Remote' ? '' : data.location,
      latitude: undefined,
      longitude: undefined,
    });
  };

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    toast.info('Detecting your location...');

    try {
      const result = await detectNepalLocationFromBrowser();
      onChange({
        location: result.location,
        latitude: result.latitude,
        longitude: result.longitude,
      });
      toast.success(`Location detected: ${result.location}`);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      toast.error(
        error instanceof GeolocationDetectError
          ? error.message
          : 'Could not determine your location address',
      );
    } finally {
      setIsDetecting(false);
    }
  };

  const cardClass = (active: boolean) =>
    isDashboard
      ? cn(
          'flex flex-1 cursor-pointer flex-col items-center rounded-none border px-3 py-3 text-center transition-all sm:px-4 sm:py-4',
          active
            ? 'border-neutral-900 bg-neutral-900 text-white'
            : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400',
        )
      : cn(
          'flex flex-1 cursor-pointer rounded-xl px-3 py-3 text-center transition-all sm:px-4 sm:py-4',
          active ? postTaskCardActive : postTaskCardInactive,
        );

  const labelClass = isDashboard
    ? 'mb-2 block text-sm font-normal text-neutral-800'
    : `${postTaskLabel} block`;

  const inputClass = isDashboard
    ? cn(
        'w-full rounded-none border border-neutral-200 bg-white py-3 pl-9 pr-11 text-sm font-normal text-black outline-none transition-colors focus:border-neutral-400',
        showLocationError && 'border-red-400',
      )
    : cn(postTaskInputMd, 'py-3 pl-9 pr-11', showLocationError ? postTaskInputError : '');

  const hintClass = isDashboard
    ? 'flex items-center gap-1.5 text-xs font-normal text-neutral-500'
    : 'flex items-center gap-1.5 font-body text-xs text-[#6a719a]';

  const remoteNoteClass = isDashboard
    ? 'rounded-none border border-neutral-100 bg-neutral-50 px-4 py-3 text-sm font-normal text-neutral-600'
    : 'rounded-xl bg-gray-50 px-3 py-3 sm:px-4 sm:py-3.5';

  const iconActiveClass = (active: boolean) =>
    isDashboard
      ? active
        ? 'text-white'
        : 'text-neutral-700'
      : active
        ? 'text-white'
        : 'text-primary';

  const titleClass = (active: boolean) =>
    isDashboard
      ? cn('mb-0.5 text-sm font-medium sm:text-base', active ? 'text-white' : 'text-neutral-900')
      : cn('mb-0.5 font-formula text-sm font-bold sm:text-base');

  const subtitleClass = (active: boolean) =>
    isDashboard
      ? cn(
          'text-[11px] font-normal leading-snug sm:text-xs',
          active ? 'text-white/80' : 'text-neutral-500',
        )
      : cn(
          'font-body text-[11px] font-medium leading-snug sm:text-xs',
          active ? 'text-white/80' : 'text-[#6a719a]',
        );

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        {showWorkModeHeading ? (
          isDashboard ? (
            <label className={labelClass}>
              {enableHybrid ? 'Location' : 'How will this project be done?'}
            </label>
          ) : null
        ) : null}
        <div
          className={cn(
            'gap-2 sm:gap-3',
            enableHybrid ? 'grid grid-cols-1 sm:grid-cols-3' : 'flex',
          )}
        >
          {enableHybrid ? (
            <button
              type="button"
              onClick={() => handleLocationTypeChange('remote')}
              className={cardClass(data.locationType === 'remote')}
            >
              <Smartphone
                className={cn('mx-auto mb-2 h-5 w-5', iconActiveClass(data.locationType === 'remote'))}
              />
              <div className={titleClass(data.locationType === 'remote')}>Remote</div>
              <div className={subtitleClass(data.locationType === 'remote')}>Work from anywhere</div>
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => handleLocationTypeChange('in-person')}
            className={cardClass(data.locationType === 'in-person')}
          >
            <MapPin className={cn('mx-auto mb-2 h-5 w-5', iconActiveClass(data.locationType === 'in-person'))} />
            <div className={titleClass(data.locationType === 'in-person')}>
              {enableHybrid ? 'Location' : 'In-person'}
            </div>
            <div className={subtitleClass(data.locationType === 'in-person')}>
              {enableHybrid ? 'On-site in your area' : 'Freelancer needs to be on-site'}
            </div>
          </button>

          {!enableHybrid ? (
            <button
              type="button"
              onClick={() => handleLocationTypeChange('remote')}
              className={cardClass(data.locationType === 'remote')}
            >
              <Smartphone
                className={cn('mx-auto mb-2 h-5 w-5', iconActiveClass(data.locationType === 'remote'))}
              />
              <div className={titleClass(data.locationType === 'remote')}>Online</div>
              <div className={subtitleClass(data.locationType === 'remote')}>
                Can be completed remotely
              </div>
            </button>
          ) : null}

          {enableHybrid ? (
            <button
              type="button"
              onClick={() => handleLocationTypeChange('hybrid')}
              className={cardClass(data.locationType === 'hybrid')}
            >
              <Blend className={cn('mx-auto mb-2 h-5 w-5', iconActiveClass(data.locationType === 'hybrid'))} />
              <div className={titleClass(data.locationType === 'hybrid')}>Hybrid</div>
              <div className={subtitleClass(data.locationType === 'hybrid')}>Remote and on-site</div>
            </button>
          ) : null}
        </div>
      </div>

      {needsAddress ? (
        <div className="space-y-2">
          <label className={labelClass}>Where do you need this done?</label>
          <div className="relative" ref={locationInputRef}>
            <MapPin
              className={cn(
                'pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2',
                isDashboard ? 'text-neutral-400' : 'text-[#8a96b0]',
              )}
            />
            <input
              type="text"
              role="combobox"
              aria-expanded={showSuggestions}
              aria-controls={suggestionsListId}
              aria-autocomplete="list"
              autoComplete="off"
              className={inputClass}
              placeholder="e.g. Kalimati, Kathmandu or Lalitpur"
              value={data.location}
              onChange={(e) => {
                onChange({ location: e.target.value });
                clearCoordinates();
                setShowSuggestions(true);
              }}
              onFocus={() => {
                if (suggestions.length > 0 || citySuggestions.length > 0) setShowSuggestions(true);
              }}
              onKeyDown={(e) => {
                const total = citySuggestions.length + suggestions.length;
                if (!showSuggestions || total === 0) return;

                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setHighlightIndex((i) => (i < total - 1 ? i + 1 : 0));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setHighlightIndex((i) => (i > 0 ? i - 1 : total - 1));
                } else if (e.key === 'Enter' && highlightIndex >= 0) {
                  e.preventDefault();
                  if (highlightIndex < citySuggestions.length) {
                    selectCity(citySuggestions[highlightIndex]);
                  } else {
                    selectSuggestion(suggestions[highlightIndex - citySuggestions.length]);
                  }
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
              className={cn(
                'absolute right-3 top-1/2 z-10 -translate-y-1/2 transition-colors disabled:text-neutral-400',
                isDashboard ? 'text-neutral-700 hover:text-black' : 'text-primary hover:text-[#0052d9]',
              )}
              title="Detect my location"
            >
              {isDetecting || isSearching ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Navigation className="h-5 w-5" />
              )}
            </button>

            {showSuggestions && (citySuggestions.length > 0 || suggestions.length > 0) ? (
              <ul
                id={suggestionsListId}
                role="listbox"
                data-location-suggestions
                className={cn(
                  'absolute left-0 right-0 top-full z-20 mt-1.5 max-h-56 overflow-y-auto bg-white py-1.5 shadow-xl',
                  isDashboard ? 'rounded-none border border-neutral-200' : 'rounded-xl shadow-[#000d45]/8',
                )}
              >
                {citySuggestions.map((city, index) => (
                  <li key={`city-${city.id}`} role="option" aria-selected={index === highlightIndex}>
                    <button
                      type="button"
                      className={cn(
                        'flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-sm transition-colors',
                        index === highlightIndex
                          ? isDashboard
                            ? 'bg-neutral-100 text-black'
                            : 'bg-[#eef4ff] text-[#000d45]'
                          : isDashboard
                            ? 'text-black hover:bg-neutral-50'
                            : 'text-[#000d45] hover:bg-gray-50',
                      )}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectCity(city)}
                      onMouseEnter={() => setHighlightIndex(index)}
                    >
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="leading-snug">
                        {[city.name, city.state_name].filter(Boolean).join(', ')}
                      </span>
                    </button>
                  </li>
                ))}
                {suggestions.map((place, index) => {
                  const listIndex = citySuggestions.length + index;
                  return (
                    <li key={place.place_id} role="option" aria-selected={listIndex === highlightIndex}>
                      <button
                        type="button"
                        className={cn(
                          'flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-sm transition-colors',
                          listIndex === highlightIndex
                            ? isDashboard
                              ? 'bg-neutral-100 text-black'
                              : 'bg-[#eef4ff] text-[#000d45]'
                            : isDashboard
                              ? 'text-black hover:bg-neutral-50'
                              : 'text-[#000d45] hover:bg-gray-50',
                        )}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectSuggestion(place)}
                        onMouseEnter={() => setHighlightIndex(listIndex)}
                      >
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="leading-snug">
                          {shortenNominatimDisplayName(place.display_name, 4)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            {showSuggestions &&
            !isSearching &&
            data.location.trim().length >= 3 &&
            suggestions.length === 0 &&
            citySuggestions.length === 0 ? (
              <div
                data-location-suggestions
                className={cn(
                  'absolute left-0 right-0 top-full z-20 mt-1.5 bg-white px-3 py-2.5 text-xs shadow-lg',
                  isDashboard
                    ? 'rounded-none border border-neutral-200 text-neutral-500'
                    : 'rounded-xl font-body text-[#6a719a]',
                )}
              >
                No addresses found. Try a nearby area or ward name.
              </div>
            ) : null}
          </div>
          <p className={hintClass}>
            <Navigation className={cn('h-3.5 w-3.5 shrink-0', isDashboard ? 'text-neutral-500' : 'text-primary')} />
            Start typing for suggestions, or use the icon to detect your location
          </p>
          {showLocationError ? (
            <p className={isDashboard ? 'text-xs font-normal text-red-600' : postTaskErrorText}>
              {locationError}
            </p>
          ) : null}
        </div>
      ) : null}

      {data.locationType === 'remote' ? (
        <div className={remoteNoteClass}>
          <p className={isDashboard ? undefined : 'font-body text-xs font-medium text-[#6a719a] sm:text-sm'}>
            {enableHybrid
              ? 'You are available for remote work. No base location is required.'
              : 'This project can be completed remotely. No physical location required.'}
          </p>
        </div>
      ) : null}

      {data.locationType === 'hybrid' ? (
        <div className={remoteNoteClass}>
          <p className={isDashboard ? undefined : 'font-body text-xs font-medium text-[#6a719a] sm:text-sm'}>
            Add your base location so clients can find you for on-site and hybrid opportunities.
          </p>
        </div>
      ) : null}
    </div>
  );
}
