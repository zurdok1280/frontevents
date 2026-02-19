// api.ts - Eventos Monitor Latino API Client

// ========== Configuración ==========
const BASE_URL = "https://backevent.monitorlatino.com/api/dashboard";
//const BASE_URL = "http://localhost:8080/api/dashboard/";

// ========== Interfaces ==========
// Interface para los KPis
export interface DashboardKpis {
  totalEmisoras: number;
  totalDeteccionesHoy: number;
} 
// Interface para una detección
export interface Deteccion {
 DeteccionID: number;
  EmisoraID: number;
  Emisora: string;
  Ciudad: string;
  Pais: string;
  stream_owner?: string;
  Artista: string;
  Activo?: boolean;
  Tipo: string;
  Venue: string;
  FechaEvento: string; 
  NombreEvento: string;
  FechaDeteccion: string;
  Duracion?: number;
  AudioUrl: string;
  Contexto: string;
  Transcripcion?: string;
}
// Interface para un evento en el top
export interface TopEvento {
  EventGroupID: number;
  NombreEvento: string;
  Artista: string;
  Ciudad: string;
  Venue: string;
  Fecha: string;
  Spots: number;
  Menciones: number;
  Total: number;
  Alcance: number;
}
// Interface para un artista en el top
export interface TopArtista {
  NombreOficial: string;
  conteo: number;
}
// Interface para la petición de edición (PUT)
export interface EventoUpdateRequest {
  eventGroupId: number;
  nombreEvento?: string;
  venue?: string;
  fechaEvento?: string;
  artistaId?: number;
}
//Interface para los filtros de búsqueda
export interface FiltrosBusqueda {
  fechaInicio?: string;
  fechaFin?: string;
  ciudad?: string;
  pais?: string;
  venue?: string;
  artista?: string;
  emisora?: string;
  fechaEvento?: string;
  tipo?: string;
  rango?: string;
}

// Interface para la respuesta del resumen
export interface MentionsResumeResponse {
  totalEmisoras: number;
  totalDetecciones: number;
  ultimasDetecciones: Deteccion[];
  topArtistas: TopArtista[];
  topEventos: TopEvento[];
}

// ========== Funciones de API ==========
// Funcion para convertir texto a número de días
const getDaysFromRange = (range: string): number => {
  switch (range) {
    case "Últimos 7 días": return 7;
    case "Últimos 14 días": return 14;
    case "Últimos 30 días": return 30;
    case "Este mes": return 30;
    case "Mes anterior": return 60;
    default: return 60; // Valor por defecto (2 meses)
  }
};
//Limpieza para filtrar por 'Todos' en el backend
const buildCleanParams = (filtros?: FiltrosBusqueda): string => {
  if (!filtros) return "";
  const params = new URLSearchParams();

 
  const addIfValid = (key: string, value?: string) => {
    if (value && value.toLowerCase() !== "todos" && value.trim() !== "") {
      params.append(key, value);
    }
  };

  // 1. Filtros de Texto / Selects
  addIfValid("pais", filtros.pais);
  addIfValid("ciudad", filtros.ciudad);
  addIfValid("venue", filtros.venue);
  addIfValid("tipo", filtros.tipo);
  addIfValid("artista", filtros.artista); 
  addIfValid("emisora", filtros.emisora); 

  // Fechas 
  if (filtros.fechaInicio) {
      params.append("fechaInicio", filtros.fechaInicio);
      
      if (filtros.fechaFin) {
          params.append("fechaFin", filtros.fechaFin);
      }
  } else if (filtros.rango) {
      const dias = getDaysFromRange(filtros.rango);
      params.append("dias", dias.toString());
  } else {
      // Default si no se envía nada 
  }

  return params.toString();
};

// Función genérica HTTP
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `${BASE_URL}${cleanEndpoint}`;

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
export async function getDashboardKpis(filtros?: FiltrosBusqueda): Promise<DashboardKpis> {
  const queryString = buildCleanParams(filtros); 
  return fetchAPI<DashboardKpis>(`kpis?${queryString}`);
}
// Obtiene las últimas detecciones
export async function getUltimasDetecciones(filtros?: FiltrosBusqueda): Promise<Deteccion[]> {
  const queryString = buildCleanParams(filtros); 
  return fetchAPI<Deteccion[]>(`ultimas-detecciones?${queryString}`);
}
// Obtiene el top de Artistas
export async function getRankingArtistas(filtros?: FiltrosBusqueda): Promise<TopArtista[]> {
  const queryString = buildCleanParams(filtros); 
  return fetchAPI<TopArtista[]>(`ranking-artistas?${queryString}`);
}
// Obtiene el top de Eventos
export async function getRankingEventos(filtros?: FiltrosBusqueda): Promise<TopEvento[]> {
  const queryString = buildCleanParams(filtros);
  return fetchAPI<TopEvento[]>(`ranking-eventos?${queryString}`);
}
/**
 * Obtiene toda la información del dashboard en una sola función asíncrona.
 * Ejecuta las 4 peticiones en paralelo para optimizar el tiempo de carga.
 */
export async function getMentionsResume(filtros: FiltrosBusqueda): Promise<MentionsResumeResponse> {
  try {
    const [kpis, ultimas, artistas, eventos] = await Promise.all([
      getDashboardKpis(filtros),
      getUltimasDetecciones(filtros),
      getRankingArtistas(filtros),
      getRankingEventos(filtros),
    ]);

    return {
      totalEmisoras: kpis.totalEmisoras,
      totalDetecciones: kpis.totalDeteccionesHoy, 
      ultimasDetecciones: ultimas,
      topArtistas: artistas,
      topEventos: eventos,
    };
  } catch (error) {
    console.error("Error obteniendo el resumen completo (getMentionsResume):", error);
    throw error;
  }
}

//Endpoints de filtros y búsqueda
export async function getFiltrosCiudades(): Promise<string[]> {
  return fetchAPI<string[]>("filtros/ciudades");
}

// filtro/venues
export async function getFiltrosVenues(): Promise<string[]> {
  return fetchAPI<string[]>("filtros/venues");
}

 // Buscar detecciones con filtros dinámicos
export async function buscarDetecciones(filtros: FiltrosBusqueda): Promise<Deteccion[]> {
  const queryString = buildCleanParams(filtros); 
  return fetchAPI<Deteccion[]>(`buscar?${queryString}`);
}

 // Editar un evento (PUT)
export async function updateEvento(data: EventoUpdateRequest): Promise<{ success: boolean; message: string }> {
  return fetchAPI<{ success: boolean; message: string }>("evento/editar", {
    method: 'PUT',
    body: JSON.stringify(data),
  });
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
