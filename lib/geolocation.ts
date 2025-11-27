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
    // Verificar se a API de geolocalização está disponível
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
        console.log("📍 Coordenadas obtidas:", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toISOString(),
        });

        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
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

// Função para formatar coordenadas para Google Maps
export function formatCoordsForGoogleMaps(lat: number, lng: number): string {
  return `${lat},${lng}`;
}

// Função para gerar URL do Google Maps
export function getGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

// Função para gerar URL do Waze
export function getWazeUrl(lat: number, lng: number): string {
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
}

// Função para abrir no Google Maps
export function openInGoogleMaps(lat: number, lng: number): void {
  const url = getGoogleMapsUrl(lat, lng);
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
export function validateCoordinates(lat: number, lng: number): boolean {
  const isLatValid = lat >= -90 && lat <= 90;
  const isLngValid = lng >= -180 && lng <= 180;

  if (!isLatValid) {
    console.error("❌ Latitude inválida:", lat, "(deve estar entre -90 e 90)");
  }

  if (!isLngValid) {
    console.error(
      "❌ Longitude inválida:",
      lng,
      "(deve estar entre -180 e 180)"
    );
  }

  return isLatValid && isLngValid;
}
