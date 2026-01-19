import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Mock data - in real app would fetch based on eventId and radioStation
const songData = [
  { song: "Monaco", spins: 52, position: 2, image: "https://images.unsplash.com/photo-1619983081563-430f63602796?w=200&h=200&fit=crop" },
  { song: "Un x100to", spins: 48, position: 3, image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop" },
  { song: "Where She Goes", spins: 38, position: 7, image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop" },
  { song: "Tití Me Preguntó", spins: 29, position: 12, image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=200&h=200&fit=crop" },
  { song: "Callaita", spins: 20, position: 18, image: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=200&h=200&fit=crop" },
].sort((a, b) => b.spins - a.spins);

const eventDetails = {
  name: "Bad Bunny - Most Wanted Tour",
  artist: "Bad Bunny",
};

export default function RadioDetail() {
  const { eventId, radioStation } = useParams();
  const navigate = useNavigate();
  const decodedStation = decodeURIComponent(radioStation || "");

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
              Desglose de canciones - {eventDetails.artist}
            </p>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="grid gap-3 md:hidden">
          {songData.map((song) => (
            <Card key={song.song} className="bg-card border-border overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 p-4">
                  <img 
                    src={song.image} 
                    alt={song.song}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate">{song.song}</h3>
                    <div className="text-sm mt-1">
                      <span className="text-muted-foreground">Spins: </span>
                      <span className="font-semibold text-primary">{song.spins}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-3">
                    <div className="text-xs text-muted-foreground text-right mb-1">Posición</div>
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                      {song.position}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop Table */}
        <Card className="bg-card border-border hidden md:block">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Canciones de {eventDetails.artist} en {decodedStation}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Posición en Radio</TableHead>
                    <TableHead>Canción</TableHead>
                    <TableHead className="text-right">Spins</TableHead>
                  </TableRow>
                </TableHeader>
                    <TableBody>
                      {songData.map((song) => (
                        <TableRow key={song.song} className="border-border hover:bg-muted/30">
                          <TableCell>
                            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg">
                              {song.position}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium text-base">
                            <div className="flex items-center gap-3">
                              <img 
                                src={song.image} 
                                alt={song.song}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <span>{song.song}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-xl font-semibold text-primary">
                              {song.spins}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
