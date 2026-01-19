import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { realEventsDatabase } from "@/lib/realEventsDatabase";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { parseISO, format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Lightbulb, TrendingUp, Calendar, MapPin } from "lucide-react";

export const OpportunitiesReport = () => {
  const opportunities = useMemo(() => {
    const today = new Date();
    const threeMonthsFromNow = addDays(today, 90);
    
    // Generar todos los días en los próximos 3 meses
    const allDays = eachDayOfInterval({ start: today, end: threeMonthsFromNow });
    
    // Analizar cada día
    const dayAnalysis = allDays.map(day => {
      const eventsOnDay = realEventsDatabase.filter(event => 
        isSameDay(parseISO(event.date), day)
      );
      
      // Eventos en ±3 días
      const nearbyEvents = realEventsDatabase.filter(event => {
        const eventDate = parseISO(event.date);
        const diffDays = Math.abs((day.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 3 && !isSameDay(eventDate, day);
      });

      // Calcular score de oportunidad (menor = mejor)
      const opportunityScore = eventsOnDay.length + (nearbyEvents.length * 0.3);
      
      return {
        date: day,
        eventsOnDay: eventsOnDay.length,
        nearbyEvents: nearbyEvents.length,
        opportunityScore,
        dayOfWeek: day.getDay()
      };
    });

    // Filtrar solo días con baja saturación y ordenar por mejor oportunidad
    return dayAnalysis
      .filter(day => day.opportunityScore <= 1)
      .sort((a, b) => a.opportunityScore - b.opportunityScore)
      .slice(0, 15); // Top 15 oportunidades
  }, []);

  const genreOpportunities = useMemo(() => {
    const genres = Array.from(new Set(realEventsDatabase.map(e => e.genre)));
    
    return genres.map(genre => {
      const genreEvents = realEventsDatabase.filter(e => e.genre === genre);
      const avgEventsPerDay = genreEvents.length / 90; // Promedio en 3 meses
      
      // Calcular próxima fecha sin eventos de este género
      const today = new Date();
      let nextAvailable = null;
      
      for (let i = 0; i < 90; i++) {
        const checkDate = addDays(today, i);
        const hasEvent = genreEvents.some(e => isSameDay(parseISO(e.date), checkDate));
        if (!hasEvent) {
          nextAvailable = checkDate;
          break;
        }
      }

      return {
        genre,
        totalEvents: genreEvents.length,
        avgEventsPerDay: avgEventsPerDay.toFixed(2),
        saturation: avgEventsPerDay < 0.3 ? "Baja" : avgEventsPerDay < 0.6 ? "Media" : "Alta",
        nextAvailable: nextAvailable ? format(nextAvailable, "d MMM", { locale: es }) : "N/A"
      };
    }).sort((a, b) => parseFloat(a.avgEventsPerDay) - parseFloat(b.avgEventsPerDay));
  }, []);

  const venueOpportunities = useMemo(() => {
    const venues = Array.from(new Set(realEventsDatabase.map(e => e.venue)));
    
    return venues.map(venue => {
      const venueEvents = realEventsDatabase.filter(e => e.venue === venue);
      const totalCapacity = venueEvents[0]?.capacity || 0;
      
      return {
        venue,
        totalEvents: venueEvents.length,
        capacity: totalCapacity,
        avgOccupancy: venueEvents.reduce((sum, e) => sum + (e.occupancyRate || 75), 0) / venueEvents.length
      };
    }).sort((a, b) => a.totalEvents - b.totalEvents);
  }, []);

  const getOpportunityBadge = (score: number) => {
    if (score === 0) return { text: "Excelente", class: "bg-success text-success-foreground" };
    if (score <= 0.5) return { text: "Muy Buena", class: "bg-success/70 text-success-foreground" };
    return { text: "Buena", class: "bg-info/70 text-white" };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <CardTitle>Mejores Oportunidades</CardTitle>
          </div>
          <CardDescription>
            Fechas óptimas con baja saturación en los próximos 3 meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {opportunities.slice(0, 10).map((opp, idx) => {
              const badge = getOpportunityBadge(opp.opportunityScore);
              const dayName = format(opp.date, "EEEE", { locale: es });
              
              return (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <div className="text-2xl font-bold text-primary">
                        {format(opp.date, "d", { locale: es })}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase">
                        {format(opp.date, "MMM", { locale: es })}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold capitalize">{dayName}</p>
                      <p className="text-sm text-muted-foreground">
                        {opp.eventsOnDay} evento{opp.eventsOnDay !== 1 ? "s" : ""} ese día
                        {opp.nearbyEvents > 0 && `, ${opp.nearbyEvents} cercano${opp.nearbyEvents !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </div>
                  <Badge className={badge.class}>
                    {badge.text}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
              <CardTitle>Oportunidades por Género</CardTitle>
            </div>
            <CardDescription>Géneros con menor saturación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {genreOpportunities.map((genre, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">{genre.genre}</p>
                    <p className="text-sm text-muted-foreground">
                      {genre.totalEvents} eventos • Próxima fecha libre: {genre.nextAvailable}
                    </p>
                  </div>
                  <Badge variant={genre.saturation === "Baja" ? "default" : "secondary"}>
                    {genre.saturation}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-secondary" />
              <CardTitle>Venues Disponibles</CardTitle>
            </div>
            <CardDescription>Venues con menor actividad</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {venueOpportunities.slice(0, 8).map((venue, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{venue.venue}</p>
                    <p className="text-xs text-muted-foreground">
                      Cap: {venue.capacity.toLocaleString()} • {venue.totalEvents} eventos programados
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{venue.avgOccupancy.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">ocupación</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
