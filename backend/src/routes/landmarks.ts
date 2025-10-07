import express from 'express';
import { fetchLandmarksFromGoogle } from '../services/googlePlacesService';
import type { LandmarksResponse } from '../types/landmark';

export const landmarksRouter = express.Router();

landmarksRouter.get('/', async (req, res) => {
  const { region, scale, latitude, longitude } = req.query;

  if (typeof region !== 'string' || region.trim().length === 0) {
    res.status(400).json({ message: 'Query parameter "region" is required.' });
    return;
  }

  const parsedScale = typeof scale === 'string' ? Number(scale) : undefined;
  const parsedLatitude = typeof latitude === 'string' ? Number(latitude) : undefined;
  const parsedLongitude = typeof longitude === 'string' ? Number(longitude) : undefined;

  try {
    const landmarks = await fetchLandmarksFromGoogle({
      region,
      scale: parsedScale,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
    });

    const responseBody: LandmarksResponse = {
      region,
      scale: parsedScale,
      landmarks,
      source: 'google_places',
    };

    res.json(responseBody);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(502).json({
      message: 'Failed to fetch landmarks from Google Places API',
      detail: message,
    });
  }
});
