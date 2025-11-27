export interface GeolocationResult {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  accuracy?: number;
  timestamp?: number;
}

export interface GeolocationDebugInfo {
  coords: GeolocationResult;
  googleMapsUrl: string;
  wazeUrl: string;
  formattedCoords: string;
}

export function getCurrentLocation(): Promise<GeolocationResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        latitude: null,
        longitude: null,
        error: "Geolocalização não suportada neste dispositivo",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // ⚠️ IMPORTANTE: Garantir que sempre retorna NUMBER, não string
        const latitude = Number(position.coords.latitude);
        const longitude = Number(position.coords.longitude);

        console.log("📍 Coordenadas obtidas (tipo):", {
          latitude,
          longitude,
          latitudeType: typeof latitude,
          longitudeType: typeof longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toISOString(),
        });

        resolve({
          latitude,
          longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          error: null,
        });
      },
      (error) => {
        let errorMessage = "Erro ao obter localização";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permissão de localização negada";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Localização indisponível";
            break;
          case error.TIMEOUT:
            errorMessage = "Tempo esgotado ao obter localização";
            break;
        }

        console.error("❌ Erro de geolocalização:", errorMessage, error);

        resolve({
          latitude: null,
          longitude: null,
          error: errorMessage,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

// ⚠️ SOLUÇÃO: Normalizar coordenadas vindas do banco
export function normalizeCoordinate(coord: string | number): number {
  if (typeof coord === "number") {
    return coord;
  }

  // Converte string com vírgula para ponto
  const normalized = coord.toString().replace(",", ".");
  return parseFloat(normalized);
}

// 🔧 FUNÇÃO PARA SALVAR: Garante formato correto para banco de dados
export function formatCoordinateForDatabase(
  coord: number | null
): number | null {
  if (coord === null) return null;

  // Força o formato com ponto decimal, não vírgula
  const formatted = Number(coord.toString().replace(",", "."));

  // Valida se é um número válido
  if (isNaN(formatted)) {
    console.error("❌ Coordenada inválida:", coord);
    return null;
  }

  return formatted;
}

// Função para formatar coordenadas para Google Maps
export function formatCoordsForGoogleMaps(
  lat: number | string,
  lng: number | string
): string {
  const latNormalized = normalizeCoordinate(lat);
  const lngNormalized = normalizeCoordinate(lng);

  // Garante formato com ponto decimal
  return `${latNormalized.toString().replace(",", ".")},${lngNormalized
    .toString()
    .replace(",", ".")}`;
}

// Função para gerar URL do Google Maps
export function getGoogleMapsUrl(
  lat: number | string,
  lng: number | string
): string {
  const coordsFormatted = formatCoordsForGoogleMaps(lat, lng);
  return `https://www.google.com/maps?q=${coordsFormatted}`;
}

// Função para gerar URL do Waze
export function getWazeUrl(lat: number | string, lng: number | string): string {
  const latNormalized = normalizeCoordinate(lat);
  const lngNormalized = normalizeCoordinate(lng);
  return `https://waze.com/ul?ll=${latNormalized},${lngNormalized}&navigate=yes`;
}

// Função para abrir no Google Maps
export function openInGoogleMaps(
  lat: number | string,
  lng: number | string
): void {
  const url = getGoogleMapsUrl(lat, lng);
  console.log("🗺️ Abrindo URL:", url);
  window.open(url, "_blank");
}

// Função para debug completo
export async function getLocationWithDebug(): Promise<GeolocationDebugInfo | null> {
  const result = await getCurrentLocation();

  if (result.latitude === null || result.longitude === null) {
    console.error("Não foi possível obter localização:", result.error);
    return null;
  }

  const debugInfo: GeolocationDebugInfo = {
    coords: result,
    googleMapsUrl: getGoogleMapsUrl(result.latitude, result.longitude),
    wazeUrl: getWazeUrl(result.latitude, result.longitude),
    formattedCoords: formatCoordsForGoogleMaps(
      result.latitude,
      result.longitude
    ),
  };

  console.log("🗺️ Informações de Debug:", debugInfo);

  return debugInfo;
}

// Função para validar se as coordenadas são válidas
export function validateCoordinates(
  lat: number | string,
  lng: number | string
): boolean {
  const latNormalized = normalizeCoordinate(lat);
  const lngNormalized = normalizeCoordinate(lng);

  const isLatValid = latNormalized >= -90 && latNormalized <= 90;
  const isLngValid = lngNormalized >= -180 && lngNormalized <= 180;

  if (!isLatValid) {
    console.error(
      "❌ Latitude inválida:",
      latNormalized,
      "(deve estar entre -90 e 90)"
    );
  }

  if (!isLngValid) {
    console.error(
      "❌ Longitude inválida:",
      lngNormalized,
      "(deve estar entre -180 e 180)"
    );
  }

  return isLatValid && isLngValid;
}

// 🔧 FUNÇÃO HELPER: Para usar com dados do banco
export function openLocationFromDatabase(
  latitude: string,
  longitude: string
): void {
  console.log("📊 Coordenadas do banco (antes):", { latitude, longitude });

  const latNormalized = normalizeCoordinate(latitude);
  const lngNormalized = normalizeCoordinate(longitude);

  console.log("✅ Coordenadas normalizadas (depois):", {
    latitude: latNormalized,
    longitude: lngNormalized,
  });

  if (validateCoordinates(latNormalized, lngNormalized)) {
    openInGoogleMaps(latNormalized, lngNormalized);
  } else {
    console.error("❌ Coordenadas inválidas após normalização");
  }
}
