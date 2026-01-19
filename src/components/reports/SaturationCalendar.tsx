import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { realEventsDatabase } from "@/lib/realEventsDatabase";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const SaturationCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date: Date) => {
    return realEventsDatabase.filter(event => {
      try {
        return isSameDay(parseISO(event.dateISO), date);
      } catch {
        return false;
      }
    });
  };

  const getSaturationLevel = (eventsCount: number) => {
    if (eventsCount === 0) return { level: "none", color: "bg-muted", text: "Sin eventos" };
    if (eventsCount <= 2) return { level: "low", color: "bg-success/20 border-success", text: "Baja saturación" };
    if (eventsCount <= 4) return { level: "medium", color: "bg-warning/20 border-warning", text: "Saturación media" };
    return { level: "high", color: "bg-destructive/20 border-destructive", text: "Alta saturación" };
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Calendario de Saturación</CardTitle>
            <CardDescription>
              Visualiza las fechas con mayor y menor concentración de eventos
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold min-w-[150px] text-center">
              {format(currentDate, "MMMM yyyy", { locale: es })}
            </span>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(day => (
            <div key={day} className="text-center font-semibold text-sm text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {/* Espacios vacíos para el inicio del mes */}
          {Array.from({ length: monthStart.getDay() }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}
          
          {/* Días del mes */}
          {daysInMonth.map(day => {
            const events = getEventsForDate(day);
            const saturation = getSaturationLevel(events.length);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div
                key={day.toISOString()}
                className={`aspect-square border-2 rounded-lg p-2 transition-all hover:scale-105 cursor-pointer ${saturation.color} ${
                  isToday ? "ring-2 ring-primary" : ""
                }`}
                title={`${format(day, "d MMM", { locale: es })}: ${events.length} eventos - ${saturation.text}`}
              >
                <div className="text-xs font-semibold mb-1">
                  {format(day, "d")}
                </div>
                {events.length > 0 && (
                  <div className="flex flex-col gap-0.5">
                    <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                      {events.length} evento{events.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success/20 border-2 border-success" />
            <span className="text-sm">Baja saturación (1-2 eventos)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-warning/20 border-2 border-warning" />
            <span className="text-sm">Media (3-4 eventos)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-destructive/20 border-2 border-destructive" />
            <span className="text-sm">Alta (5+ eventos)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
