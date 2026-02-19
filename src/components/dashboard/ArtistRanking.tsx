import { useEffect, useState, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Music, Headphones } from "lucide-react";
import { useDashboardContext } from "@/components/DashboardLayout";

// Interfaz
interface TopArtista {
  NombreOficial: string;
  conteo: number;
}
interface ArtistRankingProps {
  limit?: number;
}
const getInitial = (nombre: string) =>
  nombre ? nombre.charAt(0).toUpperCase() : "?";

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

export const ArtistRanking = ({ limit = 100 }: ArtistRankingProps) => {
  const navigate = useNavigate();

  //contexto global del Dashboard
  const { selectedCountry, selectedCity, dateRange, selectedVenue } =
    useDashboardContext();

  const [topArtistas, setTopArtistas] = useState<TopArtista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "https://backevent.monitorlatino.com/api/dashboard";
  //const API_URL = "http://localhost:8080/api/dashboard";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getDiasFromContext = (rango: any): number => {
    if (!rango) return 0;
    const texto = rango.toString().toLowerCase();

    if (texto === "today" || texto === "hoy") return 1;
    if (texto === "yesterday" || texto === "ayer") return 2;
    if (texto.includes("7")) return 7;
    if (
      texto.includes("30") ||
      texto === "this_month" ||
      texto === "last_month"
    )
      return 30; // Ajuste genérico para mes
    if (texto.includes("todos")) return 0;

    return 30;
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      // Aplicamos filtros
      if (selectedCountry && selectedCountry !== "Todos")
        params.append("pais", selectedCountry);
      if (selectedCity && selectedCity !== "Todos" && selectedCity !== "Todas")
        params.append("ciudad", selectedCity);
      if (selectedVenue && selectedVenue !== "Todos")
        params.append("venue", selectedVenue);

      const dias = getDiasFromContext(dateRange);
      if (dias > 0) params.append("dias", dias.toString());

      console.log("🎤 Fetching artists with params:", params.toString());

      const response = await fetch(
        `${API_URL}/ranking-artistas?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      setTopArtistas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching artists:", err);
      setError("No se pudieron cargar los datos.");
      setTopArtistas([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCountry, selectedCity, selectedVenue, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- RENDERIZADO ---
  const displayedArtistas = topArtistas.slice(0, limit);

  const renderArtistCards = (artistas: TopArtista[]) => (
    <div className="grid gap-4 md:hidden">
      {artistas.map((artista, index) => {
        const initial = getInitial(artista.NombreOficial);
        const colorClass = getColorFromInitial(initial);

        return (
          <Card
            key={artista.NombreOficial}
            className="group hover-lift overflow-hidden border-0 shadow-lg animate-fade-in cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() =>
              navigate(`/artist/${encodeURIComponent(artista.NombreOficial)}`)
            }
          >
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
                        Top
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                    {artista.NombreOficial}
                  </h3>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 mb-3 glow-primary">
                <div className="text-xs font-medium text-primary">
                  Total de Menciones
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {artista.conteo.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground">
                  Posición #{index + 1} en el ranking
                </div>
                <div className="flex items-center gap-1 text-primary font-medium">
                  Ver detalles
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderArtistTable = (artistas: TopArtista[]) => (
    <div className="hidden md:block overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b-2">
            <TableHead className="w-12 font-bold">#</TableHead>
            <TableHead className="font-bold">Artista</TableHead>
            <TableHead className="text-right font-bold">Menciones</TableHead>
            <TableHead className="w-20"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {artistas.map((artista, index) => {
            const initial = getInitial(artista.NombreOficial);
            const colorClass = getColorFromInitial(initial);

            return (
              <TableRow
                key={artista.NombreOficial}
                className="group hover:bg-muted/50 cursor-pointer transition-all animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() =>
                  navigate(
                    `/artist/${encodeURIComponent(artista.NombreOficial)}`,
                  )
                }
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
                        {artista.NombreOficial}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="px-3 py-1 rounded-md bg-blue-500/10 text-blue-600 font-bold text-lg">
                    {artista.conteo.toLocaleString()}
                  </span>
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
            <p className="text-lg text-muted-foreground">
              Cargando ranking de artistas...
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
              Ranking de Artistas en Radio
              <Badge
                variant="outline"
                className="ml-2 bg-primary/10 text-primary border-primary/20"
              >
                {displayedArtistas.length} artistas
              </Badge>
            </CardTitle>
            {selectedCity !== "todos" && (
              <Badge variant="secondary" className="text-[10px] animate-pulse">
                Filtrado
              </Badge>
            )}
            <div className="text-xs text-muted-foreground">
              Actualizado cada 15 minutos
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            🎤 Artistas más mencionados en emisoras de radio - Datos en tiempo
            real
          </p>
        </CardHeader>
        <CardContent className="p-1 sm:p-4">
          {renderArtistCards(displayedArtistas)}
          {renderArtistTable(displayedArtistas)}

          {displayedArtistas.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No se encontraron artistas
              </p>
            </div>
          )}

          {displayedArtistas.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Mostrando {displayedArtistas.length} de {topArtistas.length}{" "}
                  artistas
                </div>
                {displayedArtistas.length < topArtistas.length && (
                  <button
                    onClick={() => navigate("/artists")}
                    className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                  >
                    Ver todos los artistas
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
