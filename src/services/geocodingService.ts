import type { Tutor, TutorPin } from '../types/tutor';


//Google Geocoding API key 
const GOOGLE_GEOCODING_API_KEY = ''; // ← colocar a chave de API aqui

export type Coordinates = {
  latitude:  number;
  longitude: number;
};

// geocodeAffiliation
// Converte uma string de afiliação numa coordenada GPS.
// Devolve "null" se a geocodificação falhar ou não encontrar resultados.

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

    // ZERO_RESULTS é esperado para afiliações pouco estruturadas, não é um erro.
    if (json.status === 'ZERO_RESULTS') return null;

    console.warn('Geocoding API error:', json.status, afiliacao);
    return null;
  } catch (err) {
    console.warn('Geocoding fetch failed:', err);
    return null;
  }
}

// geocodeBatch
// Geocodifica uma lista de itens em paralelo com controlo de concorrência.
// "concurrency" limita o número de pedidos simultâneos para evitar erros de rate limit.
// Devolve apenas os itens geocodificados com sucesso (os que retornaram null são descartados).
export async function geocodeBatch<T extends { afiliacao: string }>(
  items: T[],
  concurrency = 5,
): Promise<(T & Coordinates)[]> {
  const results: (T & Coordinates)[] = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const slice = items.slice(i, i + concurrency);
    const resolved = await Promise.all(
      slice.map(async (item) => {
        const coords = await geocodeAffiliation(item.afiliacao);
        if (!coords) return null;
        return { ...item, ...coords };
      }),
    );
    // filter(Boolean) remove os nulls, o cast é necessário pois o TS não infere automaticamente.
    results.push(...(resolved.filter(Boolean) as (T & Coordinates)[]));
  }

  return results;
}

// placeTypeLabel (helper interno)
// Traduz os tipos de lugar da Google Places API para um rótulo legível.
// Usado na exibição dos pins sugeridos no mapa.
function placeTypeLabel(types: string[]): string {
  if (types.includes('hospital'))   return 'Hospital';
  if (types.includes('university')) return 'University / Medical School';
  if (types.includes('doctor'))     return 'Medical Practice';
  return 'Medical Center';
}

// fetchNearbyMedicalCenters
// Obtém centros médicos/universitários próximos das coordenadas fornecidas
// via Google Places Nearby Search API.
// Usado no MapScreen quando não há pesquisa ativa (pins sugeridos).
// Valor padrão das coordenadas: Lisboa (fallback quando o GPS não está disponível).
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