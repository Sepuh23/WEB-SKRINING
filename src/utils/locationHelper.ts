export interface GeoLocationResult {
  lat: number;
  lng: number;
  accuracy: number;
  cityName: string;
  source: 'gps' | 'ip' | 'preset';
  timestamp: number;
  nearestFaskesName?: string;
  nearestDistanceKm?: number;
  addressDetails?: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export const INDONESIA_CITIES: Record<string, { lat: number; lng: number; name: string; province: string }> = {
  'Kota Bengkulu': {
    lat: -3.7928,
    lng: 102.2608,
    name: 'Kota Bengkulu (Pantai Panjang / Ratu Samban)',
    province: 'Bengkulu',
  },
  'Bengkulu Tengah': {
    lat: -3.7380,
    lng: 102.4280,
    name: 'Bengkulu Tengah (Karang Tinggi)',
    province: 'Bengkulu',
  },
  'Curup / Rejang Lebong': {
    lat: -3.4680,
    lng: 102.5280,
    name: 'Curup (Rejang Lebong, Bengkulu)',
    province: 'Bengkulu',
  },
  'Mukomuko': {
    lat: -2.5830,
    lng: 101.1210,
    name: 'Mukomuko (Bengkulu)',
    province: 'Bengkulu',
  },
  'Manna / Bengkulu Selatan': {
    lat: -4.4680,
    lng: 102.9050,
    name: 'Manna (Bengkulu Selatan)',
    province: 'Bengkulu',
  },
  'Palembang': {
    lat: -2.9761,
    lng: 104.7754,
    name: 'Palembang (Ampera / Sumatera Selatan)',
    province: 'Sumatera Selatan',
  },
  'Padang': {
    lat: -0.9471,
    lng: 100.4172,
    name: 'Padang (Pantai Padang / Sumatera Barat)',
    province: 'Sumatera Barat',
  },
  'Bandar Lampung': {
    lat: -5.4500,
    lng: 105.2667,
    name: 'Bandar Lampung (Lampung)',
    province: 'Lampung',
  },
  'Medan': {
    lat: 3.5952,
    lng: 98.6722,
    name: 'Medan (Merdeka / Sumatera Utara)',
    province: 'Sumatera Utara',
  },
  'Pekanbaru': {
    lat: 0.5071,
    lng: 101.4478,
    name: 'Pekanbaru (Riau)',
    province: 'Riau',
  },
  'Jakarta Pusat': {
    lat: -6.1818,
    lng: 106.8294,
    name: 'Jakarta Pusat (Monas/Menteng)',
    province: 'DKI Jakarta',
  },
  'Jakarta Selatan': {
    lat: -6.2615,
    lng: 106.8106,
    name: 'Jakarta Selatan (Blok M)',
    province: 'DKI Jakarta',
  },
  'Bandung': {
    lat: -6.9175,
    lng: 107.6191,
    name: 'Bandung (Dago/Dipatiukur)',
    province: 'Jawa Barat',
  },
  'Surabaya': {
    lat: -7.2575,
    lng: 112.7521,
    name: 'Surabaya (Gubeng)',
    province: 'Jawa Timur',
  },
  'Yogyakarta': {
    lat: -7.7956,
    lng: 110.3695,
    name: 'Yogyakarta (Malioboro)',
    province: 'D.I. Yogyakarta',
  },
  'Semarang': {
    lat: -6.9667,
    lng: 110.4167,
    name: 'Semarang (Simpang Lima)',
    province: 'Jawa Tengah',
  },
  'Denpasar': {
    lat: -8.6705,
    lng: 115.2126,
    name: 'Denpasar / Kuta (Bali)',
    province: 'Bali',
  },
  'Makassar': {
    lat: -5.1477,
    lng: 119.4327,
    name: 'Makassar (Pantai Losari)',
    province: 'Sulawesi Selatan',
  },
};

/**
 * Haversine formula to compute live distance in km
 */
export const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
};

/**
 * Identify closest city name in Indonesia from coordinates
 */
export const findClosestCity = (lat: number, lng: number): { key: string; name: string; province: string; distance: number } => {
  let closestKey = 'Kota Bengkulu';
  let minDistance = Infinity;

  Object.entries(INDONESIA_CITIES).forEach(([key, city]) => {
    const dist = calculateDistanceKm(lat, lng, city.lat, city.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestKey = key;
    }
  });

  const city = INDONESIA_CITIES[closestKey];
  return {
    key: closestKey,
    name: city.name,
    province: city.province,
    distance: minDistance,
  };
};

/**
 * Reverse geocode coordinates to human readable location (Kecamatan/Kota/Provinsi)
 */
export const reverseGeocodeCoordinates = async (lat: number, lng: number): Promise<string> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      const parts: string[] = [];
      if (data.locality) parts.push(data.locality);
      if (data.city && data.city !== data.locality) parts.push(data.city);
      if (data.principalSubdivision) parts.push(data.principalSubdivision);
      if (parts.length > 0) {
        return parts.join(', ');
      }
    }
  } catch {
    // fall through to closest city algorithm
  }

  const closest = findClosestCity(lat, lng);
  if (closest.distance < 45) {
    return `${closest.key}, ${closest.province}`;
  }
  return `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
};

/**
 * Check permission status for geolocation
 */
export const getGeolocationPermissionStatus = async (): Promise<'granted' | 'prompt' | 'denied' | 'unsupported'> => {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return 'unsupported';
  }
  if (typeof navigator.permissions !== 'undefined' && navigator.permissions.query) {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state;
    } catch {
      return 'prompt';
    }
  }
  return 'prompt';
};

/**
 * Smart GPS detection with browser Geolocation API -> IP Geolocation API fallback -> Bengkulu preset
 */
export const detectUserLocation = async (): Promise<GeoLocationResult> => {
  // 1. Try Browser Navigator Geolocation with high accuracy
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0,
        });
      });

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const locationLabel = await reverseGeocodeCoordinates(lat, lng);

      return {
        lat,
        lng,
        accuracy: Math.round(pos.coords.accuracy) || 5,
        cityName: locationLabel,
        source: 'gps',
        timestamp: pos.timestamp || Date.now(),
      };
    } catch {
      // Browser GPS denied or timed out, continue to IP check
    }
  }

  // 2. Try IP-based location lookup
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        const lat = data.latitude;
        const lng = data.longitude;
        const closest = findClosestCity(lat, lng);
        const cityLabel = data.city ? `${data.city}, ${data.region || closest.province}` : `${closest.key}, ${closest.province}`;
        return {
          lat,
          lng,
          accuracy: 500,
          cityName: cityLabel,
          source: 'ip',
          timestamp: Date.now(),
        };
      }
    }
  } catch {
    // IP lookup failed/offline
  }

  // 3. Fallback to Bengkulu
  const bengkulu = INDONESIA_CITIES['Kota Bengkulu'];
  return {
    lat: bengkulu.lat,
    lng: bengkulu.lng,
    accuracy: 8,
    cityName: 'Kota Bengkulu, Bengkulu',
    source: 'preset',
    timestamp: Date.now(),
  };
};
