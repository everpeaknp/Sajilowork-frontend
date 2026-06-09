"use client";

import { useState } from 'react';
import { ChevronLeft, Loader2, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import {
  DEFAULT_COUNTRY,
  NEPAL_PROVINCES,
  parseNepalBillingFromNominatim,
} from '@/lib/nepalLocale';

interface BillingAddressFormProps {
  streetAddress: string;
  city: string;
  postcode: string;
  state: string;
  isLoading: boolean;
  onBack: () => void;
  onStreetAddressChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onPostcodeChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onSubmit: () => void;
}

export default function BillingAddressForm({
  streetAddress,
  city,
  postcode,
  state,
  isLoading,
  onBack,
  onStreetAddressChange,
  onCityChange,
  onPostcodeChange,
  onStateChange,
  onSubmit,
}: BillingAddressFormProps) {
  const [isDetecting, setIsDetecting] = useState(false);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsDetecting(true);
    toast('Detecting your location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = Number(position.coords.latitude.toFixed(6));
        const longitude = Number(position.coords.longitude.toFixed(6));

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&countrycodes=np`,
            {
              headers: { 'Accept-Language': 'en' },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to get location details');
          }

          const geo = await response.json();
          const parsed = parseNepalBillingFromNominatim(geo.address);

          if (parsed.streetAddress) onStreetAddressChange(parsed.streetAddress);
          if (parsed.city) onCityChange(parsed.city);
          if (parsed.postcode) onPostcodeChange(parsed.postcode);
          if (parsed.state) onStateChange(parsed.state);

          const summary = [parsed.streetAddress, parsed.city, parsed.state]
            .filter(Boolean)
            .join(', ');

          if (summary) {
            toast.success(`Location detected: ${summary}, ${DEFAULT_COUNTRY}`);
          } else {
            toast.error('Could not parse a full address from your location');
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          toast.error('Could not determine your address');
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        setIsDetecting(false);

        let errorMessage = 'Could not detect your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              'Location permission denied. Please enable location access in your browser.';
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
        maximumAge: 0,
      }
    );
  };

  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-brand-emerald font-bold mb-6 hover:underline"
      >
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>

      <h3 className="text-2xl font-bold text-brand-dark mb-2">Add billing address</h3>
      <p className="text-sm text-on-surface-variant mb-6">
        This address will be used for billing and invoices in Nepal
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">
            Street address
          </label>
          <div className="relative">
            <input
              type="text"
              value={streetAddress}
              onChange={(e) => onStreetAddressChange(e.target.value)}
              placeholder="e.g. Thamel, Ward 26 or House 12, Kalimati"
              className="w-full px-4 py-3 pr-12 border-2 border-outline-variant rounded-xl focus:outline-none focus:border-brand-emerald transition-all text-on-surface"
            />
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetecting || isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-emerald hover:text-brand-emerald/80 disabled:text-on-surface-variant disabled:cursor-not-allowed transition-colors"
              title="Detect my location"
              aria-label="Detect my location"
            >
              {isDetecting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Navigation className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-on-surface-variant flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 shrink-0" />
            Tap the icon to auto-detect your address in Nepal
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">
              City / municipality
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              placeholder="Kathmandu"
              className="w-full px-4 py-3 border-2 border-outline-variant rounded-xl focus:outline-none focus:border-brand-emerald transition-all text-on-surface"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">
              Postal code
            </label>
            <input
              type="text"
              value={postcode}
              onChange={(e) => onPostcodeChange(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="44600"
              maxLength={5}
              inputMode="numeric"
              className="w-full px-4 py-3 border-2 border-outline-variant rounded-xl focus:outline-none focus:border-brand-emerald transition-all text-on-surface"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">
            Province
          </label>
          <select
            value={state}
            onChange={(e) => onStateChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-outline-variant rounded-xl focus:outline-none focus:border-brand-emerald transition-all text-on-surface bg-white appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              paddingRight: '3rem',
            }}
          >
            {NEPAL_PROVINCES.map((province) => (
              <option key={province.value} value={province.value}>
                {province.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">
            Country
          </label>
          <input
            type="text"
            value={DEFAULT_COUNTRY}
            readOnly
            className="w-full px-4 py-3 border-2 border-outline-variant/60 rounded-xl bg-surface-dim text-on-surface-variant cursor-not-allowed"
          />
        </div>

        <button
          onClick={onSubmit}
          disabled={!streetAddress || !city || !postcode || !state || isLoading || isDetecting}
          className="w-full py-3 bg-brand-emerald text-white font-bold rounded-full hover:bg-brand-emerald/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save address'}
        </button>
      </div>
    </>
  );
}
