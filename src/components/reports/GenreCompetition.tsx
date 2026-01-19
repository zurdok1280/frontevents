import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { realEventsDatabase } from "@/lib/realEventsDatabase";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useMemo } from "react";
import { parseISO, format, differenceInDays, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";

export const GenreCompetition = () => {
  const [selectedGenre, setSelectedGenre] = useState("todos");
  const [timeWindow, setTimeWindow] = useState("7"); // días antes y después

  const genres = useMemo(() => {
    const genreSet = new Set(realEventsDatabase.map(e => e.genre));
    return ["todos", ...Array.from(genreSet)];
  }, []);

  const competitionData = useMemo(() => {
    const events = selectedGenre === "todos" 
      ? realEventsDatabase 
      : realEventsDatabase.filter(e => e.genre === selectedGenre);

    return events.map(event => {
      const eventDate = parseISO(event.dateISO);
      const windowDays = parseInt(timeWindow);
      
      // Contar todos los eventos cercanos en la misma ciudad (todos los géneros compiten)
      const nearbyEvents = realEventsDatabase.filter(other => {
        if (other.id === event.id) return false;
        // Eliminamos el filtro de género - todos los eventos compiten
        if (other.city !== event.city) return false; // Solo eventos de la misma ciudad
        
        try {
          const otherDate = parseISO(other.dateISO);
          const daysDiff = Math.abs(differenceInDays(eventDate, otherDate));
          return daysDiff <= 4; // Solo eventos dentro de ±4 días (misma semana)
        } catch {
          return false;
        }
      });

      const competitionLevel = 
        nearbyEvents.length === 0 ? "Baja" :
        nearbyEvents.length <= 2 ? "Media" : "Alta";

      const totalCapacity = nearbyEvents.reduce((sum, e) => sum + (e.capacity || 0), 0);

      return {
        ...event,
        nearbyEventsCount: nearbyEvents.length,
        competitionLevel,
        totalNearbyCapacity: totalCapacity,
        nearbyEvents: nearbyEvents.map(e => {
          try {
            return {
              name: e.name,
              date: format(parseISO(e.dateISO), "d MMM", { locale: es }),
              venue: e.venue,
              genre: e.genre,
              capacity: e.capacity || 0
            };
          } catch {
            return {
              name: e.name,
              date: e.date,
              venue: e.venue,
              genre: e.genre,
              capacity: e.capacity || 0
            };
          }
        })
      };
    }).sort((a, b) => a.nearbyEventsCount - b.nearbyEventsCount);
  }, [selectedGenre, timeWindow]);

  const chartData = useMemo(() => {
    const counts = { Baja: 0, Media: 0, Alta: 0 };
    competitionData.forEach(event => {
      counts[event.competitionLevel as keyof typeof counts]++;
    });
    return [
      { name: "Baja Competencia", value: counts.Baja, fill: "hsl(var(--success))" },
      { name: "Competencia Media", value: counts.Media, fill: "hsl(var(--warning))" },
      { name: "Alta Competencia", value: counts.Alta, fill: "hsl(var(--destructive))" }
    ];
  }, [competitionData]);

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case "Baja": return "bg-success/20 text-success border-success";
      case "Media": return "bg-warning/20 text-warning border-warning";
      case "Alta": return "bg-destructive/20 text-destructive border-destructive";
      default: return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análisis de Competencia de Eventos</CardTitle>
        <CardDescription>
          Identifica todos los eventos cercanos que competirían por audiencia (todos los géneros)
        </CardDescription>
        <div className="flex gap-4 mt-4">
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Seleccionar género" />
            </SelectTrigger>
            <SelectContent>
              {genres.map(genre => (
                <SelectItem key={genre} value={genre}>
                  {genre === "todos" ? "Todos los géneros" : genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeWindow} onValueChange={setTimeWindow}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Ventana de tiempo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">± 3 días</SelectItem>
              <SelectItem value="7">± 7 días</SelectItem>
              <SelectItem value="14">± 14 días</SelectItem>
              <SelectItem value="30">± 30 días</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Eventos y su Nivel de Competencia</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {competitionData.map(event => (
              <Card key={event.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{event.name}</h4>
                      <Badge className={getCompetitionColor(event.competitionLevel)}>
                        {event.competitionLevel} competencia
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>📅 {format(parseISO(event.dateISO), "d MMMM yyyy", { locale: es })}</p>
                      <p>🎵 {event.genre}</p>
                      <p>📍 {event.venue}</p>
                    </div>
                    {event.nearbyEventsCount > 0 && (
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold">
                            {event.nearbyEventsCount} evento{event.nearbyEventsCount !== 1 ? "s" : ""} cercano{event.nearbyEventsCount !== 1 ? "s" : ""} (todos los géneros):
                          </p>
                          <p className="text-xs font-bold text-foreground">
                            👥 {event.totalNearbyCapacity?.toLocaleString() || 0} personas
                          </p>
                        </div>
                        <ul className="text-xs space-y-1">
                          {event.nearbyEvents.slice(0, 5).map((nearby, idx) => (
                            <li key={idx}>• {nearby.name} - {nearby.date} ({nearby.venue}) - <span className="text-primary font-medium">{nearby.genre}</span> - <span className="text-muted-foreground">{nearby.capacity?.toLocaleString() || 0} cap.</span></li>
                          ))}
                          {event.nearbyEvents.length > 5 && (
                            <TooltipProvider>
                              <Tooltip delayDuration={200}>
                                <TooltipTrigger asChild>
                                  <li className="text-primary cursor-pointer hover:text-primary/80 transition-colors font-medium underline decoration-dotted">
                                    ... y {event.nearbyEvents.length - 5} más (clic para ver)
                                  </li>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-xl p-4 bg-popover border-2 border-primary/20 shadow-lg">
                                  <div className="space-y-2">
                                    <p className="font-semibold text-sm border-b border-border pb-2">Eventos adicionales:</p>
                                    <ul className="text-xs space-y-1.5 max-h-[300px] overflow-y-auto">
                                      {event.nearbyEvents.slice(5).map((nearby, idx) => (
                                        <li key={idx} className="py-1">• {nearby.name} - {nearby.date} ({nearby.venue}) - <span className="text-primary font-medium">{nearby.genre}</span> - <span className="text-muted-foreground">{nearby.capacity?.toLocaleString() || 0} cap.</span></li>
                                      ))}
                                    </ul>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
