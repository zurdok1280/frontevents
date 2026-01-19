import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play } from "lucide-react";

// Mock data - in real app would fetch based on eventId and station
const scheduleData = {
  ads: [
    { time: "06:15 AM", duration: "30s" },
    { time: "08:30 AM", duration: "30s" },
    { time: "10:45 AM", duration: "30s" },
    { time: "12:45 PM", duration: "30s" },
    { time: "03:20 PM", duration: "30s" },
    { time: "05:20 PM", duration: "30s" },
    { time: "07:15 PM", duration: "30s" },
    { time: "09:30 PM", duration: "30s" },
  ],
  mentions: [
    { time: "07:05 AM", locutor: "Mario Bezares", duration: "2m 15s" },
    { time: "09:20 AM", locutor: "Sofía Rivera Torres", duration: "1m 45s" },
    { time: "01:30 PM", locutor: "Héctor Sandarti", duration: "3m 00s" },
    { time: "04:15 PM", locutor: "Martha Debayle", duration: "2m 30s" },
    { time: "06:45 PM", locutor: "Yordi Rosado", duration: "4m 15s" },
  ],
};

export default function StationSchedule() {
  const { eventId, stationName } = useParams();
  const navigate = useNavigate();
  const decodedStation = decodeURIComponent(stationName || "");

  const handlePlayAudio = (type: string, time: string) => {
    console.log(`Playing ${type} from ${time}`);
    // TODO: Implement audio playback
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(`/event/${eventId}`)}
            className="gap-2 w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-xl md:text-3xl font-bold">{decodedStation}</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Spots y Menciones
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          {/* Spots */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl font-semibold">Spots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {scheduleData.ads.map((ad, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-sm">{ad.time}</span>
                      <span className="text-xs text-muted-foreground ml-2">({ad.duration})</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePlayAudio('spot', ad.time)}
                      className="gap-2"
                    >
                      <Play className="h-3 w-3" />
                      <span className="hidden sm:inline">Escuchar</span>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Menciones */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl font-semibold">Menciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {scheduleData.mentions.map((mention, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm">{mention.time}</span>
                        <span className="text-xs text-muted-foreground">({mention.duration})</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {mention.locutor}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePlayAudio('mention', mention.time)}
                      className="gap-2 flex-shrink-0 ml-2"
                    >
                      <Play className="h-3 w-3" />
                      <span className="hidden sm:inline">Escuchar</span>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
