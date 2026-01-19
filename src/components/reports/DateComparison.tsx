import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { realEventsDatabase } from "@/lib/realEventsDatabase";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { parseISO, format, isSameDay, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, CheckCircle, AlertTriangle, TrendingUp, Users, MapPin } from "lucide-react";

export const DateComparison = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const dateAnalysis = useMemo(() => {
    if (!selectedDate) return null;

    const eventsOnDate = realEventsDatabase.filter(event => 
      isSameDay(parseISO(event.date), selectedDate)
    );

    const nearbyEvents = realEventsDatabase.filter(event => {
      const eventDate = parseISO(event.date);
      const daysDiff = Math.abs(differenceInDays(selectedDate, eventDate));
      return daysDiff > 0 && daysDiff <= 7;
    });

    const genreBreakdown = new Map<string, number>();
    eventsOnDate.forEach(event => {
      genreBreakdown.set(event.genre, (genreBreakdown.get(event.genre) || 0) + 1);
    });

    const totalCapacity = eventsOnDate.reduce((sum, e) => sum + (e.capacity || 0), 0);
    const avgOccupancy = eventsOnDate.length > 0
      ? eventsOnDate.reduce((sum, e) => sum + (e.occupancyRate || 75), 0) / eventsOnDate.length
      : 0;

    // Calcular nivel de recomendación
    let recommendationScore = 100;
    let recommendationFactors: { text: string; impact: number; type: "positive" | "negative" }[] = [];

    if (eventsOnDate.length === 0) {
      recommendationFactors.push({ text: "Sin eventos programados", impact: 20, type: "positive" });
      recommendationScore += 20;
    } else if (eventsOnDate.length >= 5) {
      recommendationFactors.push({ text: "Día muy saturado", impact: -30, type: "negative" });
      recommendationScore -= 30;
    } else if (eventsOnDate.length >= 3) {
      recommendationFactors.push({ text: "Múltiples eventos", impact: -15, type: "negative" });
      recommendationScore -= 15;
    }

    if (nearbyEvents.length < 3) {
      recommendationFactors.push({ text: "Poca competencia cercana", impact: 15, type: "positive" });
      recommendationScore += 15;
    } else if (nearbyEvents.length > 10) {
      recommendationFactors.push({ text: "Alta competencia en la semana", impact: -20, type: "negative" });
      recommendationScore -= 20;
    }

    if (totalCapacity > 50000) {
      recommendationFactors.push({ text: "Alta capacidad comprometida", impact: -10, type: "negative" });
      recommendationScore -= 10;
    }

    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      recommendationFactors.push({ text: "Fin de semana (mayor asistencia)", impact: 10, type: "positive" });
      recommendationScore += 10;
    }

    recommendationScore = Math.max(0, Math.min(100, recommendationScore));

    const getRecommendationLevel = (score: number) => {
      if (score >= 80) return { text: "Excelente", icon: CheckCircle, color: "text-success" };
      if (score >= 60) return { text: "Buena", icon: TrendingUp, color: "text-info" };
      if (score >= 40) return { text: "Media", icon: AlertTriangle, color: "text-warning" };
      return { text: "Baja", icon: AlertCircle, color: "text-destructive" };
    };

    const recommendation = getRecommendationLevel(recommendationScore);

    return {
      eventsOnDate,
      nearbyEvents,
      genreBreakdown: Array.from(genreBreakdown.entries()),
      totalCapacity,
      avgOccupancy,
      recommendationScore,
      recommendation,
      recommendationFactors,
      dayOfWeek: format(selectedDate, "EEEE", { locale: es })
    };
  }, [selectedDate]);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Selecciona una Fecha</CardTitle>
          <CardDescription>
            Analiza la viabilidad de programar un evento
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={es}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {dateAnalysis && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <dateAnalysis.recommendation.icon className={`h-5 w-5 ${dateAnalysis.recommendation.color}`} />
                Recomendación: {dateAnalysis.recommendation.text}
              </CardTitle>
              <CardDescription>
                {format(selectedDate!, "d 'de' MMMM 'de' yyyy", { locale: es })} - {dateAnalysis.dayOfWeek}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Score de Oportunidad</span>
                    <span className="text-2xl font-bold">{dateAnalysis.recommendationScore}/100</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        dateAnalysis.recommendationScore >= 80 ? "bg-success" :
                        dateAnalysis.recommendationScore >= 60 ? "bg-info" :
                        dateAnalysis.recommendationScore >= 40 ? "bg-warning" :
                        "bg-destructive"
                      }`}
                      style={{ width: `${dateAnalysis.recommendationScore}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Factores de Análisis</h4>
                  {dateAnalysis.recommendationFactors.map((factor, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      {factor.type === "positive" ? (
                        <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                      )}
                      <span>{factor.text}</span>
                      <span className={`ml-auto font-semibold ${
                        factor.type === "positive" ? "text-success" : "text-destructive"
                      }`}>
                        {factor.impact > 0 ? "+" : ""}{factor.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Eventos en esta Fecha
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dateAnalysis.eventsOnDate.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Sin eventos programados
                </p>
              ) : (
                <div className="space-y-3">
                  {dateAnalysis.eventsOnDate.map(event => (
                    <div key={event.id} className="border rounded-lg p-3">
                      <h4 className="font-semibold">{event.name}</h4>
                      <div className="text-sm text-muted-foreground mt-1 space-y-1">
                        <p>🎵 {event.genre}</p>
                        <p>📍 {event.venue}</p>
                        <p>👥 {(event.capacity || 0).toLocaleString()} cap. • {event.occupancyRate || 75}% ocupación</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Capacidad Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {dateAnalysis.totalCapacity.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">personas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Ocupación Prom.
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {dateAnalysis.avgOccupancy.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">promedio</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Eventos Cercanos (±7 días)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold mb-2">
                {dateAnalysis.nearbyEvents.length} evento{dateAnalysis.nearbyEvents.length !== 1 ? "s" : ""}
              </p>
              {dateAnalysis.genreBreakdown.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {dateAnalysis.genreBreakdown.map(([genre, count]) => (
                    <Badge key={genre} variant="secondary">
                      {genre}: {count}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
