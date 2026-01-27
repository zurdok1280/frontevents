import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, Sparkles, Calendar, TrendingUp, Music, Radio, Headphones, MapPin } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMentionsResume, Deteccion } from "@/lib/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Formatear fecha
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
  } catch {
    return dateString;
  }
};

// Colores para tipos
const typeColors: Record<string, string> = {
  "MENCION": "bg-gradient-to-r from-blue-500 to-cyan-500",
  "SPOT": "bg-gradient-to-r from-green-500 to-emerald-500",
};

// Colores para ciudades
const cityColors: Record<string, string> = {
  "Bogota": "bg-gradient-to-r from-blue-500 to-indigo-500",
  "Medellin": "bg-gradient-to-r from-green-500 to-teal-500",
  "Cali": "bg-gradient-to-r from-yellow-500 to-orange-500",
  "Barranquilla": "bg-gradient-to-r from-red-500 to-pink-500",
  "Cartagena": "bg-gradient-to-r from-purple-500 to-pink-500",
};

interface EventsRankingProps {
  selectedCity?: string;
  selectedType?: string;
  selectedVenue?: string;
  sortBy?: string;
}

export const EventsRanking = ({
  selectedCity = "todos",
  selectedType = "todos",
  selectedVenue = "todos",
  sortBy = "date"
}: EventsRankingProps) => {
  const navigate = useNavigate();
  const [detecciones, setDetecciones] = useState<Deteccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getMentionsResume();
        setDetecciones(data.ultimasDetecciones);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error al cargar los datos. Por favor, intente nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refrescar automáticamente cada 15 minutos
    const interval = setInterval(fetchData, 900000);
    return () => clearInterval(interval);
  }, []);

  // Filtrar y ordenar las detecciones
  const filteredAndSortedDetecciones = useMemo(() => {
    let filtered = [...detecciones];

    // Aplicar filtros
    if (selectedCity !== "todos") {
      filtered = filtered.filter(det => det.Ciudad === selectedCity);
    }

    if (selectedType !== "todos") {
      filtered = filtered.filter(det => det.Tipo === selectedType);
    }

    if (selectedVenue !== "todos") {
      filtered = filtered.filter(det => det.Venue === selectedVenue);
    }

    // Ordenar
    if (sortBy === "date") {
      return filtered.sort((a, b) => new Date(b.Hora).getTime() - new Date(a.Hora).getTime());
    }

    if (sortBy === "artist") {
      return filtered.sort((a, b) => a.Artista.localeCompare(b.Artista));
    }

    if (sortBy === "city") {
      return filtered.sort((a, b) => a.Ciudad.localeCompare(b.Ciudad));
    }

    if (sortBy === "venue") {
      return filtered.sort((a, b) => (a.Venue || "").localeCompare(b.Venue || ""));
    }

    if (sortBy === "type") {
      return filtered.sort((a, b) => a.Tipo.localeCompare(b.Tipo));
    }

    // Por defecto: ordenar por fecha (más reciente primero)
    return filtered.sort((a, b) => new Date(b.Hora).getTime() - new Date(a.Hora).getTime());
  }, [detecciones, selectedCity, selectedType, selectedVenue, sortBy]);

  // Función para obtener la letra inicial del artista
  const getInitial = (artista: string) => {
    return artista.charAt(0).toUpperCase();
  };

  // Función para generar un color basado en la letra inicial
  const getColorFromInitial = (initial: string) => {
    const colors = [
      "bg-gradient-to-br from-blue-500 to-cyan-500",
      "bg-gradient-to-br from-purple-500 to-pink-500",
      "bg-gradient-to-br from-green-500 to-emerald-500",
      "bg-gradient-to-br from-orange-500 to-red-500",
      "bg-gradient-to-br from-indigo-500 to-blue-500",
      "bg-gradient-to-br from-yellow-500 to-amber-500",
      "bg-gradient-to-br from-pink-500 to-rose-500",
      "bg-gradient-to-br from-teal-500 to-green-500",
    ];

    const index = initial.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Renderizado para móvil (cards)
  const renderDeteccionCards = (detecciones: Deteccion[]) => (
    <div className="grid gap-4 md:hidden">
      {detecciones.map((det, index) => {
        const initial = getInitial(det.Artista);
        const colorClass = getColorFromInitial(initial);

        return (
          <Card
            key={det.DeteccionID}
            className="group hover-lift overflow-hidden border-0 shadow-lg animate-fade-in cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => navigate(`/artist/${encodeURIComponent(det.Artista)}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                {/* Placeholder con letra del artista */}
                <div className={`w-16 h-16 rounded-full ${colorClass} flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0`}>
                  {initial}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs shadow-md">
                      {index + 1}
                    </div>
                    {index === 0 && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 gap-1 text-xs">
                        <Sparkles className="h-3 w-3" />
                        Reciente
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                    {det.Artista}
                  </h3>
                  <p className="text-sm text-muted-foreground">{det.Emisora}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {det.Ciudad} • {formatDate(det.Hora)}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${typeColors[det.Tipo] || "bg-gradient-to-r from-gray-500 to-slate-500"} text-white border-0 text-xs`}>
                    {det.Tipo}
                  </Badge>
                  <Badge className={`${cityColors[det.Ciudad] || "bg-gradient-to-r from-gray-500 to-slate-500"} text-white border-0 text-xs`}>
                    {det.Ciudad}
                  </Badge>
                </div>

                {det.Venue && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{det.Venue}</span>
                  </div>
                )}
              </div>

              <div className="mb-3">
                <div className="text-xs text-muted-foreground mb-1">Contexto</div>
                <p className="text-sm line-clamp-2">
                  {det.Contexto || "Sin contexto disponible"}
                </p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground">
                  {formatDate(det.Hora)}
                </div>
                <div className="flex items-center gap-1 text-primary font-medium">
                  Ver artista
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  // Renderizado para desktop (tabla)
  const renderDeteccionTable = (detecciones: Deteccion[]) => (
    <div className="hidden md:block overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b-2">
            <TableHead className="w-12 font-bold">Rank</TableHead>
            <TableHead className="font-bold">Evento</TableHead>
            <TableHead className="font-bold">Artista</TableHead>
            <TableHead className="font-bold">Emisora</TableHead>
            <TableHead className="font-bold">Ciudad</TableHead>
            <TableHead className="font-bold">Venue</TableHead>
            <TableHead className="font-bold">Tipo</TableHead>
            <TableHead className="font-bold">Contexto</TableHead>
            <TableHead className="font-bold">Fecha y Hora</TableHead>
            <TableHead className="w-20"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {detecciones.map((det, index) => {
            const initial = getInitial(det.NombreEvento || det.Artista);
            const colorClass = getColorFromInitial(initial);

            return (
              <TableRow
                key={det.DeteccionID}
                className="group hover:bg-muted/50 cursor-pointer transition-all animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(`/artist/${encodeURIComponent(det.Artista)}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {index + 1}
                    </div>
                    {index === 0 && (
                      <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {/* Placeholder con letra del artista */}
                    <div className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0`}>
                      {initial}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {det.NombreEvento || `Evento de ${det.Artista}`}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{det.Artista}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{det.Emisora}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${cityColors[det.Ciudad] || "bg-gradient-to-r from-gray-500 to-slate-500"} text-white border-0 text-xs`}>
                    {det.Ciudad}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 max-w-[150px]">
                    {det.Venue ? (
                      <>
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate" title={det.Venue}>
                          {det.Venue}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">No especificado</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${typeColors[det.Tipo] || "bg-gradient-to-r from-gray-500 to-slate-500"} text-white border-0 text-xs`}>
                    {det.Tipo}
                  </Badge>
                </TableCell>
                {/*<TableCell className="max-w-xs">
                  <div className="text-sm line-clamp-2">
                    {det.Contexto ? (
                      <>
                        <span className="text-sm whitespace-pre-wrap" title={det.Contexto}>
                          {det.Contexto}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">Sin contexto disponible</span>
                    )}
                  </div>
                </TableCell>*/}
                <TableCell className="max-w-xs">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <p className="text-sm line-clamp-2">
                            {det.Contexto || "Sin contexto disponible"}
                          </p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        className="max-w-md max-h-64 overflow-y-auto p-4"
                        side="left"
                        align="center"
                      >
                        <div className="text-sm whitespace-pre-wrap">
                          {det.Contexto || "Sin contexto disponible"}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {formatDate(det.Hora)}
                  </div>
                </TableCell>
                <TableCell>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Music className="h-12 w-12 text-primary animate-pulse" />
            <p className="text-lg text-muted-foreground">Cargando últimas menciones...</p>
            <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Headphones className="h-12 w-12 text-red-500" />
            <p className="text-lg text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2 p-1 sm:p-2">
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Music className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Ranking de Eventos
              <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                {filteredAndSortedDetecciones.length} detecciones
              </Badge>
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            🎤 Menciones y spots detectados en emisoras de radio - Datos en tiempo real
          </p>
        </CardHeader>
        <CardContent className="p-1 sm:p-4">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all" className="text-xs sm:text-sm">
                Todas
              </TabsTrigger>
              <TabsTrigger value="spots" className="text-xs sm:text-sm">
                Spots Comerciales
              </TabsTrigger>
              <TabsTrigger value="mentions" className="text-xs sm:text-sm">
                Menciones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {renderDeteccionCards(filteredAndSortedDetecciones)}
              {renderDeteccionTable(filteredAndSortedDetecciones)}

              {filteredAndSortedDetecciones.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No se encontraron detecciones con los filtros seleccionados
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="spots" className="space-y-4">
              {renderDeteccionCards(filteredAndSortedDetecciones.filter(d => d.Tipo === "SPOT"))}
              {renderDeteccionTable(filteredAndSortedDetecciones.filter(d => d.Tipo === "SPOT"))}

              {filteredAndSortedDetecciones.filter(d => d.Tipo === "SPOT").length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No se encontraron spots comerciales con los filtros seleccionados
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="mentions" className="space-y-4">
              {renderDeteccionCards(filteredAndSortedDetecciones.filter(d => d.Tipo === "MENCION"))}
              {renderDeteccionTable(filteredAndSortedDetecciones.filter(d => d.Tipo === "MENCION"))}

              {filteredAndSortedDetecciones.filter(d => d.Tipo === "MENCION").length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No se encontraron menciones con los filtros seleccionados
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {filteredAndSortedDetecciones.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Radio className="h-4 w-4" />
                  Total emisoras monitoreadas: {detecciones.length > 0 ?
                    new Set(detecciones.map(d => d.EmisoraID)).size : 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Mostrando {filteredAndSortedDetecciones.length} de {detecciones.length} detecciones
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};