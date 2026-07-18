'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { GeolocationDetectError, detectNepalLocationFromBrowser } from '@/lib/detectUserLocation';
import {
  DEFAULT_COUNTRY,
  parseNepalAddressFromNominatim,
  reverseGeocodeNepal,
  searchNominatimNepal,
  shortenNominatimDisplayName,
  type NominatimPlace,
} from '@/lib/nepalLocale';
import { locationService, type City } from '@/services/location.service';
import { cn } from '@/lib/utils';

export type AddressFieldValues = {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
};

type AddressAutocompleteFieldsProps = {
  values: AddressFieldValues;
  onChange: (updates: Partial<AddressFieldValues>) => void;
  variant?: 'dashboard' | 'default';
  /** Show only street search; city/state/country/postal still fill from geocode. */
  streetOnly?: boolean;
};

export default function AddressAutocompleteFields({
  values,
  onChange,
  variant = 'default',
  streetOnly = false,
}: AddressAutocompleteFieldsProps) {
  const isDashboard = variant === 'dashboard';
  const [isDetecting, setIsDetecting] = useState(false);
  const [suggestions, setSuggestions] = useState<NominatimPlace[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<City[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const searchAbortRef = useRef<AbortController | null>(null);
  const addressInputRef = useRef<HTMLDivElement>(null);
  const suggestionsListId = 'address-autocomplete-suggestions';

  const applyParsedAddress = useCallback(
    (
      parsed: ReturnType<typeof parseNepalAddressFromNominatim>,
      coords?: { latitude: number; longitude: number },
      fallbackStreet?: string
    ) => {
      onChange({
        address: parsed.streetAddress || fallbackStreet || values.address,
        city: parsed.city || values.city,
        state: parsed.state || values.state,
        country: parsed.country || DEFAULT_COUNTRY,
        postalCode: parsed.postcode || values.postalCode,
        ...(coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
      });
    },
    [onChange, values.address, values.city, values.postalCode, values.state]
  );

  const resolvePlaceDetails = useCallback(
    async (place: NominatimPlace) => {
      const latitude = Number(parseFloat(place.lat).toFixed(6));
      const longitude = Number(parseFloat(place.lon).toFixed(6));

      try {
        const geo = await reverseGeocodeNepal(latitude, longitude);
        const parsed = parseNepalAddressFromNominatim(geo.address);
        applyParsedAddress(parsed, { latitude, longitude }, shortenNominatimDisplayName(place.display_name, 3));
      } catch {
        onChange({
          address: shortenNominatimDisplayName(place.display_name, 3),
          country: DEFAULT_COUNTRY,
          latitude,
          longitude,
        });
      }
    },
    [applyParsedAddress, onChange]
  );

  const selectSuggestion = useCallback(
    (place: NominatimPlace) => {
      void resolvePlaceDetails(place);
      setSuggestions([]);
      setCitySuggestions([]);
      setShowSuggestions(false);
      setHighlightIndex(-1);
    },
    [resolvePlaceDetails]
  );

  const selectCity = useCallback(
    (city: City) => {
      const latitude = city.latitude;
      const longitude = city.longitude;
      const label = [city.name, city.state_name].filter(Boolean).join(', ');

      if (latitude !== undefined && longitude !== undefined) {
        void (async () => {
          try {
            const geo = await reverseGeocodeNepal(latitude, longitude);
            const parsed = parseNepalAddressFromNominatim(geo.address);
            applyParsedAddress(parsed, { latitude, longitude }, label);
          } catch {
            onChange({
              address: streetOnly ? label : values.address || label,
              city: city.name,
              state: city.state_name || values.state,
              country: DEFAULT_COUNTRY,
              latitude,
              longitude,
            });
          }
        })();
      } else {
        onChange({
          address: streetOnly ? label : values.address || label,
          city: city.name,
          state: city.state_name || values.state,
          country: DEFAULT_COUNTRY,
        });
      }
      setSuggestions([]);
      setCitySuggestions([]);
      setShowSuggestions(false);
      setHighlightIndex(-1);
    },
    [applyParsedAddress, onChange, streetOnly, values.address, values.state]
  );

  useEffect(() => {
    const query = values.address.trim();
    if (query.length < 3) {
      setSuggestions([]);
      setCitySuggestions([]);
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
          setCitySuggestions([]);
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
  }, [values.address]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addressInputRef.current &&
        !addressInputRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('[data-address-suggestions]')
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    toast.info('Detecting your location...');

    try {
      const result = await detectNepalLocationFromBrowser();
      const geo = await reverseGeocodeNepal(result.latitude, result.longitude);
      const parsed = parseNepalAddressFromNominatim(geo.address);
      applyParsedAddress(parsed, { latitude: result.latitude, longitude: result.longitude }, result.location);
      toast.success(`Location detected: ${result.location}`);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      toast.error(
        error instanceof GeolocationDetectError
          ? error.message
          : 'Could not determine your address'
      );
    } finally {
      setIsDetecting(false);
    }
  };

  const labelClass = isDashboard
    ? 'block text-[15px] font-semibold leading-tight text-neutral-900'
    : 'px-1 text-xs font-bold uppercase tracking-widest text-gray-400';

  const inputClass = isDashboard
    ? 'w-full rounded-xl border border-neutral-200/90 bg-white px-4 py-3.5 text-sm font-medium text-neutral-700 shadow-[0_1px_2px_rgba(0,0,0,0.02)] outline-none transition-all placeholder:text-neutral-400 focus:ring-2 focus:ring-[#52C47F]'
    : 'w-full rounded-2xl border border-outline-variant bg-gray-50 p-4 font-semibold outline-none transition-all focus:bg-white focus:ring-2 focus:ring-brand-emerald';

  const hintClass = isDashboard
    ? 'flex items-center gap-1.5 text-xs font-normal text-neutral-500'
    : 'flex items-center gap-1.5 font-body text-xs text-[#6a719a]';

  const suggestionListClass = cn(
    'absolute left-0 right-0 top-full z-20 mt-1.5 max-h-56 overflow-y-auto bg-white py-1.5 shadow-xl',
    isDashboard ? 'rounded-xl border border-neutral-200' : 'rounded-xl shadow-[#000d45]/8'
  );

  return (
    <>
      <div className={cn('space-y-2', streetOnly ? undefined : 'sm:col-span-2')}>
        <label className={labelClass}>{streetOnly ? 'Location' : 'Street address'}</label>
        <div className="relative" ref={addressInputRef}>
          <MapPin className="absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            role="combobox"
            aria-expanded={showSuggestions}
            aria-controls={suggestionsListId}
            aria-autocomplete="list"
            autoComplete="off"
            value={values.address}
            onChange={(e) => {
              onChange({
                address: e.target.value,
                latitude: undefined,
                longitude: undefined,
              });
              setShowSuggestions(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0 || citySuggestions.length > 0) {
                setShowSuggestions(true);
              }
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
            placeholder="e.g. Kalimati, Kathmandu or Lalitpur"
            className={cn(inputClass, 'pl-11 pr-11')}
          />
          <button
            type="button"
            onClick={() => void handleDetectLocation()}
            disabled={isDetecting}
            className={cn(
              'absolute right-3 top-1/2 z-10 -translate-y-1/2 transition-colors disabled:text-neutral-400',
              isDashboard ? 'text-neutral-700 hover:text-black' : 'text-primary hover:text-[#0052d9]'
            )}
            title="Detect my location"
            aria-label="Detect my location"
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
              data-address-suggestions
              className={suggestionListClass}
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
                          : 'text-[#000d45] hover:bg-gray-50'
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
                            : 'text-[#000d45] hover:bg-gray-50'
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
          values.address.trim().length >= 3 &&
          suggestions.length === 0 &&
          citySuggestions.length === 0 ? (
            <div
              data-address-suggestions
              className={cn(
                'absolute left-0 right-0 top-full z-20 mt-1.5 bg-white px-3 py-2.5 text-xs shadow-lg',
                isDashboard
                  ? 'rounded-xl border border-neutral-200 text-neutral-500'
                  : 'rounded-xl font-body text-[#6a719a]'
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
      </div>

      {!streetOnly ? (
        <>
          <div className="space-y-2">
            <label className={labelClass}>City</label>
            <input
              type="text"
              value={values.city}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder="Kathmandu"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className={labelClass}>State / Province</label>
            <input
              type="text"
              value={values.state}
              onChange={(e) => onChange({ state: e.target.value })}
              placeholder="Bagmati"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className={labelClass}>Country</label>
            <input
              type="text"
              value={values.country}
              onChange={(e) => onChange({ country: e.target.value })}
              placeholder="Nepal"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className={labelClass}>Postal code</label>
            <input
              type="text"
              value={values.postalCode}
              onChange={(e) =>
                onChange({ postalCode: e.target.value.replace(/\D/g, '').slice(0, 5) })
              }
              placeholder="44600"
              maxLength={5}
              inputMode="numeric"
              className={inputClass}
            />
          </div>
        </>
      ) : null}
    </>
  );
}
