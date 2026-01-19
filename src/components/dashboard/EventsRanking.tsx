import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, Sparkles, Calendar, TrendingUp, Music } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { realEventsDatabase } from "@/lib/realEventsDatabase";

interface EventsRankingProps {
  selectedCity?: string;
  selectedGenre?: string;
  selectedVenue?: string;
  sortBy?: string;
}

const genreColors: Record<string, string> = {
  "Urbano": "bg-gradient-to-r from-purple-500 to-pink-500",
  "Regional": "bg-gradient-to-r from-orange-500 to-red-500",
  "Pop": "bg-gradient-to-r from-pink-500 to-purple-500",
  "Rock": "bg-gradient-to-r from-gray-700 to-gray-900",
  "Balada": "bg-gradient-to-r from-rose-500 to-pink-500",
  "Clásica": "bg-gradient-to-r from-purple-500 to-indigo-500",
};

export const EventsRanking = ({ 
  selectedCity = "todos",
  selectedGenre = "todos", 
  selectedVenue = "todos",
  sortBy = "impact" 
}: EventsRankingProps) => {
  const navigate = useNavigate();

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = realEventsDatabase;
    
    // Aplicar filtros
    if (selectedCity !== "todos" && selectedCity !== "CDMX") {
      filtered = filtered.filter(event => event.city === selectedCity);
    }
    if (selectedGenre !== "todos") {
      filtered = filtered.filter(event => event.genre === selectedGenre);
    }
    if (selectedVenue !== "todos") {
      filtered = filtered.filter(event => event.venue === selectedVenue);
    }
    
    // Calcular total
    const withTotal = filtered.map(event => ({
      ...event,
      total: event.spots + event.mentions
    }));

    // Ordenar
    if (sortBy === "date") {
      return withTotal.sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime());
    }
    
    if (sortBy === "capacity") {
      return withTotal.sort((a, b) => (b.capacity || 0) - (a.capacity || 0));
    }
    
    if (sortBy === "spots") {
      return withTotal.sort((a, b) => b.spots - a.spots);
    }
    
    if (sortBy === "mentions") {
      return withTotal.sort((a, b) => b.mentions - a.mentions);
    }
    
    if (sortBy === "total") {
      return withTotal.sort((a, b) => b.total - a.total);
    }
    
    if (sortBy === "reach") {
      return withTotal.sort((a, b) => {
        const reachA = parseFloat((a.reach || "0").replace(/[KM]/g, '')) * ((a.reach || "").includes('M') ? 1000 : 1);
        const reachB = parseFloat((b.reach || "0").replace(/[KM]/g, '')) * ((b.reach || "").includes('M') ? 1000 : 1);
        return reachB - reachA;
      });
    }
    
    return withTotal.sort((a, b) => b.total - a.total);
  }, [selectedCity, selectedGenre, selectedVenue, sortBy]);

  const renderEventCards = (events: typeof filteredAndSortedEvents) => (
    <div className="grid gap-4 md:hidden">
      {events.map((event, index) => (
          <Card 
            key={event.id}
            className="group hover-lift overflow-hidden border-0 shadow-lg animate-fade-in cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => navigate(`/event/${event.id}`)}
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={event.image} 
                alt={event.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
                    {index + 1}
                  </span>
                </div>
                {index === 0 && (
                  <Badge className={`${genreColors[event.genre] || "bg-gradient-to-r from-gray-500 to-slate-500"} text-white border-0 gap-1`}>
                    <Sparkles className="h-3 w-3" />
                    Top
                  </Badge>
                )}
              </div>
              <Badge className={`absolute top-3 right-3 ${genreColors[event.genre] || "bg-gradient-to-r from-gray-500 to-slate-500"} text-white border-0`}>
                {event.genre}
              </Badge>
            </div>
            <CardContent className="p-4">
              <div className="mb-3">
                <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                  {event.name}
                </h3>
                <p className="text-sm text-muted-foreground">{event.artist}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {event.city} • {event.venue} • {event.date}
                </p>
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
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Alcance</div>
                  <div className="text-sm font-bold text-foreground">{event.reach || "N/A"}</div>
                </div>
              </div>
              
              {event.capacity && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Capacidad</span>
                  <span className="font-semibold text-foreground">{event.capacity.toLocaleString()} asistentes</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
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
            <TableHead className="font-bold">Capacidad</TableHead>
            <TableHead className="font-bold">Fecha</TableHead>
            <TableHead className="text-right font-bold">Spots</TableHead>
            <TableHead className="text-right font-bold">Menciones</TableHead>
            <TableHead className="text-right font-bold">Total</TableHead>
            <TableHead className="text-right font-bold">Alcance</TableHead>
            <TableHead className="w-20"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event, index) => (
            <TableRow 
              key={event.id}
              className="group hover:bg-muted/50 cursor-pointer transition-all animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => navigate(`/event/${event.id}`)}
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
                  <img 
                    src={event.image} 
                    alt={event.name}
                    className="w-12 h-12 rounded-lg object-cover shadow-sm"
                  />
                  <div>
                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {event.name}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      {event.artist}
                      <Badge variant="outline" className={`${genreColors[event.genre] || "bg-gradient-to-r from-gray-500 to-slate-500"} text-white border-0 text-xs`}>
                        {event.genre}
                      </Badge>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm">{event.city}</TableCell>
              <TableCell className="text-sm">{event.venue}</TableCell>
              <TableCell className="text-sm font-semibold text-muted-foreground">
                {event.capacity ? event.capacity.toLocaleString() : "N/A"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  {event.date}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <span className="px-2 py-1 rounded-md bg-primary/10 text-primary font-semibold text-sm">
                  {event.spots}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className="px-2 py-1 rounded-md bg-secondary/10 text-secondary font-semibold text-sm">
                  {event.mentions}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {event.total}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right font-semibold">{event.reach || "N/A"}</TableCell>
              <TableCell>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

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
          </div>
          <p className="text-sm text-muted-foreground">
            🎵 Eventos musicales reales - Guadalajara y Monterrey
          </p>
        </CardHeader>
        <CardContent className="p-1 sm:p-4">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="all" className="text-xs sm:text-sm">
                Todos los Eventos
              </TabsTrigger>
              <TabsTrigger value="spots" className="text-xs sm:text-sm">
                Solo Spots Comerciales
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
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
              {renderEventCards(filteredAndSortedEvents.filter(e => e.isSpot))}
              {renderEventTable(filteredAndSortedEvents.filter(e => e.isSpot))}
              
              {filteredAndSortedEvents.filter(e => e.isSpot).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No se encontraron spots comerciales con los filtros seleccionados
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
