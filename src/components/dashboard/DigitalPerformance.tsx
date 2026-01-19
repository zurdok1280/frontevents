import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const tracks = [
  {
    name: "Hit Verano",
    artist: "Banda Estelar",
    streams: "125,000",
    streamsChange: "+12%",
    playlistAdds: 230,
    playlistChange: "+5%",
    searches: "+18%",
  },
  {
    name: "Balada Romántica",
    artist: "Pop Star",
    streams: "98,500",
    streamsChange: "+8%",
    playlistAdds: 185,
    playlistChange: "+3%",
    searches: "+12%",
  },
  {
    name: "Urbano Flow",
    artist: "Artista Urbano",
    streams: "156,000",
    streamsChange: "+20%",
    playlistAdds: 320,
    playlistChange: "+15%",
    searches: "+25%",
  },
];

const chartData = [
  { day: "Sem 1", track1: 85, track2: 70, track3: 95 },
  { day: "Sem 2", track1: 92, track2: 75, track3: 105 },
  { day: "Sem 3", track1: 105, track2: 82, track3: 125 },
  { day: "Sem 4", track1: 125, track2: 98, track3: 156 },
];

export const DigitalPerformance = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tracks.map((track) => (
          <Card key={track.name} className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{track.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{track.artist}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Streams 7d</span>
                  <span className="text-sm font-medium text-success">{track.streamsChange}</span>
                </div>
                <p className="text-2xl font-bold">{track.streams}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Playlist adds 7d</span>
                  <span className="text-sm font-medium text-success">{track.playlistChange}</span>
                </div>
                <p className="text-xl font-bold">{track.playlistAdds}</p>
              </div>

              <div className="pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-sm text-muted-foreground">Búsquedas locales</span>
                  <span className="text-sm font-semibold text-success">{track.searches}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Streams Locales - Últimas 4 Semanas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {tracks.map((track, trackIndex) => (
              <div key={track.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{track.name}</span>
                  <span className="text-sm text-muted-foreground">{track.streams}</span>
                </div>
                <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-end justify-around p-2 gap-1">
                    {chartData.map((data, idx) => {
                      const value = trackIndex === 0 ? data.track1 : trackIndex === 1 ? data.track2 : data.track3;
                      const maxValue = Math.max(...chartData.map(d => trackIndex === 0 ? d.track1 : trackIndex === 1 ? d.track2 : d.track3));
                      const height = (value / maxValue) * 100;
                      return (
                        <div
                          key={idx}
                          className="flex-1 bg-gradient-to-t from-primary to-secondary rounded-t transition-all hover:opacity-80"
                          style={{ height: `${height}%` }}
                          title={`${data.day}: ${value}k`}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-around text-xs text-muted-foreground">
                  {chartData.map((data) => (
                    <span key={data.day}>{data.day}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
