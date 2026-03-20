import { useEffect, useState, useCallback, useMemo } from "react";
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
  Sparkles,
  Calendar,
  TrendingUp,
  Music,
  Radio,
  Headphones,
  MapPin,
  Edit2,
  Loader2,
   Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRankingEventos, TopEvento, FiltrosBusqueda, BASE_URL } from "@/lib/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useDashboardContext } from "@/components/DashboardLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
// ========== API Fetch Helper ==========

interface Evento {
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

//Estados
const cityColors: Record<string, string> = {
  Bogota: "bg-gradient-to-r from-blue-500 to-indigo-500",
  Medellin: "bg-gradient-to-r from-green-500 to-teal-500",
  Cali: "bg-gradient-to-r from-yellow-500 to-orange-500",
  Barranquilla: "bg-gradient-to-r from-red-500 to-pink-500",
  Cartagena: "bg-gradient-to-r from-purple-500 to-pink-500",
};

const getInitial = (artist: string) =>
  artist ? artist.charAt(0).toUpperCase() : "?";

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

const formatDateSafe = (dateString: string) => {
  try {
    return dateString
      ? format(new Date(dateString), "dd/MM/yyyy", { locale: es })
      : "-";
  } catch {
    return dateString;
  }
};

export const EventsRanking = () => {
  const navigate = useNavigate();

  const { selectedCountry, selectedCity, dateRange, selectedVenue } =
    useDashboardContext();

  const [events, setEvents] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Evento | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editFormData, setEditFormData] = useState({
    nombreEvento: "",
    artista: "",
    venue: "",
    fechaEvento: "",
  });
 // const API_URL = "http://localhost:8080/api/dashboard";
  //const API_URL = "https://backevent.monitorlatino.com/api/dashboard/";
    const API_URL = `${BASE_URL}/api/dashboard`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getDiasFromContext = (rango: any): number => {
    if (!rango) return 0;
    const texto = rango.toString().toLowerCase();
    if (texto === "todos") return 0;
    if (texto.includes("7")) return 7;
    if (texto.includes("14")) return 14;
    if (texto.includes("30")) return 30;
    if (texto.includes("60")) return 60;
    if (texto.includes("90") || texto.includes("3 meses")) return 90;
    return 0;
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedCountry && selectedCountry !== "Todos")
        params.append("pais", selectedCountry);
      if (
        selectedCity &&
        selectedCity !== "Todos" &&
        selectedCity !== "Todas"
      )
        params.append("ciudad", selectedCity);
      if (selectedVenue && selectedVenue !== "Todos")
        params.append("venue", selectedVenue);

      const dias = getDiasFromContext(dateRange);
      if (dias > 0) params.append("dias", dias.toString());

      const response = await fetch(
        `${API_URL}/ranking-eventos?${params.toString()}`,
      );
      const data = await response.json();

      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando ranking:", error);
      setError("No se pudo cargar la información de los eventos.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCountry, selectedCity, dateRange, selectedVenue]);

  //  FETCH INICIAL  DE DATOS
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // filtro (local) por seguiridad
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = [...events];

    if (activeTab === "spots") {
      filtered = filtered
        .filter((event) => event.Spots > 0)
        .sort((a, b) => b.Spots - a.Spots);
    } else if (activeTab === "mentions") {
      filtered = filtered
        .filter((event) => event.Menciones > 0)
        .sort((a, b) => b.Menciones - a.Menciones);
    } else {
      filtered.sort((a, b) => b.Total - a.Total);
    }
    return filtered;
  }, [events, activeTab]);

  // Edición de eventos 
  const handleOpenEdit = (evento: Evento) => {
    setEditingEvent(evento);
    setEditFormData({
      nombreEvento: evento.NombreEvento || "",
      artista: evento.Artista || "",
      venue: evento.Venue || "",
      // Formatear a YYYY-MM-DD para el input type="date"
      fechaEvento: evento.Fecha ? evento.Fecha.split("T")[0] : "",
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!editingEvent?.EventGroupID) return;
    setIsSaving(true);

    try {
      const response = await fetch(`${API_URL}/evento/editar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventGroupId: editingEvent.EventGroupID,
          nombreEvento: editFormData.nombreEvento,
          artista: editFormData.artista,
          venue: editFormData.venue,
          fechaEvento: editFormData.fechaEvento,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsEditDialogOpen(false);
        fetchData(); // Refrescamos los datos
      } else {
        alert("Error al actualizar: " + result.message);
      }
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      alert("Error de conexión al guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };
  // Renderizado de Tarjetas (Móvil)
  const renderEventCards = (events: typeof filteredAndSortedEvents) => (
    <div className="grid gap-4 md:hidden">
      {events.map((event, index) => {
        const initial = getInitial(event.Artista);
        const colorClass = getColorFromInitial(initial);

        return (
          <Card
            key={event.EventGroupID || index}
            className="group hover-lift overflow-hidden border-0 shadow-lg animate-fade-in cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() =>
              navigate(`/artist/${encodeURIComponent(event.Artista)}`)
            }
          >
            {/*Botón de edicion*/
            <button
              onClick={(e) => {
                e.stopPropagation(); 
                handleOpenEdit(event);
              }}
              className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full text-muted-foreground hover:text-primary transition-colors shadow-sm z-10"
              title="Editar Evento"
            >
              <Edit2 className="h-4 w-4" />
            </button>}
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                {/* Placeholder con letra del artista */}
                <div
                  className={`w-16 h-16 rounded-full ${colorClass} flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0`}
                >
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
                        {activeTab === "spots"
                          ? "Top Spots"
                          : activeTab === "mentions"
                            ? "Top Menciones"
                            : "Top"}
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                    {event.NombreEvento || `Evento de ${event.Artista}`}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {event.Artista}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {event.Ciudad} • {event.Venue || "Venue no especificado"} •{" "}
                    {formatDateSafe(event.Fecha)}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <Badge
                  className={
                    "bg-gradient-to-r from-gray-500 to-slate-500 text-white border-0 text-xs mb-2"
                  }
                >
                  {event.Ciudad}
                </Badge>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      "bg-gradient-to-r from-gray-500 to-slate-500 text-white border-0 text-xs"
                    }
                  >
                    Alcance: {event.Alcance.toLocaleString()}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 mb-3 glow-primary">
                <div className="text-xs font-medium text-primary">
                  Impacto Total
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {event.Total}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Spots</div>
                  <div className="text-sm font-bold text-foreground">
                    {event.Spots}
                  </div>
                </div>
                <div className="text-center border-x border-border">
                  <div className="text-xs text-muted-foreground">Menciones</div>
                  <div className="text-sm font-bold text-foreground">
                    {event.Menciones}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="text-sm font-bold text-foreground">
                    {event.Total}
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <div className="text-xs text-muted-foreground mb-1">
                  Fecha del evento
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  {formatDateSafe(event.Fecha)}
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
                    <div
                      className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0`}
                    >
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
                  <Badge
                    className={
                      "bg-gradient-to-r from-gray-500 to-slate-500 text-white border-0 text-xs"
                    }
                  >
                    {event.Ciudad}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span
                      className="text-sm font-medium max-w-[150px] truncate"
                      title={event.Venue || "No especificado"}
                    >
                      {event.Venue || "No especificado"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {formatDateSafe(event.Fecha)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={`px-2 py-1 rounded-md font-semibold text-sm ${
                      activeTab === "spots" && index === 0
                        ? "bg-yellow-500/20 text-yellow-700 border border-yellow-500/30"
                        : "bg-green-500/10 text-green-600"
                    }`}
                  >
                    {event.Spots}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={`px-2 py-1 rounded-md font-semibold text-sm ${
                      activeTab === "mentions" && index === 0
                        ? "bg-blue-500/20 text-blue-700 border border-blue-500/30"
                        : "bg-blue-500/10 text-blue-600"
                    }`}
                  >
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
                <TableCell
                  onClick={() =>
                    navigate(`/artist/${encodeURIComponent(event.Artista)}`)
                  }
                >
                  <div className="flex items-center justify-end gap-2">
                  <button
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleOpenEdit(event);
                      }}
                      className="p-2 hover:bg-muted rounded-full transition-colors"
                      title="Editar Campos"
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </button>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
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
            <p className="text-lg text-muted-foreground">
              Cargando ranking de eventos...
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
              <Badge
                variant="outline"
                className="ml-2 bg-primary/10 text-primary border-primary/20"
              >
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
          <Tabs
            defaultValue="all"
            className="w-full"
            onValueChange={setActiveTab}
          >
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
                Mostrando eventos con spots comerciales ordenados por cantidad
                de Spots (mayor a menor)
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
                Mostrando eventos con menciones ordenados por cantidad de
                Menciones (mayor a menor)
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
                  Total eventos monitoreados: {events.length}
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
      {/* MODAL DE EDICIÓN */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-primary" />
              Editar Detalles del Evento
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombreEvento">Nombre del Evento</Label>
              <Input
                id="nombreEvento"
                value={editFormData.nombreEvento}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, nombreEvento: e.target.value })
                }
                placeholder="Ej. Concierto de Shakira"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="artista">Artista</Label>
              <Input
                id="artista"
                value={editFormData.artista}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, artista: e.target.value })
                }
                placeholder="Ej. Shakira"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="venue">Venue (Lugar)</Label>
              <Input
                id="venue"
                value={editFormData.venue}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, venue: e.target.value })
                }
                placeholder="Ej. Estadio Azteca"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fechaEvento">Fecha del Evento</Label>
              <Input
                id="fechaEvento"
                type="date"
                value={editFormData.fechaEvento}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, fechaEvento: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
