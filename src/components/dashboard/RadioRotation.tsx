import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown } from "lucide-react";

const songs = [
  {
    name: "Hit Verano",
    station: "FM 99.5",
    spinsPerDay: 320,
    primeDaypart: 45,
    trend: "up",
    trendValue: "+12%",
  },
  {
    name: "Balada Romántica",
    station: "Radio Digital",
    spinsPerDay: 240,
    primeDaypart: 38,
    trend: "up",
    trendValue: "+8%",
  },
  {
    name: "Rock Anthem",
    station: "Rock & Pop",
    spinsPerDay: 180,
    primeDaypart: 42,
    trend: "down",
    trendValue: "-5%",
  },
  {
    name: "Urbano Flow",
    station: "Urban Beat",
    spinsPerDay: 290,
    primeDaypart: 52,
    trend: "up",
    trendValue: "+18%",
  },
  {
    name: "Pop Sensation",
    station: "La Buena",
    spinsPerDay: 210,
    primeDaypart: 35,
    trend: "up",
    trendValue: "+6%",
  },
];

const heatmapData = [
  { station: "FM 99.5", values: [85, 92, 88, 95, 90, 78, 65] },
  { station: "Radio Digital", values: [75, 80, 85, 82, 88, 70, 55] },
  { station: "La Buena", values: [65, 70, 72, 75, 68, 60, 45] },
  { station: "Rock & Pop", values: [80, 85, 88, 90, 85, 72, 60] },
  { station: "Urban Beat", values: [90, 95, 92, 98, 94, 82, 68] },
];

const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const getHeatmapColor = (value: number) => {
  if (value >= 90) return "bg-primary";
  if (value >= 75) return "bg-primary/70";
  if (value >= 60) return "bg-primary/40";
  return "bg-primary/20";
};

export const RadioRotation = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Intensidad de Rotación por Día</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="grid grid-cols-8 gap-2">
                <div className="font-medium text-sm text-muted-foreground"></div>
                {days.map((day) => (
                  <div key={day} className="text-center font-medium text-sm text-muted-foreground">
                    {day}
                  </div>
                ))}

                {heatmapData.map((row) => (
                  <>
                    <div key={`${row.station}-label`} className="font-medium text-sm flex items-center">
                      {row.station}
                    </div>
                    {row.values.map((value, idx) => (
                      <div
                        key={`${row.station}-${idx}`}
                        className={`aspect-square rounded-lg ${getHeatmapColor(
                          value
                        )} flex items-center justify-center text-xs font-semibold text-white transition-colors hover:opacity-80`}
                      >
                        {value}
                      </div>
                    ))}
                  </>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Canciones en Rotación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Canción</TableHead>
                  <TableHead>Estación</TableHead>
                  <TableHead className="text-right">Spins/día</TableHead>
                  <TableHead className="text-right">Prime Daypart %</TableHead>
                  <TableHead className="text-right">Tendencia (7d vs 28d)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {songs.map((song) => (
                  <TableRow key={`${song.name}-${song.station}`} className="border-border hover:bg-muted/30">
                    <TableCell className="font-medium">{song.name}</TableCell>
                    <TableCell>{song.station}</TableCell>
                    <TableCell className="text-right font-semibold">{song.spinsPerDay}</TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                        {song.primeDaypart}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {song.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-success" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-destructive" />
                        )}
                        <span
                          className={`font-medium ${
                            song.trend === "up" ? "text-success" : "text-destructive"
                          }`}
                        >
                          {song.trendValue}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
