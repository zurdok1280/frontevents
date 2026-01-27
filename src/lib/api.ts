// api.ts - Eventos Monitor Latino API Client

// ========== Configuración ==========
const BASE_URL = "https://backevent.monitorlatino.com/api/";

// ========== Interfaces ==========

// Interface para una detección
export interface Deteccion {
  DeteccionID: number;
  EmisoraID: number;
  Emisora: string;
  Ciudad: string;
  Pais: string;
  Artista: string;
  Tipo: string;
  Venue: string;
  FechaEvento: string;
  NombreEvento: string;
  Confidence: number;
  Hora: string;
  AudioUrl: string;
  Contexto: string;
}

// Interface para un artista en el top
export interface TopArtista {
  NombreOficial: string;
  conteo: number;
}

// Interface para la respuesta del resumen
export interface MentionsResumeResponse {
  totalEmisoras: number;
  totalDetecciones: number;
  ultimasDetecciones: Deteccion[];
  topArtistas: TopArtista[];
}

// ========== Funciones de API ==========

// Función genérica para realizar peticiones HTTP
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`Error en fetchAPI (${endpoint}):`, error);
    throw error;
  }
}

// ========== Endpoints  ==========
// Obtiene el resumen de menciones
export async function getMentionsResume(): Promise<MentionsResumeResponse> {
  return fetchAPI<MentionsResumeResponse>("dashboard/resumen");
}

// ========== Ejemplos de uso futuro ==========

/**
 * Ejemplo de cómo agregar un nuevo endpoint GET
 */
// export async function getOtroEndpoint(parametro: string): Promise<any> {
//   return fetchAPI<any>(`endpoint/${parametro}`);
// }

/**
 * Ejemplo de cómo agregar un endpoint POST
 */
// export async function postEjemplo(data: any): Promise<any> {
//   return fetchAPI<any>('endpoint', {
//     method: 'POST',
//     body: JSON.stringify(data),
//   });
// }

/**
 * Ejemplo de cómo agregar un endpoint PUT
 */
// export async function putEjemplo(id: number, data: any): Promise<any> {
//   return fetchAPI<any>(`endpoint/${id}`, {
//     method: 'PUT',
//     body: JSON.stringify(data),
//   });
// }

/**
 * Ejemplo de cómo agregar un endpoint DELETE
 */
// export async function deleteEjemplo(id: number): Promise<any> {
//   return fetchAPI<any>(`endpoint/${id}`, {
//     method: 'DELETE',
//   });
// }
