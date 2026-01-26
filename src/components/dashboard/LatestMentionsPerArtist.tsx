import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Sparkles, Calendar, Music, Headphones, Radio, MessageSquare, Play, User, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getMentionsResume, Deteccion } from "@/lib/api";

// Función para formatear fecha
const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
        return dateString;
    }
};

// Función para tiempo relativo
const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Hace unos segundos';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} d`;

    return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
};

// Colores para tipos
const typeColors: Record<string, string> = {
    "MENCION": "bg-gradient-to-r from-blue-500 to-cyan-500",
    "SPOT": "bg-gradient-to-r from-green-500 to-emerald-500",
};

// Interface para props
interface LatestMentionsPerArtistProps {
    artistName?: string;
    limit?: number;
}

export const LatestMentionsPerArtist = ({
    artistName: propArtistName,
    limit = 20
}: LatestMentionsPerArtistProps) => {
    const navigate = useNavigate();
    const { artistName: paramArtistName } = useParams<{ artistName: string }>();

    // Usar prop o parámetro de ruta
    const artistName = propArtistName || decodeURIComponent(paramArtistName || "");

    const [detecciones, setDetecciones] = useState<Deteccion[]>([]);
    const [filteredDetecciones, setFilteredDetecciones] = useState<Deteccion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        total: 0,
        spots: 0,
        mentions: 0,
        ciudades: [] as string[],
        emisoras: [] as string[],
        venues: [] as string[],
        ultimaDeteccion: "",
        primeraDeteccion: ""
    });

    useEffect(() => {
        const fetchMentions = async () => {
            try {
                setLoading(true);
                const data = await getMentionsResume();

                // Filtrar por artista
                const artistDetections = data.ultimasDetecciones.filter(
                    det => det.Artista.toLowerCase() === artistName.toLowerCase()
                );

                setDetecciones(artistDetections);
                setFilteredDetecciones(artistDetections.slice(0, limit));

                // Calcular estadísticas
                if (artistDetections.length > 0) {
                    const spots = artistDetections.filter(d => d.Tipo === "SPOT").length;
                    const mentions = artistDetections.filter(d => d.Tipo === "MENCION").length;
                    const ciudades = [...new Set(artistDetections.map(d => d.Ciudad))];
                    const emisoras = [...new Set(artistDetections.map(d => d.Emisora))];
                    const venues = [...new Set(artistDetections.map(d => d.Venue || "No especificado").filter(v => v !== "No especificado"))];

                    // Ordenar por fecha para obtener primera y última
                    const sortedByDate = [...artistDetections].sort(
                        (a, b) => new Date(b.Hora).getTime() - new Date(a.Hora).getTime()
                    );

                    setStats({
                        total: artistDetections.length,
                        spots,
                        mentions,
                        ciudades,
                        emisoras,
                        venues,
                        ultimaDeteccion: sortedByDate[0]?.Hora || "",
                        primeraDeteccion: sortedByDate[sortedByDate.length - 1]?.Hora || ""
                    });
                }

                setError(null);
            } catch (err) {
                console.error("Error fetching mentions:", err);
                setError("Error al cargar las menciones del artista. Por favor, intente nuevamente.");
            } finally {
                setLoading(false);
            }
        };

        if (artistName) {
            fetchMentions();
        }
    }, [artistName, limit]);

    // Función para manejar reproducción de audio
    const handlePlayAudio = (audioUrl: string, e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(audioUrl, '_blank');
    };

    // Función para obtener letra inicial del artista
    const getInitial = (name: string) => {
        return name.charAt(0).toUpperCase();
    };

    // Función para generar color basado en la letra inicial
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

    // Renderizado para móvil
    const renderDeteccionCards = (detecciones: Deteccion[]) => (
        <div className="grid gap-4 md:hidden">
            {detecciones.map((det, index) => (
                <Card
                    key={det.DeteccionID}
                    className="group hover-lift overflow-hidden border-0 shadow-lg animate-fade-in cursor-pointer"
                    style={{ animationDelay: `${index * 100}ms` }}

                >
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
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
                                    {det.Ciudad} • {formatTimeAgo(det.Hora)}
                                </p>
                            </div>

                            <Badge className={`${typeColors[det.Tipo] || "bg-gradient-to-r from-gray-500 to-slate-500"} text-white border-0 text-xs`}>
                                {det.Tipo}
                            </Badge>
                        </div>

                        {/* Sección de Venue */}
                        <div className="mb-3">
                            <div className="text-xs text-muted-foreground mb-1">Venue / Lugar</div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                    {det.Venue || "No especificado"}
                                </span>
                            </div>
                        </div>

                        <div className="mb-3">
                            <div className="text-xs text-muted-foreground mb-1">Contexto</div>
                            <p className="text-sm line-clamp-2">
                                {det.Contexto || "Sin contexto disponible"}
                            </p>
                        </div>

                        {det.AudioUrl && (
                            <button
                                onClick={(e) => handlePlayAudio(det.AudioUrl, e)}
                                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
                            >
                                <Play className="h-4 w-4" />
                                <span className="text-sm font-medium">Escuchar Audio</span>
                            </button>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    // Renderizado para desktop
    const renderDeteccionTable = (detecciones: Deteccion[]) => (
        <div className="hidden md:block overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-b-2">
                        <TableHead className="w-12 font-bold">#</TableHead>
                        <TableHead className="font-bold">Emisora</TableHead>
                        <TableHead className="font-bold">Ciudad</TableHead>
                        <TableHead className="font-bold">Venue</TableHead>
                        <TableHead className="font-bold">Tipo</TableHead>
                        <TableHead className="font-bold">Fecha y Hora</TableHead>
                        <TableHead className="font-bold">Contexto</TableHead>
                        <TableHead className="w-24 font-bold text-center">Audio</TableHead>
                        <TableHead className="w-20"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {detecciones.map((det, index) => (
                        <TableRow
                            key={det.DeteccionID}
                            className="group hover:bg-muted/50 cursor-pointer transition-all animate-fade-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                        //onClick={() => navigate(`/detection/${det.DeteccionID}`)}
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
                                <div className="flex items-center gap-2">
                                    <Radio className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{det.Emisora}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="text-xs">
                                    {det.Ciudad}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium max-w-[150px] truncate" title={det.Venue || "No especificado"}>
                                        {det.Venue || "No especificado"}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge className={`${typeColors[det.Tipo] || "bg-gradient-to-r from-gray-500 to-slate-500"} text-white border-0 text-xs`}>
                                    {det.Tipo}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1 text-sm">
                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                        {formatDate(det.Hora)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {formatTimeAgo(det.Hora)}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="max-w-xs">
                                <p className="text-sm line-clamp-2">
                                    {det.Contexto || "Sin contexto disponible"}
                                </p>
                            </TableCell>
                            <TableCell className="text-center">
                                {det.AudioUrl && (
                                    <button
                                        onClick={(e) => handlePlayAudio(det.AudioUrl, e)}
                                        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors group"
                                        title="Escuchar audio"
                                    >
                                        <Play className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                    </button>
                                )}
                            </TableCell>

                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

    // Estado de carga
    if (loading) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <User className="h-12 w-12 text-primary animate-pulse" />
                        <p className="text-lg text-muted-foreground">Cargando menciones de {artistName}...</p>
                        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-secondary animate-pulse" style={{ width: '60%' }} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Estado de error
    if (error) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <MessageSquare className="h-12 w-12 text-red-500" />
                        <p className="text-lg text-red-600">{error}</p>
                        <button
                            //onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Reintentar
                        </button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Si no hay artista
    if (!artistName) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <User className="h-12 w-12 text-muted-foreground" />
                        <p className="text-lg text-muted-foreground">No se ha especificado un artista</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Volver
                        </button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Si no hay detecciones
    if (filteredDetecciones.length === 0) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <User className="h-12 w-12 text-muted-foreground" />
                        <div className={`w-20 h-20 rounded-full ${getColorFromInitial(getInitial(artistName))} flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-4`}>
                            {getInitial(artistName)}
                        </div>
                        <h2 className="text-2xl font-bold">{artistName}</h2>
                        <p className="text-lg text-muted-foreground">
                            No se encontraron menciones para este artista
                        </p>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Volver al ranking
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 rounded-full hover:bg-muted transition-colors"
                                title="Volver"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full ${getColorFromInitial(getInitial(artistName))} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                                    {getInitial(artistName)}
                                </div>
                                <div>
                                    <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                                        <Music className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                                        {artistName}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        🎤 Todas las menciones y spots del artista
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                {filteredDetecciones.length} detecciones
                            </Badge>
                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                                {stats.spots} spots
                            </Badge>
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                                {stats.mentions} menciones
                            </Badge>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-1 sm:p-4">
                    {/* Estadísticas del artista */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
                            <CardContent className="p-4">
                                <div className="text-xs text-muted-foreground">Total Apariciones</div>
                                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-500/5 to-green-500/10">
                            <CardContent className="p-4">
                                <div className="text-xs text-muted-foreground">Spots Comerciales</div>
                                <div className="text-2xl font-bold text-green-600">{stats.spots}</div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                            <CardContent className="p-4">
                                <div className="text-xs text-muted-foreground">Menciones</div>
                                <div className="text-2xl font-bold text-blue-600">{stats.mentions}</div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                            <CardContent className="p-4">
                                <div className="text-xs text-muted-foreground">Venues Diferentes</div>
                                <div className="text-2xl font-bold text-purple-600">{stats.venues.length}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Información adicional */}
                    <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <div className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Venues detectados:
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {stats.venues.length > 0 ? (
                                        stats.venues.map(venue => (
                                            <Badge key={venue} variant="outline" className="text-xs">
                                                {venue}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-muted-foreground">No hay venues registrados</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-2">Ciudades detectadas:</div>
                                <div className="flex flex-wrap gap-2">
                                    {stats.ciudades.map(ciudad => (
                                        <Badge key={ciudad} variant="outline" className="text-xs">
                                            {ciudad}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-2">Emisoras detectadas:</div>
                                <div className="flex flex-wrap gap-2">
                                    {stats.emisoras.map(emisora => (
                                        <Badge key={emisora} variant="outline" className="text-xs">
                                            <Radio className="h-3 w-3 mr-1" />
                                            {emisora}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs para filtrar */}
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                            <TabsTrigger value="all" className="text-xs sm:text-sm">
                                Todas
                            </TabsTrigger>
                            <TabsTrigger value="mentions" className="text-xs sm:text-sm">
                                Menciones ({stats.mentions})
                            </TabsTrigger>
                            <TabsTrigger value="spots" className="text-xs sm:text-sm">
                                Spots ({stats.spots})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-4">
                            {renderDeteccionCards(filteredDetecciones)}
                            {renderDeteccionTable(filteredDetecciones)}
                        </TabsContent>

                        <TabsContent value="mentions" className="space-y-4">
                            {renderDeteccionCards(filteredDetecciones.filter(d => d.Tipo === "MENCION"))}
                            {renderDeteccionTable(filteredDetecciones.filter(d => d.Tipo === "MENCION"))}
                        </TabsContent>

                        <TabsContent value="spots" className="space-y-4">
                            {renderDeteccionCards(filteredDetecciones.filter(d => d.Tipo === "SPOT"))}
                            {renderDeteccionTable(filteredDetecciones.filter(d => d.Tipo === "SPOT"))}
                        </TabsContent>
                    </Tabs>

                    {/* Información del pie */}
                    <div className="mt-6 pt-4 border-t border-border">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="text-sm text-muted-foreground">
                                <div>Mostrando {filteredDetecciones.length} de {detecciones.length} detecciones</div>
                                {stats.primeraDeteccion && stats.ultimaDeteccion && (
                                    <div className="text-xs mt-1">
                                        Período: {formatDate(stats.primeraDeteccion)} - {formatDate(stats.ultimaDeteccion)}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => navigate(-1)}
                                className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Volver al ranking
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};