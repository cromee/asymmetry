export interface Landmark {
  placeId: string;
  name: string;
  formattedAddress: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  userRatingsTotal?: number;
  types?: string[];
  photoReferences?: string[];
}

export interface LandmarksResponse {
  region: string;
  scale?: number;
  landmarks: Landmark[];
  source: 'google_places';
}
