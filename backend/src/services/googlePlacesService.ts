import type { Landmark } from '../types/landmark';

const DEFAULT_GOOGLE_MAPS_API_KEY = 'DUMMY_GOOGLE_MAPS_API_KEY';
const DEFAULT_MAX_RADIUS = 50000; // meters

interface FetchLandmarksOptions {
  region: string;
  latitude?: number;
  longitude?: number;
  scale?: number;
}

interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address?: string;
  vicinity?: string;
  geometry?: {
    location?: {
      lat?: number;
      lng?: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  photos?: Array<{ photo_reference?: string }>;
}

interface GooglePlacesResponse {
  results: GooglePlace[];
  status: string;
  error_message?: string;
}

const scaleToRadius = (scale?: number): number | undefined => {
  if (scale === undefined || Number.isNaN(scale)) {
    return undefined;
  }

  const normalizedScale = Math.max(1, Math.min(scale, 20));
  const exponent = 20 - normalizedScale;
  const radius = Math.round(Math.min(DEFAULT_MAX_RADIUS, 200 * 2 ** exponent));

  return radius;
};

const buildRequestUrl = ({
  region,
  latitude,
  longitude,
  scale,
}: FetchLandmarksOptions, apiKey: string): string => {
  const radius = scaleToRadius(scale);

  if (latitude !== undefined && longitude !== undefined) {
    const searchParams = new URLSearchParams({
      location: `${latitude},${longitude}`,
      type: 'tourist_attraction',
      key: apiKey,
    });

    if (radius !== undefined) {
      searchParams.set('radius', radius.toString());
    }

    return `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${searchParams.toString()}`;
  }

  const searchParams = new URLSearchParams({
    query: `${region} tourist attractions`,
    key: apiKey,
  });

  if (radius !== undefined) {
    searchParams.set('radius', radius.toString());
  }

  return `https://maps.googleapis.com/maps/api/place/textsearch/json?${searchParams.toString()}`;
};

const transformPlaces = (places: GooglePlace[]): Landmark[] => {
  return places.map((place) => ({
    placeId: place.place_id,
    name: place.name,
    formattedAddress: place.formatted_address ?? place.vicinity ?? '',
    location: {
      lat: place.geometry?.location?.lat ?? 0,
      lng: place.geometry?.location?.lng ?? 0,
    },
    rating: place.rating,
    userRatingsTotal: place.user_ratings_total,
    types: place.types,
    photoReferences: place.photos?.map((photo) => photo.photo_reference ?? '').filter((ref) => ref.length > 0),
  }));
};

export const fetchLandmarksFromGoogle = async (
  options: FetchLandmarksOptions,
): Promise<Landmark[]> => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY ?? DEFAULT_GOOGLE_MAPS_API_KEY;
  const url = buildRequestUrl(options, apiKey);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Google Places API request failed with status ${response.status}`);
  }

  const data = (await response.json()) as GooglePlacesResponse;

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Google Places API returned status ${data.status}: ${data.error_message ?? 'Unknown error'}`);
  }

  return transformPlaces(data.results ?? []);
};
