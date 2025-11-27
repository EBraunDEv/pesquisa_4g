export interface GeolocationResult {
  latitude: number | null
  longitude: number | null
  error: string | null
}

export function getCurrentLocation(): Promise<GeolocationResult> {
  return new Promise((resolve) => {
    // Verificar se a API de geolocalização está disponível
    if (!navigator.geolocation) {
      resolve({
        latitude: null,
        longitude: null,
        error: "Geolocalização não suportada neste dispositivo",
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
        })
      },
      (error) => {
        let errorMessage = "Erro ao obter localização"

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permissão de localização negada"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Localização indisponível"
            break
          case error.TIMEOUT:
            errorMessage = "Tempo esgotado ao obter localização"
            break
        }

        resolve({
          latitude: null,
          longitude: null,
          error: errorMessage,
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  })
}
