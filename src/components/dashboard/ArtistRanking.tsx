import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, Sparkles, Calendar, TrendingUp, Music, Radio, Headphones, Users } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMentionsResume, Deteccion, TopArtista } from "@/lib/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";

//formata al date
const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return format(date, 'dd/MM/yyyy', { locale: es });
    } catch {
        return dateString;
    }
};

// Colores para géneros 
const typeColors: Record<string, string> = {
    "MENCION": "bg-gradient-to-r from-blue-500 to-cyan-500",
    "SPOT": "bg-gradient-to-r from-green-500 to-emerald-500",
};


interface EventsRankingProps {
    selectedCity?: string;
    selectedType?: string;
    selectedVenue?: string;
    sortBy?: string;
}

interface EventoCalculado {
    id: number;
    artista: string;
    emisora: string;
    venue: string;
    ciudad: string;
    tipo: string;
    confidence: number;
    hora: string;
    audioUrl: string;
    contexto: string;
    conteo: number;
    spots: number;
    mentions: number;
    total: number;
    ultimaDeteccion: string;
    emisoraId: number;
}

export const ArtistRanking = ({
    selectedCity = "todos",
    selectedType = "todos",
    selectedVenue = "todos",
    sortBy = "total"
}: EventsRankingProps) => {
    const navigate = useNavigate();
    const [detecciones, setDetecciones] = useState<Deteccion[]>([]);
    const [topArtistas, setTopArtistas] = useState<TopArtista[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getMentionsResume();
                setDetecciones(data.ultimasDetecciones);
                setTopArtistas(data.topArtistas);
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

    // Calcular eventos agrupados por artista
    const eventosCalculados = useMemo<EventoCalculado[]>(() => {
        if (detecciones.length === 0) return [];

        // Agrupar detecciones por artista
        const artistasMap = new Map<string, EventoCalculado>();

        detecciones.forEach(det => {
            const key = det.Artista.toLowerCase();

            if (!artistasMap.has(key)) {
                artistasMap.set(key, {
                    id: det.DeteccionID,
                    artista: det.Artista,
                    emisora: det.Emisora,
                    venue: det.Venue,
                    ciudad: det.Ciudad,
                    tipo: det.Tipo,
                    confidence: det.Confidence,
                    hora: det.Hora,
                    audioUrl: det.AudioUrl,
                    contexto: det.Contexto,
                    conteo: 0,
                    spots: 0,
                    mentions: 0,
                    total: 0,
                    ultimaDeteccion: det.Hora,
                    emisoraId: det.EmisoraID
                });
            }

            const artista = artistasMap.get(key)!;
            artista.conteo += 1;

            if (det.Tipo === "SPOT") {
                artista.spots += 1;
            } else {
                artista.mentions += 1;
            }

            artista.total = artista.spots + artista.mentions;

            // Actualizar la última detección si es más reciente
            if (new Date(det.Hora) > new Date(artista.ultimaDeteccion)) {
                artista.ultimaDeteccion = det.Hora;
                artista.emisora = det.Emisora;
                artista.venue = det.venue;
                artista.ciudad = det.Ciudad;
                artista.tipo = det.Tipo;
                artista.confidence = det.Confidence;
                artista.contexto = det.Contexto;
                artista.audioUrl = det.AudioUrl;
            }
        });

        // Combinar con datos de topArtistas para tener conteos completos
        topArtistas.forEach(top => {
            const key = top.NombreOficial.toLowerCase();
            if (artistasMap.has(key)) {
                const artista = artistasMap.get(key)!;
                artista.conteo = top.conteo;
                // Calcular proporción aproximada spots/mentions
                if (artista.total === 0) {
                    artista.mentions = Math.floor(top.conteo * 0.7);
                    artista.spots = Math.floor(top.conteo * 0.3);
                    artista.total = top.conteo;
                }
            }
        });

        return Array.from(artistasMap.values());
    }, [detecciones, topArtistas]);

    const filteredAndSortedEvents = useMemo(() => {
        let filtered = eventosCalculados;

        // Aplicar filtros
        if (selectedCity !== "todos") {
            filtered = filtered.filter(event => event.ciudad === selectedCity);
        }

        if (selectedType !== "todos") {
            filtered = filtered.filter(event => event.tipo === selectedType);
        }

        if (selectedVenue !== "todos") {
            filtered = filtered.filter(event => event.emisora === selectedVenue);
        }

        // Ordenar
        if (sortBy === "date") {
            return filtered.sort((a, b) => new Date(b.ultimaDeteccion).getTime() - new Date(a.ultimaDeteccion).getTime());
        }

        if (sortBy === "spots") {
            return filtered.sort((a, b) => b.spots - a.spots);
        }

        if (sortBy === "mentions") {
            return filtered.sort((a, b) => b.mentions - a.mentions);
        }

        if (sortBy === "total") {
            return filtered.sort((a, b) => b.total - a.total);
        }

        if (sortBy === "confidence") {
            return filtered.sort((a, b) => b.confidence - a.confidence);
        }

        // Por defecto: ordenar por total
        return filtered.sort((a, b) => b.total - a.total);
    }, [eventosCalculados, selectedCity, selectedType, selectedVenue, sortBy]);

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

    const renderEventCards = (events: typeof filteredAndSortedEvents) => (
        <div className="grid gap-4 md:hidden">
            {events.map((event, index) => {
                const initial = getInitial(event.artista);
                const colorClass = getColorFromInitial(initial);

                return (
                    <Card
                        key={event.id}
                        className="group hover-lift overflow-hidden border-0 shadow-lg animate-fade-in cursor-pointer"
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={() => navigate(`/artist/${event.artista}`)}
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
                                                Top
                                            </Badge>
                                        )}
                                    </div>

                                    <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                                        {event.artista}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">{event.emisora}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {event.ciudad} • {formatDate(event.ultimaDeteccion)}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-3">
                                <Badge className={`${typeColors[event.tipo] || "bg-gradient-to-r from-gray-500 to-slate-500"} text-white border-0 text-xs mb-2`}>
                                    {event.tipo}
                                </Badge>
                                <div className="flex items-center gap-2">
                                    <Badge className={"bg-gradient-to-r from-gray-500 to-slate-500 text-white border-0 text-xs"}>
                                        {event.ciudad}
                                    </Badge>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {event.conteo} apariciones
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 mb-3 glow-primary">
                                <div className="text-xs font-medium text-primary">Impacto Total</div>
                                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    {event.total}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className="text-center">
                                    <div className="text-xs text-muted-foreground">Spots</div>
                                    <div className="text-sm font-bold text-foreground">{event.spots}</div>
                                </div>
                                <div className="text-center border-x border-border">
                                    <div className="text-xs text-muted-foreground">Menciones</div>
                                    <div className="text-sm font-bold text-foreground">{event.mentions}</div>
                                </div>
                            </div>

                            <div className="mb-2">
                                <div className="text-xs text-muted-foreground mb-1">Última aparición</div>
                                <div className="flex items-center gap-1 text-sm">
                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                    {formatDate(event.ultimaDeteccion)}
                                </div>
                            </div>

                            {event.contexto && (
                                <div className="mt-2">
                                    <div className="text-xs text-muted-foreground mb-1">Último contexto</div>
                                    <p className="text-xs line-clamp-2 text-foreground">
                                        {event.contexto}
                                    </p>
                                </div>
                            )}
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
                        <TableHead className="font-bold">Artista</TableHead>
                        <TableHead className="font-bold">Ciudad</TableHead>
                        <TableHead className="font-bold">Tipo</TableHead>
                        <TableHead className="text-right font-bold">Spots</TableHead>
                        <TableHead className="text-right font-bold">Menciones</TableHead>
                        <TableHead className="text-right font-bold">Total</TableHead>
                        <TableHead className="font-bold">Última Aparición</TableHead>
                        <TableHead className="w-20"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {events.map((event, index) => {
                        const initial = getInitial(event.artista);
                        const colorClass = getColorFromInitial(initial);

                        return (
                            <TableRow
                                key={event.id}
                                className="group hover:bg-muted/50 cursor-pointer transition-all animate-fade-in"
                                style={{ animationDelay: `${index * 50}ms` }}
                                onClick={() => navigate(`/artist/${encodeURIComponent(event.artista)}`)}
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
                                                {event.artista}
                                            </div>

                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <Badge className={"bg-gradient-to-r from-gray-500 to-slate-500 text-white border-0 text-xs"}>
                                        {event.ciudad}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className={`${typeColors[event.tipo] || "bg-gradient-to-r from-gray-500 to-slate-500"} text-white border-0 text-xs`}>
                                        {event.tipo}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-600 font-semibold text-sm">
                                        {event.spots}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 font-semibold text-sm">
                                        {event.mentions}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-center gap-1">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                            {event.total}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-sm">
                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                        {formatDate(event.ultimaDeteccion)}
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
        </div >
    );

    if (loading) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <Music className="h-12 w-12 text-primary animate-pulse" />
                        <p className="text-lg text-muted-foreground">Cargando ranking de artistas...</p>
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
                            Ranking de Artistas en Radio
                            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                                {filteredAndSortedEvents.length} artistas
                            </Badge>
                        </CardTitle>
                        <div className="text-xs text-muted-foreground">
                            Actualizado cada minuto
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        🎤 Artistas más mencionados en emisoras de radio - Datos en tiempo real
                    </p>
                </CardHeader>
                <CardContent className="p-1 sm:p-4">
                    <Tabs defaultValue="all" className="w-full">
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
                            {renderEventCards(filteredAndSortedEvents)}
                            {renderEventTable(filteredAndSortedEvents)}

                            {filteredAndSortedEvents.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground text-lg">
                                        No se encontraron artistas con los filtros seleccionados
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="spots" className="space-y-4">
                            {renderEventCards(filteredAndSortedEvents.filter(e => e.tipo === "SPOT"))}
                            {renderEventTable(filteredAndSortedEvents.filter(e => e.tipo === "SPOT"))}

                            {filteredAndSortedEvents.filter(e => e.tipo === "SPOT").length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground text-lg">
                                        No se encontraron spots comerciales con los filtros seleccionados
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="mentions" className="space-y-4">
                            {renderEventCards(filteredAndSortedEvents.filter(e => e.tipo === "MENCION"))}
                            {renderEventTable(filteredAndSortedEvents.filter(e => e.tipo === "MENCION"))}

                            {filteredAndSortedEvents.filter(e => e.tipo === "MENCION").length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground text-lg">
                                        No se encontraron menciones con los filtros seleccionados
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
                                    Total emisoras monitoreadas: {detecciones.length > 0 ?
                                        new Set(detecciones.map(d => d.EmisoraID)).size : 0}
                                </div>
                                {/*<button
                  onClick={() => navigate('/artists')}
                  className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                >
                  Ver todos los artistas
                  <ArrowRight className="h-4 w-4" />
                </button>*/}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};