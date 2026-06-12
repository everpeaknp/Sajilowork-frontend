import { formatNominatimNepalAddress } from '@/lib/nepalLocale';

export type DetectLocationResult = {
  location: string;
  latitude: number;
  longitude: number;
};

export class GeolocationDetectError extends Error {
  code?: number;

  constructor(message: string, code?: number) {
    super(message);
    this.name = 'GeolocationDetectError';
    this.code = code;
  }
}

export function detectNepalLocationFromBrowser(): Promise<DetectLocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new GeolocationDetectError('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = Number(position.coords.latitude.toFixed(6));
        const longitude = Number(position.coords.longitude.toFixed(6));

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&countrycodes=np`,
            { headers: { 'Accept-Language': 'en' } },
          );

          if (!response.ok) {
            throw new GeolocationDetectError('Failed to get location details');
          }

          const geo = await response.json();
          const location = formatNominatimNepalAddress(geo.address);
          resolve({ location, latitude, longitude });
        } catch (error) {
          if (error instanceof GeolocationDetectError) {
            reject(error);
            return;
          }
          reject(new GeolocationDetectError('Could not determine your location address'));
        }
      },
      (error) => {
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
        reject(new GeolocationDetectError(errorMessage, error.code));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });
}
