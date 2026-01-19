import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, AlertCircle, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState } from "react";

const kpis = [
  { label: "Pacing", value: "87%", trend: "up" },
  { label: "Delivery Total", value: "92%", trend: "up" },
  { label: "CPM Promedio", value: "$42", trend: "down" },
  { label: "Spots Entregados", value: "805 / 920", trend: "up" },
];

const allStations = [
  { name: "FM 99.5", plan: 180, detected: 165, pacing: 92, delivery: 92, cpm: "$45", alerts: 0, dateISO: "2025-10-01", country: "México", city: "CDMX" },
  { name: "Radio Digital", plan: 200, detected: 185, pacing: 92, delivery: 93, cpm: "$38", alerts: 0, dateISO: "2025-09-15", country: "México", city: "Guadalajara" },
  { name: "La Buena", plan: 150, detected: 120, pacing: 80, delivery: 80, cpm: "$42", alerts: 2, dateISO: "2025-09-01", country: "México", city: "CDMX" },
  { name: "Rock & Pop", plan: 190, detected: 175, pacing: 92, delivery: 92, cpm: "$40", alerts: 0, dateISO: "2025-08-20", country: "México", city: "Monterrey" },
  { name: "Urban Beat", plan: 200, detected: 160, pacing: 80, delivery: 80, cpm: "$46", alerts: 1, dateISO: "2025-08-05", country: "Estados Unidos", city: "Los Angeles" },
  { name: "FM Classic", plan: 170, detected: 155, pacing: 91, delivery: 91, cpm: "$43", alerts: 0, dateISO: "2025-07-15", country: "México", city: "CDMX" },
  { name: "Beat Station", plan: 160, detected: 140, pacing: 87, delivery: 88, cpm: "$44", alerts: 1, dateISO: "2025-06-25", country: "Estados Unidos", city: "Miami" },
];

interface AdvertisingComplianceProps {
  selectedCountry?: string;
  selectedCity?: string;
  dateRange?: string;
}

export const AdvertisingCompliance = ({ 
  selectedCountry = "México", 
  selectedCity = "CDMX" 
}: AdvertisingComplianceProps) => {
  const [dateFilter, setDateFilter] = useState<string>("all");

  const filteredStations = useMemo(() => {
    const now = new Date();
    
    // Filter by country and city first
    let filtered = allStations.filter(station => {
      const matchesCountry = station.country === selectedCountry;
      const matchesCity = station.city === selectedCity;
      return matchesCountry && matchesCity;
    });
    
    // Then filter by date if not "all"
    if (dateFilter !== "all") {
      const filterDate = new Date();
      if (dateFilter === "1month") {
        filterDate.setMonth(now.getMonth() - 1);
      } else if (dateFilter === "3months") {
        filterDate.setMonth(now.getMonth() - 3);
      } else if (dateFilter === "6months") {
        filterDate.setMonth(now.getMonth() - 6);
      }
      
      filtered = filtered.filter(station => {
        const stationDate = new Date(station.dateISO);
        return stationDate >= filterDate && stationDate <= now;
      });
    }
    
    return filtered;
  }, [dateFilter, selectedCountry, selectedCity]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Filtrar por periodo:</span>
        </div>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full sm:w-56 bg-background border-border hover:border-primary transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los periodos</SelectItem>
            <SelectItem value="1month">Último mes</SelectItem>
            <SelectItem value="3months">Últimos 3 meses</SelectItem>
            <SelectItem value="6months">Últimos 6 meses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-2">{kpi.value}</p>
                </div>
                {kpi.trend === "up" ? (
                  <TrendingUp className="h-5 w-5 text-success" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-destructive" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Cumplimiento por Estación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Estación</TableHead>
                  <TableHead className="text-right">Plan (spots)</TableHead>
                  <TableHead className="text-right">Detectado</TableHead>
                  <TableHead className="text-right">Pacing %</TableHead>
                  <TableHead className="text-right">Delivery %</TableHead>
                  <TableHead className="text-right">CPM</TableHead>
                  <TableHead className="text-right">Alertas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStations.map((station) => (
                  <TableRow key={station.name} className="border-border hover:bg-muted/30">
                    <TableCell className="font-medium">{station.name}</TableCell>
                    <TableCell className="text-right">{station.plan}</TableCell>
                    <TableCell className="text-right">{station.detected}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          station.pacing >= 90
                            ? "bg-success/10 text-success"
                            : station.pacing >= 80
                            ? "bg-warning/10 text-warning"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {station.pacing}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{station.delivery}%</TableCell>
                    <TableCell className="text-right">{station.cpm}</TableCell>
                    <TableCell className="text-right">
                      {station.alerts > 0 ? (
                        <div className="flex items-center justify-end gap-1">
                          <AlertCircle className="h-4 w-4 text-warning" />
                          <span>{station.alerts}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Spots: Planeados vs Entregados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStations.map((station) => (
              <div key={station.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{station.name}</span>
                  <span className="text-muted-foreground">
                    {station.detected} / {station.plan}
                  </span>
                </div>
                <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center text-xs font-medium"
                    style={{ width: "100%" }}
                  >
                    <span className="text-muted-foreground">Plan: {station.plan}</span>
                  </div>
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-xs font-semibold text-white transition-all"
                    style={{ width: `${(station.detected / station.plan) * 100}%` }}
                  >
                    {station.detected}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};