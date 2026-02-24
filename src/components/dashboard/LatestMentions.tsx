import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowRight,
  Calendar,
  Headphones,
  MapPin,
  MessageSquare,
  Play,
  Radio,
  Sparkles,
  Edit,
  X,
  Save
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useDashboardContext } from "@/components/DashboardLayout";

// Definición de tipos local
interface Deteccion {
  DeteccionID: number;
  Artista: string;
  Emisora: string;
  Ciudad: string;
  FechaHora: string;
  FechaDeteccion: string;
  Tipo: string;
  Venue?: string;
  FechaEvento?: string;
  NombreEvento?: string;
  Duracion?: number;
  Contexto?: string;
  AudioUrl?: string;
  EventGroupID?: number;
}

// URL BASE
//const API_URL = "http://localhost:8080/api/dashboard";
const API_URL = "https://backevent.monitorlatino.com/api/dashboard/";

const formatTimeAgo = (dateString: string) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "Hace unos segundos";
    if (diffInSeconds < 3600)
      return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400)
      return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    return format(date, "dd/MM/yyyy HH:mm", { locale: es });
  } catch (e) {
    return dateString;
  }
};

const getTypeColor = (tipo: string) => {
  const safeType = tipo?.toUpperCase() || "";
  if (safeType.includes("MENCION"))
    return "bg-gradient-to-r from-blue-500 to-cyan-500";
  if (safeType.includes("SPOT"))
    return "bg-gradient-to-r from-green-500 to-emerald-500";
  return "bg-gradient-to-r from-red-500 to-orange-500";
};

export const LatestMentions = () => {
  const navigate = useNavigate();

  // Contexto global
  const {
    selectedCountry,
    selectedCity,
    selectedVenue,
    selectedGenre,
    dateRange,
  } = useDashboardContext();
  // Estados 
  const [detecciones, setDetecciones] = useState<Deteccion[]>([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDet, setEditingDet] = useState<Deteccion | null>(null);
  const [editForm, setEditForm] = useState({ Artista: "", Tipo: "", EventGroupID: "" });
  const [isSaving, setIsSaving] = useState(false);


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getDiasFromContext = (rango: any): number => {
    if (!rango) return 0;
    const texto = rango.toString().toLowerCase();

    if (texto === "today" || texto === "hoy") return 1;
    if (texto === "yesterday" || texto === "ayer") return 2;
    if (texto.includes("7")) return 7;
    if (texto.includes("14")) return 14;
    if (
      texto.includes("30") ||
      texto === "this_month" ||
      texto === "last_month" ||
      texto.includes("mes")
    )
      return 30;
    if (texto.includes("todos")) return 0;

    return 0; // Default a 0 (Todos) 
  };

  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      // Filtros de Texto
      if (selectedCountry && selectedCountry !== "Todos")
        params.append("pais", selectedCountry);
      if (selectedCity && selectedCity !== "Todos" && selectedCity !== "Todas")
        params.append("ciudad", selectedCity);
      if (
        selectedVenue &&
        selectedVenue !== "Todos" &&
        selectedVenue !== "todos"
      )
        params.append("venue", selectedVenue);
      if (
        selectedGenre &&
        selectedGenre !== "Todos" &&
        selectedGenre !== "todos"
      )
        params.append("tipo", selectedGenre);

      const dias = getDiasFromContext(dateRange);

      // SI DIAS > 0 hay filtro de dias aplicado, si es 0 se asume "Todos"
      if (dias > 0) {
        params.append("dias", dias.toString());
      }

      console.log("Fetching latest mentions with params:", params.toString());

      const response = await fetch(
        `${API_URL}/ultimas-detecciones?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      let dataArray: Deteccion[] = [];
      if (Array.isArray(data)) {
        dataArray = data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } else if (data && (data as any).ultimasDetecciones) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dataArray = (data as any).ultimasDetecciones;
      }

      setDetecciones(dataArray);
    } catch (err) {
      console.error(" Error fetching mentions:", err);
      setError("No se pudieron cargar los datos.");
      setDetecciones([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCountry, selectedCity, selectedVenue, selectedGenre, dateRange]);

  // Ejecutar fetch cuando cambian los filtros
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredDetecciones = useMemo(() => {
    return detecciones;
    // filtrar por Tabs visuales:
  }, [detecciones]);
  const handlePlayAudio = (audioUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Reproduciendo audio:", audioUrl);
    window.open(audioUrl, "_blank");
  };

  const handlePlayPreview = useCallback(
    (trackRank: number, audioUrl: string) => {
      console.log("handlePlayPreview called for:", trackRank, audioUrl);

      // Si la misma canción está sonando, pausar y limpiar
      if (currentlyPlaying === trackRank) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current = null;
        }
        setCurrentlyPlaying(null);
        return;
      }

      // Si hay una canción sonando, detenerla
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Crear y reproducir nueva canción
      const audio = new Audio(audioUrl); 
      audioRef.current = audio;

      // Cuando termine el audio, limpiar estado
      audio.addEventListener("ended", () => {
        setCurrentlyPlaying(null);
        audioRef.current = null;
      });
      audio
        .play()
        .then(() => {
          setCurrentlyPlaying(trackRank);
        })
        .catch((err) => {
          console.error("Error al reproducir el audio:", err);
          setCurrentlyPlaying(null);
          audioRef.current = null;
        });
    },
    [currentlyPlaying],
  );
  //Edición 
  const handleOpenEdit = (det: Deteccion, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDet(det);
    setEditForm({
      Artista: det.Artista || "",
      Tipo: det.Tipo || "MENCION",
      EventGroupID: det.EventGroupID ? det.EventGroupID.toString() : "",
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingDet) return;
    try {
      setIsSaving(true);
      const response = await fetch(`${API_URL}/deteccion/editar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          DeteccionID: editingDet.DeteccionID,
          Artista: editForm.Artista,
          Tipo: editForm.Tipo,
          EventGroupID: editForm.EventGroupID ? parseInt(editForm.EventGroupID) : null,
        }),
      });

      if (!response.ok) throw new Error("Error al actualizar");

      //recargamos la tabla y cerramos modal
      await fetchData();
      setIsEditModalOpen(false);
      setEditingDet(null);
    } catch (error) {
      console.error("Error guardando edición:", error);
      alert("Hubo un error al guardar. Asegúrate de que el backend esté listo.");
    } finally {
      setIsSaving(false);
    }
  };
  // Vista Móvil (Cards) y Desktop (Table)
  const renderDeteccionCards = (detecciones: Deteccion[]) => (
    <div className="grid gap-4 md:hidden">
      {detecciones.map((det, index) => (
        <Card
          key={det.DeteccionID}
          className="group hover-lift overflow-hidden border-0 shadow-lg animate-fade-in cursor-pointer"
          style={{ animationDelay: `${index * 100}ms` }}
          onClick={() => navigate(`/artist/${encodeURIComponent(det.Artista)}`)}
        >
          {/* Botón de Edición */}
          <button
            onClick={(e) => handleOpenEdit(det, e)}
            className="absolute top-3 right-3 p-2 bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-full transition-colors z-10"
          >
            <Edit className="h-4 w-4" />
          </button>
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
                  {det.Ciudad} • {formatTimeAgo(det.FechaDeteccion)}
                </p>
              </div>

              <Badge
                className={`${getTypeColor(det.Tipo) || "bg-gradient-to-r from-gray-500 to-slate-500"} text-white border-0 text-xs`}
              >
                {det.Tipo}
              </Badge>
            </div>

            <div className="mb-3">
              <div className="text-xs text-muted-foreground mb-1">
                Venue / Lugar
              </div>
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
 //Vista Escritorio (Tabla)
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
                  <span
                    className="text-sm font-medium max-w-[150px] truncate"
                    title={det.Venue || "No especificado"}
                  >
                    {det.Venue || "No especificado"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  className={`${getTypeColor(det.Tipo) || "bg-gradient-to-r from-gray-500 to-slate-500"} text-white border-0 text-xs`}
                >
                  {det.Tipo}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs">
                    {formatTimeAgo(det.FechaDeteccion)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="max-w-xs">
                <p
                  className="text-sm line-clamp-2"
                  title={det.Contexto || "Sin contexto disponible"}
                >
                  {det.Contexto || "Sin contexto disponible"}
                </p>
              </TableCell>
              <TableCell className="text-center">
                {det.AudioUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayPreview(det.DeteccionID, det.AudioUrl);
                    }}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors group"
                    title="Escuchar audio"
                  >
                    <Play className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  </button>
                )}
              </TableCell>
              <TableCell
                onClick={() =>
                  navigate(`/artist/${encodeURIComponent(det.Artista)}`)
                }
              >
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => handleOpenEdit(det, e)}
                    className="p-2 text-muted-foreground hover:text-secondary hover:bg-secondary/10 rounded-full transition-colors"
                    title="Editar registro"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
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
            <p className="text-lg text-muted-foreground">
              Cargando menciones...
            </p>
            <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary animate-pulse"
                style={{ width: "60%" }}
              />
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
    <>
    <div className="space-y-2 p-1 sm:p-2">
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Headphones className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Últimas Detecciones en Radio
              <Badge
                variant="outline"
                className="ml-2 bg-primary/10 text-primary border-primary/20"
              >
                {filteredDetecciones.length} detecciones
              </Badge>
            </CardTitle>
            <div className="text-xs text-muted-foreground">
              Actualizado cada 15 minutos
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            🎧 Detecciones en tiempo real de menciones y spots en emisoras de
            radio
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
              {renderDeteccionCards(
                filteredDetecciones.filter((d) => d.Tipo === "MENCION"),
              )}
              {renderDeteccionTable(
                filteredDetecciones.filter((d) => d.Tipo === "MENCION"),
              )}
            </TabsContent>

            <TabsContent value="spots" className="space-y-4">
              {renderDeteccionCards(
                filteredDetecciones.filter((d) => d.Tipo === "SPOT"),
              )}
              {renderDeteccionTable(
                filteredDetecciones.filter((d) => d.Tipo === "SPOT"),
              )}
            </TabsContent>
          </Tabs>
</CardContent>
        </Card>
      </div>

      {isEditModalOpen && editingDet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Cabecera del Modal */}
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Edit className="h-5 w-5 text-primary" />
                Editar Detección #{editingDet.DeteccionID}
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contenido/Formulario */}
            <div className="p-6 space-y-4">
              {/* Información de Solo Lectura */}
              <div className="bg-muted/50 p-3 rounded-lg text-sm mb-4 space-y-1">
                <p><span className="font-semibold">Emisora:</span> {editingDet.Emisora}</p>
                <p><span className="font-semibold">Fecha:</span> {formatTimeAgo(editingDet.FechaDeteccion)}</p>
              </div>

              {/* Campos Editables */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Artista
                </label>
                <input
                  type="text"
                  placeholder="Nombre del artista"
                  value={editForm.Artista}
                  onChange={(e) => setEditForm({ ...editForm, Artista: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Tipo de Detección
                </label>
                <select
                  value={editForm.Tipo}
                  onChange={(e) => setEditForm({ ...editForm, Tipo: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="MENCION">MENCION</option>
                  <option value="SPOT">SPOT</option>
                  <option value="OTRO">OTRO</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  ID del Grupo (EventGroupID)
                </label>
                <input
                  type="number"
                  placeholder="Ej. 105"
                  value={editForm.EventGroupID}
                  onChange={(e) => setEditForm({ ...editForm, EventGroupID: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Cambia este ID para fusionar o mover esta detección a otro evento del Ranking. Déjalo en blanco para desenlazar.
                </p>
              </div>
            </div>

            {/* Footer / Botones */}
            <div className="px-6 py-4 border-t border-border bg-muted/20 flex justify-end gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-md transition-colors"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? "Guardando..." : "Guardar Cambios"}
                {!isSaving && <Save className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};