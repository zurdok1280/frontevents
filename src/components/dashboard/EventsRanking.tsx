import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, Sparkles, Calendar, TrendingUp, Music, Radio, Headphones, MapPin } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMentionsResume, TopEvento } from "@/lib/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Formatear fecha
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy', { locale: es });
  } catch {
    return dateString;
  }
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
  sortBy = "total"
}: EventsRankingProps) => {
  const navigate = useNavigate();
  const [topEventos, setTopEventos] = useState<TopEvento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getMentionsResume();
        setTopEventos(data.topEventos || []);
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

  // Función para manejar el cambio de pestaña
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = [...topEventos];

    // Aplicar filtros
    if (selectedCity !== "todos") {
      filtered = filtered.filter(event => event.Ciudad === selectedCity);
    }

    if (selectedVenue !== "todos") {
      filtered = filtered.filter(event => event.Venue === selectedVenue);
    }

    // Filtrar según la pestaña activa
    if (activeTab === "spots") {
      filtered = filtered.filter(event => event.Spots > 0);
    } else if (activeTab === "mentions") {
      filtered = filtered.filter(event => event.Menciones > 0);
    }

    // Ordenar según la pestaña activa
    if (activeTab === "spots") {
      // Ordenar por cantidad de Spots de manera descendente
      return filtered.sort((a, b) => b.Spots - a.Spots);
    } else if (activeTab === "mentions") {
      // Ordenar por cantidad de Menciones de manera descendente
      return filtered.sort((a, b) => b.Menciones - a.Menciones);
    } else if (sortBy === "date") {
      // Ordenar por fecha (si está seleccionado en los filtros generales)
      return filtered.sort((a, b) => {
        const dateA = a.Fecha ? new Date(a.Fecha).getTime() : 0;
        const dateB = b.Fecha ? new Date(b.Fecha).getTime() : 0;
        return dateB - dateA;
      });
    } else if (sortBy === "spots") {
      return filtered.sort((a, b) => b.Spots - a.Spots);
    } else if (sortBy === "mentions") {
      return filtered.sort((a, b) => b.Menciones - a.Menciones);
    } else if (sortBy === "total") {
      return filtered.sort((a, b) => b.Total - a.Total);
    } else if (sortBy === "alcance") {
      return filtered.sort((a, b) => b.Alcance - a.Alcance);
    }

    // Por defecto: ordenar por total
    return filtered.sort((a, b) => b.Total - a.Total);
  }, [topEventos, selectedCity, selectedVenue, activeTab, sortBy]);

  // Función para obtener la letra inicial del artista
  const getInitial = (artist: string) => {
    return artist.charAt(0).toUpperCase();
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

  const renderEventCards = (events: typeof filteredAndSortedEvents) => (
    <div className="grid gap-4 md:hidden">
      {events.map((event, index) => {
        const initial = getInitial(event.Artista);
        const colorClass = getColorFromInitial(initial);

        return (
          <Card
            key={event.EventGroupID}
            className="group hover-lift overflow-hidden border-0 shadow-lg animate-fade-in cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => navigate(`/artist/${encodeURIComponent(event.Artista)}`)}
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
                        {activeTab === "spots" ? "Top Spots" :
                          activeTab === "mentions" ? "Top Menciones" : "Top"}
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                    {event.NombreEvento || `Evento de ${event.Artista}`}
                  </h3>
                  <p className="text-sm text-muted-foreground">{event.Artista}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {event.Ciudad} • {event.Venue || "Venue no especificado"} • {formatDate(event.Fecha)}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <Badge className={"bg-gradient-to-r from-gray-500 to-slate-500 text-white border-0 text-xs mb-2"}>
                  {event.Ciudad}
                </Badge>
                <div className="flex items-center gap-2">
                  <Badge className={"bg-gradient-to-r from-gray-500 to-slate-500 text-white border-0 text-xs"}>
                    Alcance: {event.Alcance.toLocaleString()}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 mb-3 glow-primary">
                <div className="text-xs font-medium text-primary">Impacto Total</div>
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {event.Total}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Spots</div>
                  <div className="text-sm font-bold text-foreground">{event.Spots}</div>
                </div>
                <div className="text-center border-x border-border">
                  <div className="text-xs text-muted-foreground">Menciones</div>
                  <div className="text-sm font-bold text-foreground">{event.Menciones}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="text-sm font-bold text-foreground">{event.Total}</div>
                </div>
              </div>

              <div className="mb-2">
                <div className="text-xs text-muted-foreground mb-1">Fecha del evento</div>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  {formatDate(event.Fecha)}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderEventTable = (events: typeof filteredAndSortedEvents) => (
    <div className="hidden md:block overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b-2">
            <TableHead className="w-12 font-bold">#</TableHead>
            <TableHead className="font-bold">Evento / Artista</TableHead>
            <TableHead className="font-bold">Ciudad</TableHead>
            <TableHead className="font-bold">Venue</TableHead>
            <TableHead className="font-bold">Fecha</TableHead>
            <TableHead className="text-right font-bold">Spots</TableHead>
            <TableHead className="text-right font-bold">Menciones</TableHead>
            <TableHead className="text-right font-bold">Total</TableHead>
            <TableHead className="text-right font-bold">Alcance</TableHead>
            <TableHead className="w-20"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event, index) => {
            const initial = getInitial(event.Artista);
            const colorClass = getColorFromInitial(initial);

            return (
              <TableRow
                key={event.EventGroupID}
                className="group hover:bg-muted/50 cursor-pointer transition-all animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}

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
                        {event.NombreEvento || `Evento de ${event.Artista}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {event.Artista}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={"bg-gradient-to-r from-gray-500 to-slate-500 text-white border-0 text-xs"}>
                    {event.Ciudad}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium max-w-[150px] truncate" title={event.Venue || "No especificado"}>
                      {event.Venue || "No especificado"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {formatDate(event.Fecha)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className={`px-2 py-1 rounded-md font-semibold text-sm ${activeTab === "spots" && index === 0
                    ? "bg-yellow-500/20 text-yellow-700 border border-yellow-500/30"
                    : "bg-green-500/10 text-green-600"
                    }`}>
                    {event.Spots}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className={`px-2 py-1 rounded-md font-semibold text-sm ${activeTab === "mentions" && index === 0
                    ? "bg-blue-500/20 text-blue-700 border border-blue-500/30"
                    : "bg-blue-500/10 text-blue-600"
                    }`}>
                    {event.Menciones}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {event.Total}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {event.Alcance.toLocaleString()}
                </TableCell>
                <TableCell onClick={() => navigate(`/artist/${encodeURIComponent(event.Artista)}`)}>
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
            <p className="text-lg text-muted-foreground">Cargando ranking de eventos...</p>
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
              Ranking de Eventos Musicales
              <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                {filteredAndSortedEvents.length} eventos
              </Badge>
            </CardTitle>
            <div className="text-xs text-muted-foreground">
              Actualizado cada minuto
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            🎵 Eventos musicales - Datos agrupados por evento
          </p>
        </CardHeader>
        <CardContent className="p-1 sm:p-4">
          <Tabs defaultValue="all" className="w-full" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all" className="text-xs sm:text-sm">
                Todos
              </TabsTrigger>
              <TabsTrigger value="spots" className="text-xs sm:text-sm">
                Spots Comerciales
              </TabsTrigger>
              <TabsTrigger value="mentions" className="text-xs sm:text-sm">
                Menciones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-2">
                Mostrando todos los eventos ordenados por Impacto Total
              </div>
              {renderEventCards(filteredAndSortedEvents)}
              {renderEventTable(filteredAndSortedEvents)}

              {filteredAndSortedEvents.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No se encontraron eventos con los filtros seleccionados
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="spots" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-2">
                Mostrando eventos con spots comerciales ordenados por cantidad de Spots (mayor a menor)
              </div>
              {renderEventCards(filteredAndSortedEvents)}
              {renderEventTable(filteredAndSortedEvents)}

              {filteredAndSortedEvents.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No se encontraron eventos con spots comerciales
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="mentions" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-2">
                Mostrando eventos con menciones ordenados por cantidad de Menciones (mayor a menor)
              </div>
              {renderEventCards(filteredAndSortedEvents)}
              {renderEventTable(filteredAndSortedEvents)}

              {filteredAndSortedEvents.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No se encontraron eventos con menciones
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {filteredAndSortedEvents.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Radio className="h-4 w-4" />
                  Total eventos monitoreados: {topEventos.length}
                  {activeTab === "spots" && (
                    <span className="text-green-600 font-medium">
                      • {filteredAndSortedEvents.length} con spots comerciales
                    </span>
                  )}
                  {activeTab === "mentions" && (
                    <span className="text-blue-600 font-medium">
                      • {filteredAndSortedEvents.length} con menciones
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};