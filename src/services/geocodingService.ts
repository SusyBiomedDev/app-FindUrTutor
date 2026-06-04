import type { Tutor, TutorPin } from '../types/tutor';


//Google Geocoding API key 
const GOOGLE_GEOCODING_API_KEY = ''; // ← replace with your actual API key

export type Coordinates = {
  latitude:  number;
  longitude: number;
};

/**
 * Geocodifica uma string de afiliação usando a Google Geocoding API.
 * Retorna as coordenadas ou null se não for possível geocodificar.
 */
export async function geocodeAffiliation(
  afiliacao: string,
): Promise<Coordinates | null> {
  if (!afiliacao?.trim()) return null;

  try {
    const url  = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(afiliacao)}&key=${GOOGLE_GEOCODING_API_KEY}`;
    const res  = await fetch(url);
    const json = await res.json();

    if (json.status === 'OK' && json.results.length > 0) {
      const { lat, lng } = json.results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    }

    if (json.status === 'ZERO_RESULTS') return null;

    console.warn('Geocoding API error:', json.status, afiliacao);
    return null;
  } catch (err) {
    console.warn('Geocoding fetch failed:', err);
    return null;
  }
}

/**
 * Geocodifica uma lista de afiliações em paralelo com controlo de concorrência.
 * Retorna apenas os itens que foram geocodificados com sucesso.
 */
export async function geocodeBatch<T extends { afiliacao: string }>(
  items: T[],
  concurrency = 5,
): Promise<(T & Coordinates)[]> {
  const results: (T & Coordinates)[] = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const slice   = items.slice(i, i + concurrency);
    const resolved = await Promise.all(
      slice.map(async (item) => {
        const coords = await geocodeAffiliation(item.afiliacao);
        if (!coords) return null;
        return { ...item, ...coords };
      }),
    );
    results.push(...(resolved.filter(Boolean) as (T & Coordinates)[]));
  }

  return results;
}

//new addition

function placeTypeLabel(types: string[]): string {
  if (types.includes('hospital'))   return 'Hospital';
  if (types.includes('university')) return 'University / Medical School';
  if (types.includes('doctor'))     return 'Medical Practice';
  return 'Medical Center';
}

export async function fetchNearbyMedicalCenters(
  coords?: Coordinates,
  radiusMeters = 50000,
): Promise<TutorPin[]> {
  const { latitude, longitude } = coords ?? { latitude: 38.7223, longitude: -9.1393 };

  try {
    const url =
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
      `?location=${latitude},${longitude}` +
      `&radius=${radiusMeters}` +
      `&keyword=hospital+medical+university+research` +
      `&key=${GOOGLE_GEOCODING_API_KEY}`;

    const res  = await fetch(url);
    const json = await res.json();

    if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') {
      console.warn('Places API error:', json.status);
      return [];
    }

    return (json.results ?? []).slice(0, 12).map((place: any, i: number) => ({
      id:        place.place_id ?? `nearby-${i}`,
      nome:      place.name,
      area:      placeTypeLabel(place.types ?? []),
      email:     '',
      afiliacao: place.vicinity ?? '',
      latitude:  place.geometry.location.lat,
      longitude: place.geometry.location.lng,
    }));
  } catch (err) {
    console.warn('fetchNearbyMedicalCenters failed:', err);
    return [];
  }
}