import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { realEventsDatabase } from "@/lib/realEventsDatabase";
import { useMemo } from "react";
import { parseISO, format, getMonth, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Calendar, Clock } from "lucide-react";

export const TemporalMetrics = () => {
  const monthlyData = useMemo(() => {
    const months = Array(12).fill(0).map((_, i) => ({
      month: format(new Date(2025, i, 1), "MMMM", { locale: es }),
      eventos: 0,
      capacidad: 0
    }));

    realEventsDatabase.forEach(event => {
      try {
        const monthIndex = getMonth(parseISO(event.dateISO));
        if (monthIndex >= 0 && monthIndex < 12) {
          months[monthIndex].eventos += 1;
          months[monthIndex].capacidad += (event.capacity || 0);
        }
      } catch (error) {
        console.error('Error processing event date:', event.dateISO, error);
      }
    });

    return months;
  }, []);

  const weekdayData = useMemo(() => {
    const weekdays = [
      { name: "Domingo", count: 0, revenue: 0 },
      { name: "Lunes", count: 0, revenue: 0 },
      { name: "Martes", count: 0, revenue: 0 },
      { name: "Miércoles", count: 0, revenue: 0 },
      { name: "Jueves", count: 0, revenue: 0 },
      { name: "Viernes", count: 0, revenue: 0 },
      { name: "Sábado", count: 0, revenue: 0 }
    ];

    realEventsDatabase.forEach(event => {
      try {
        const dayIndex = getDay(parseISO(event.dateISO));
        if (dayIndex >= 0 && dayIndex <= 6) {
          weekdays[dayIndex].count += 1;
          weekdays[dayIndex].revenue += (event.capacity || 0) * (event.occupancyRate || 75) * 50; // Estimado
        }
      } catch (error) {
        console.error('Error processing event date:', event.dateISO, error);
      }
    });

    return weekdays;
  }, []);

  const genreDistribution = useMemo(() => {
    const genres = new Map<string, number>();
    
    realEventsDatabase.forEach(event => {
      genres.set(event.genre, (genres.get(event.genre) || 0) + 1);
    });

    return Array.from(genres.entries()).map(([name, value]) => ({
      name,
      value
    }));
  }, []);

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))"
  ];

  const venueCapacityData = useMemo(() => {
    const venues = new Map<string, { total: number, events: number }>();
    
    realEventsDatabase.forEach(event => {
      const current = venues.get(event.venue) || { total: 0, events: 0 };
      venues.set(event.venue, {
        total: current.total + ((event.capacity || 0) * (event.occupancyRate || 75) / 100),
        events: current.events + 1
      });
    });

    return Array.from(venues.entries())
      .map(([name, data]) => ({
        name: name.length > 20 ? name.substring(0, 20) + "..." : name,
        promedio: Math.round(data.total / data.events),
        eventos: data.events
      }))
      .sort((a, b) => b.promedio - a.promedio)
      .slice(0, 8);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Total Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{realEventsDatabase.length}</p>
            <p className="text-sm text-muted-foreground">En base de datos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-secondary" />
              Promedio Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {(realEventsDatabase.length / 12).toFixed(1)}
            </p>
            <p className="text-sm text-muted-foreground">Eventos por mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              Día Más Popular
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {weekdayData.reduce((max, day) => day.count > max.count ? day : max).name}
            </p>
            <p className="text-sm text-muted-foreground">
              {weekdayData.reduce((max, day) => day.count > max.count ? day : max).count} eventos
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eventos por Mes</CardTitle>
          <CardDescription>Distribución anual de eventos y capacidad total</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="eventos" fill="hsl(var(--primary))" name="Eventos" />
                <Bar yAxisId="right" dataKey="capacidad" fill="hsl(var(--secondary))" name="Capacidad Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Eventos por Día de la Semana</CardTitle>
            <CardDescription>Preferencias de programación semanal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weekdayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" name="Cantidad de Eventos" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Género</CardTitle>
            <CardDescription>Proporción de eventos por tipo de música</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genreDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asistencia Promedio por Venue</CardTitle>
          <CardDescription>Top venues por asistencia promedio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={venueCapacityData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="promedio" fill="hsl(var(--secondary))" name="Asistencia Promedio" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
