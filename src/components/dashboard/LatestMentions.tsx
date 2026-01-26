import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, Sparkles, Calendar, Music, Headphones, Radio, MessageSquare, Play, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import { getMentionsResume, Deteccion } from "@/lib/api";

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

interface LatestMentionsProps {
    selectedCity?: string;
    selectedType?: string;
    limit?: number;
}

const typeColors: Record<string, string> = {
    "MENCION": "bg-gradient-to-r from-blue-500 to-cyan-500",
    "SPOT": "bg-gradient-to-r from-green-500 to-emerald-500",
    "CANCION": "bg-gradient-to-r from-purple-500 to-pink-500",
    "ENTREVISTA": "bg-gradient-to-r from-orange-500 to-red-500",
};

const confidenceColors = (confidence: number) => {
    if (confidence >= 0.9) return "bg-gradient-to-r from-green-500 to-emerald-500";
    if (confidence >= 0.7) return "bg-gradient-to-r from-yellow-500 to-amber-500";
    return "bg-gradient-to-r from-red-500 to-orange-500";
};

export const LatestMentions = ({
    selectedCity = "todos",
    selectedType = "todos",
    limit = 10
}: LatestMentionsProps) => {
    const navigate = useNavigate();
    const [detecciones, setDetecciones] = useState<Deteccion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMentions = async () => {
            try {
                setLoading(true);
                const data = await getMentionsResume();
                setDetecciones(data.ultimasDetecciones);
                console.log("Fetched mentions:", data.ultimasDetecciones);
                setError(null);
            } catch (err) {
                console.error("Error fetching mentions:", err);
                setError("Error al cargar las menciones. Por favor, intente nuevamente.");
            } finally {
                setLoading(false);
            }
        };

        fetchMentions();
        // Refrescar automáticamente cada 15 minutos
        const interval = setInterval(fetchMentions, 900000);
        return () => clearInterval(interval);
    }, []);

    const filteredDetecciones = detecciones
        .filter(det => selectedCity === "todos" || det.Ciudad === selectedCity)
        .filter(det => selectedType === "todos" || det.Tipo === selectedType)
        .slice(0, limit);

    const handlePlayAudio = (audioUrl: string, e: React.MouseEvent) => {
        e.stopPropagation();
        // Implementar para despues un reproductor de audio
        console.log("Reproduciendo audio:", audioUrl);
        window.open(audioUrl, '_blank');
    };

    const renderDeteccionCards = (detecciones: Deteccion[]) => (
        <div className="grid gap-4 md:hidden">
            {detecciones.map((det, index) => (
                <Card
                    key={det.DeteccionID}
                    className="group hover-lift overflow-hidden border-0 shadow-lg animate-fade-in cursor-pointer"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => navigate(`/detection/${det.DeteccionID}`)}
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

    const renderDeteccionTable = (detecciones: Deteccion[]) => (
        <div className="hidden md:block overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-b-2">
                        <TableHead className="w-12 font-bold">#</TableHead>
                        <TableHead className="font-bold">Artista</TableHead>
                        <TableHead className="font-bold">Emisora</TableHead>
                        <TableHead className="font-bold">Ciudad</TableHead>
                        <TableHead className="font-bold">Venue</TableHead>
                        <TableHead className="font-bold">Tipo</TableHead>
                        <TableHead className="font-bold">Hora</TableHead>
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
                            onClick={() => navigate(`/detection/${det.DeteccionID}`)}
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
                                <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                    {det.Artista}
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
                                    <span className="text-sm">{det.Venue || "No especificado"}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge className={`${typeColors[det.Tipo] || "bg-gradient-to-r from-gray-500 to-slate-500"} text-white border-0 text-xs`}>
                                    {det.Tipo}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1 text-sm">
                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs">{formatTimeAgo(det.Hora)}</span>
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
                            <TableCell>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

    if (loading) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <Headphones className="h-12 w-12 text-primary animate-pulse" />
                        <p className="text-lg text-muted-foreground">Cargando menciones...</p>
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
                        <MessageSquare className="h-12 w-12 text-red-500" />
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
                            <Headphones className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                            Últimas Detecciones en Radio
                            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                                {filteredDetecciones.length} detecciones
                            </Badge>
                        </CardTitle>
                        <div className="text-xs text-muted-foreground">
                            Actualizado hace unos segundos
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        🎧 Detecciones en tiempo real de menciones y spots en emisoras de radio
                    </p>
                </CardHeader>
                <CardContent className="p-1 sm:p-4">
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                            <TabsTrigger value="all" className="text-xs sm:text-sm">
                                Todas
                            </TabsTrigger>
                            <TabsTrigger value="mentions" className="text-xs sm:text-sm">
                                Menciones
                            </TabsTrigger>
                            <TabsTrigger value="spots" className="text-xs sm:text-sm">
                                Spots
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-4">
                            {renderDeteccionCards(filteredDetecciones)}
                            {renderDeteccionTable(filteredDetecciones)}

                            {filteredDetecciones.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground text-lg">
                                        No se encontraron detecciones con los filtros seleccionados
                                    </p>
                                </div>
                            )}
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

                    {filteredDetecciones.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-border">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Mostrando {filteredDetecciones.length} de {detecciones.length} detecciones
                                </div>
                                <button
                                    onClick={() => navigate('/detections')}
                                    className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                                >
                                    Ver todas las detecciones
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};