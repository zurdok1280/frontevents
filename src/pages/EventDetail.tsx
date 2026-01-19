import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, TrendingUp, TrendingDown, ArrowRight, Hash, Users, ExternalLink } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { 
  buzzEvents, 
  generateWeeklyMentions, 
  calculateBuzzScore, 
  calculateGrowth, 
  generateHashtags,
  generateInfluencers,
  generateAnnotations,
  type BuzzEvent
} from "@/lib/digitalBuzzData";

// Mock data - in real app would fetch based on eventId
const eventDetails = {
  name: "Bad Bunny - Most Wanted Tour",
  artist: "Bad Bunny",
  city: "CDMX",
  date: "15 Nov",
  venue: "Foro Sol",
};

const advertisingData = [
  { station: "Los 40 (99.3 FM)", totalAds: 68, mentions: 45 },
  { station: "Ke Buena (92.9 FM)", totalAds: 52, mentions: 38 },
  { station: "La Z (107.3 FM)", totalAds: 48, mentions: 32 },
  { station: "Exa FM (104.9 FM)", totalAds: 41, mentions: 28 },
];

const musicCatalog = [
  { song: "Monaco", rank: 8, image: "https://images.unsplash.com/photo-1619983081563-430f63602796?w=200&h=200&fit=crop" },
  { song: "Un x100to", rank: 23, image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop" },
  { song: "Where She Goes", rank: 45, image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop" },
  { song: "Tití Me Preguntó", rank: 67, image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=200&h=200&fit=crop" },
  { song: "Callaita", rank: 124, image: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=200&h=200&fit=crop" },
].sort((a, b) => a.rank - b.rank);

const radioData = [
  { station: "Los 40 (99.3 FM)", totalSpins: 187 },
  { station: "Ke Buena (92.9 FM)", totalSpins: 142 },
  { station: "La Z (107.3 FM)", totalSpins: 98 },
  { station: "Exa FM (104.9 FM)", totalSpins: 76 },
].sort((a, b) => b.totalSpins - a.totalSpins);

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("publicidad");
  const [comparisonEvents, setComparisonEvents] = useState<string[]>([]);
  const [weeksRange, setWeeksRange] = useState<4 | 8 | 12>(12);

  // Calcular datos de buzz para el evento actual
  const currentEventBuzz = useMemo(() => {
    const event = buzzEvents.find(e => e.id === eventId);
    if (!event) return null;
    
    const mentions = generateWeeklyMentions(event);
    const buzzScore = calculateBuzzScore(event, mentions);
    const growth = calculateGrowth(mentions);
    const hashtags = generateHashtags(event);
    const influencers = generateInfluencers(event);
    const annotations = generateAnnotations(event);
    
    return {
      ...event,
      mentions,
      buzzScore,
      growth,
      hashtags,
      influencers,
      annotations
    };
  }, [eventId]);

  // Obtener todos los eventos con sus datos para comparación
  const allEventsBuzz = useMemo(() => {
    return buzzEvents.map(event => {
      const mentions = generateWeeklyMentions(event);
      const buzzScore = calculateBuzzScore(event, mentions);
      const growth = calculateGrowth(mentions);
      const hashtags = generateHashtags(event);
      
      return {
        ...event,
        mentions,
        buzzScore,
        growth,
        hashtags
      };
    });
  }, []);

  // Influencers sugeridos (que NO están promocionando este evento)
  const suggestedInfluencers = useMemo(() => {
    if (!currentEventBuzz) return [];
    
    // Obtener influencers de eventos similares (mismo género)
    const similarEvents = buzzEvents.filter(
      e => e.genero === currentEventBuzz.genero && e.id !== currentEventBuzz.id
    );
    
    const otherInfluencers = similarEvents.flatMap(e => generateInfluencers(e));
    
    // Tomar los top 3 por engagement
    return otherInfluencers
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 3);
  }, [currentEventBuzz]);

  // Datos de tendencias para comparación
  const trendData = useMemo(() => {
    if (!currentEventBuzz) return [];
    
    const selectedEvents = comparisonEvents.length > 0 
      ? allEventsBuzz.filter(e => [currentEventBuzz.id, ...comparisonEvents].includes(e.id))
      : [currentEventBuzz];
    
    const weeks = Array.from({ length: weeksRange }, (_, i) => `W-${weeksRange - i}`);
    
    return weeks.map((week, idx) => {
      const dataPoint: any = { week };
      
      selectedEvents.forEach(event => {
        const mentions = event.mentions[12 - weeksRange + idx] || 0;
        const maxMentions = Math.max(...event.mentions);
        const normalized = maxMentions > 0 ? (mentions / maxMentions) * 100 : 0;
        dataPoint[event.id] = Math.round(normalized);
      });
      
      return dataPoint;
    });
  }, [currentEventBuzz, comparisonEvents, allEventsBuzz, weeksRange]);

  const genreColors: Record<string, string> = {
    "Pop/Urbano": "bg-gradient-to-r from-purple-500 to-pink-500",
    "Regional": "bg-gradient-to-r from-orange-500 to-red-500",
    "Anglo": "bg-gradient-to-r from-blue-500 to-cyan-500"
  };

  if (!currentEventBuzz) {
    return (
      <DashboardLayout>
        <div className="p-4">
          <p>Evento no encontrado</p>
        </div>
      </DashboardLayout>
    );
  }

  const lastWeekMentions = currentEventBuzz.mentions[currentEventBuzz.mentions.length - 1];

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/")}
            className="gap-2 w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver</span>
          </Button>
          <div>
            <h1 className="text-xl md:text-3xl font-bold">{eventDetails.name}</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              {eventDetails.artist} • {eventDetails.city} • {eventDetails.date}
            </p>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {eventDetails.venue}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-card border border-border">
            <TabsTrigger 
              value="publicidad" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Publicidad</span>
              <span className="sm:hidden">Ads</span>
            </TabsTrigger>
            <TabsTrigger 
              value="catalogo" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
            >
              Rank Digital
            </TabsTrigger>
            <TabsTrigger 
              value="radios" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
            >
              Spins Radios
            </TabsTrigger>
            <TabsTrigger 
              value="buzzscore" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
            >
              Buzz Score
            </TabsTrigger>
            <TabsTrigger 
              value="influencers" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
            >
              Influencers
            </TabsTrigger>
            <TabsTrigger 
              value="tendencia" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
            >
              Tendencia
            </TabsTrigger>
          </TabsList>

          <TabsContent value="publicidad" className="mt-4 md:mt-6">
            {/* Mobile Cards */}
            <div className="grid gap-3 md:hidden">
              {advertisingData.map((station) => (
                <Card 
                  key={station.station} 
                  className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => navigate(`/event/${eventId}/station/${encodeURIComponent(station.station)}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{station.station}</h3>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Total Ads:</span>
                        <span className="ml-1 font-medium">{station.totalAds}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Menciones:</span>
                        <span className="ml-1 font-medium">{station.mentions}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop Table */}
            <Card className="bg-card border-border hidden md:block">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Estaciones - Publicidad y Menciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead>Estación</TableHead>
                        <TableHead className="text-right">Total Ads</TableHead>
                        <TableHead className="text-right">Menciones</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {advertisingData.map((station) => (
                        <TableRow 
                          key={station.station} 
                          className="border-border hover:bg-muted/30 cursor-pointer transition-colors"
                          onClick={() => navigate(`/event/${eventId}/station/${encodeURIComponent(station.station)}`)}
                        >
                          <TableCell className="font-medium">{station.station}</TableCell>
                          <TableCell className="text-right">{station.totalAds}</TableCell>
                          <TableCell className="text-right">{station.mentions}</TableCell>
                          <TableCell className="text-right">
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="catalogo" className="mt-4 md:mt-6">
            {/* Mobile Cards */}
            <div className="grid gap-3 md:hidden">
              {musicCatalog.map((track) => (
                <Card key={track.song} className="bg-card border-border overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3 p-4">
                      <img 
                        src={track.image} 
                        alt={track.song}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate">{track.song}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {eventDetails.city}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-xs text-muted-foreground mb-1">Rank</div>
                        <div className="text-xl font-bold text-primary">
                          #{track.rank.toLocaleString()}
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
                <CardTitle className="text-xl font-semibold">Ranking Digital en {eventDetails.city}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead>Canción</TableHead>
                        <TableHead className="text-right">Ranking Digital</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {musicCatalog.map((track) => (
                        <TableRow key={track.song} className="border-border hover:bg-muted/30">
                          <TableCell className="font-medium text-base">
                            <div className="flex items-center gap-3">
                              <img 
                                src={track.image} 
                                alt={track.song}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <span>{track.song}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-2xl font-bold text-primary">
                              #{track.rank.toLocaleString()}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="radios" className="mt-4 md:mt-6">
            {/* Mobile Cards */}
            <div className="grid gap-3 md:hidden">
              {radioData.map((radio) => (
                <Card 
                  key={radio.station} 
                  className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => navigate(`/event/${eventId}/radio/${encodeURIComponent(radio.station)}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base">{radio.station}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Total Spins: {radio.totalSpins}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop Table */}
            <Card className="bg-card border-border hidden md:block">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Radios - {eventDetails.city}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead>Estación</TableHead>
                        <TableHead className="text-right">Total Spins</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {radioData.map((radio) => (
                        <TableRow 
                          key={radio.station} 
                          className="border-border hover:bg-muted/30 cursor-pointer transition-colors"
                          onClick={() => navigate(`/event/${eventId}/radio/${encodeURIComponent(radio.station)}`)}
                        >
                          <TableCell className="font-medium text-base">{radio.station}</TableCell>
                          <TableCell className="text-right">
                            <span className="text-lg font-semibold text-primary">
                              {radio.totalSpins}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nueva Tab: Buzz Score */}
          <TabsContent value="buzzscore" className="mt-4 md:mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Buzz Score - {currentEventBuzz.evento}
                </CardTitle>
                <CardDescription>Métricas de menciones orgánicas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Menciones (última semana)</div>
                    <div className="text-2xl font-bold">{lastWeekMentions.toLocaleString()}</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Crecimiento</div>
                    <div className="flex items-center gap-2">
                      {currentEventBuzz.growth >= 0 ? (
                        <TrendingUp className="h-5 w-5 text-success" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-destructive" />
                      )}
                      <span className={`text-2xl font-bold ${currentEventBuzz.growth >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {currentEventBuzz.growth}%
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Buzz Score</div>
                    <Badge className={`${genreColors[currentEventBuzz.genero]} text-white border-0 text-xl px-3 py-1`}>
                      {currentEventBuzz.buzzScore}/100
                    </Badge>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Top Hashtag</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Hash className="h-4 w-4" />
                      <span className="text-sm font-medium">{currentEventBuzz.hashtags.primary}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-3">Hashtags Relacionados</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Hash className="h-3 w-3 mr-1" />
                      {currentEventBuzz.hashtags.primary}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Hash className="h-3 w-3 mr-1" />
                      {currentEventBuzz.hashtags.secondary}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nueva Tab: Top Influencers */}
          <TabsContent value="influencers" className="mt-4 md:mt-6">
            <div className="space-y-4">
              {/* Influencers actuales */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-secondary" />
                    Influencers Activos
                  </CardTitle>
                  <CardDescription>
                    Personas e influencers que están promocionando este evento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentEventBuzz.influencers.map((influencer, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                        <img 
                          src={influencer.avatar} 
                          alt={influencer.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{influencer.name}</span>
                            <Badge variant="outline" className="text-xs">{influencer.platform}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{influencer.handle}</p>
                          <p className="text-xs line-clamp-2 mb-2">{influencer.postPreview}</p>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-muted-foreground">{influencer.mentions} menciones</span>
                            <span className="text-muted-foreground">{influencer.engagement.toLocaleString()} engagement</span>
                            <span className={influencer.sentiment >= 0.7 ? 'text-success' : 'text-warning'}>
                              {Math.round(influencer.sentiment * 100)}% positivo
                            </span>
                          </div>
                        </div>
                        <a href={influencer.postUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Influencers sugeridos */}
              <Card className="bg-card border-border border-dashed">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-warning" />
                    Influencers Sugeridos
                  </CardTitle>
                  <CardDescription>
                    Descubre influencers que no te están promocionando pero que generalmente promocionan eventos similares
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {suggestedInfluencers.map((influencer, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-warning/30 bg-warning/5 hover:bg-warning/10 transition-colors">
                        <img 
                          src={influencer.avatar} 
                          alt={influencer.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{influencer.name}</span>
                            <Badge variant="outline" className="text-xs border-warning text-warning">
                              {influencer.platform}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Sugerido
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{influencer.handle}</p>
                          <p className="text-xs mb-2">Engagement promedio: {influencer.engagement.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            Promociona regularmente eventos de {currentEventBuzz.genero}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Nueva Tab: Tendencia de Buzz */}
          <TabsContent value="tendencia" className="mt-4 md:mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-info" />
                    Tendencia de Buzz (0-100)
                  </CardTitle>
                  <Select value={weeksRange.toString()} onValueChange={(v) => setWeeksRange(parseInt(v) as 4 | 8 | 12)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 semanas</SelectItem>
                      <SelectItem value="8">8 semanas</SelectItem>
                      <SelectItem value="12">12 semanas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CardDescription>
                  Índice normalizado por el máximo de cada evento
                  {comparisonEvents.length > 0 && ` - Comparando ${comparisonEvents.length + 1} eventos`}
                </CardDescription>
                
                {comparisonEvents.length === 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium mb-2">Agregar eventos para comparar:</p>
                    <div className="flex flex-wrap gap-2">
                      {allEventsBuzz
                        .filter(e => e.ciudad === currentEventBuzz.ciudad && e.id !== currentEventBuzz.id)
                        .slice(0, 3)
                        .map(event => (
                          <Badge 
                            key={event.id}
                            variant="outline"
                            className="cursor-pointer hover:bg-primary/10"
                            onClick={() => setComparisonEvents([...comparisonEvents, event.id])}
                          >
                            + {event.artista}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
                
                {comparisonEvents.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge className={`${genreColors[currentEventBuzz.genero]} text-white`}>
                      {currentEventBuzz.artista} (actual)
                    </Badge>
                    {comparisonEvents.map(eventId => {
                      const event = allEventsBuzz.find(e => e.id === eventId);
                      if (!event) return null;
                      return (
                        <Badge 
                          key={eventId}
                          className={`${genreColors[event.genero]} text-white cursor-pointer`}
                          onClick={() => setComparisonEvents(comparisonEvents.filter(id => id !== eventId))}
                        >
                          {event.artista} ×
                        </Badge>
                      );
                    })}
                    <Badge 
                      variant="outline"
                      className="cursor-pointer hover:bg-destructive/10"
                      onClick={() => setComparisonEvents([])}
                    >
                      Limpiar
                    </Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 100]} />
                    <RechartsTooltip />
                    
                    {/* Línea del evento actual */}
                    <Line 
                      type="monotone" 
                      dataKey={currentEventBuzz.id}
                      name={currentEventBuzz.artista}
                      stroke="hsl(48, 100%, 50%)" 
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                    
                    {/* Anotaciones solo si no hay comparación */}
                    {comparisonEvents.length === 0 && currentEventBuzz.annotations.map((annotation, idx) => (
                      <ReferenceLine 
                        key={idx}
                        x={`W-${annotation.week}`} 
                        stroke="hsl(195, 100%, 40%)"
                        strokeDasharray="3 3"
                        label={{ value: annotation.label, position: 'top', fontSize: 10 }}
                      />
                    ))}
                    
                    {/* Líneas de comparación */}
                    {comparisonEvents.map((eventId, idx) => {
                      const event = allEventsBuzz.find(e => e.id === eventId);
                      if (!event) return null;
                      
                      const colors = ['hsl(195, 100%, 40%)', 'hsl(280, 100%, 65%)', 'hsl(120, 100%, 40%)'];
                      return (
                        <Line 
                          key={eventId}
                          type="monotone" 
                          dataKey={eventId}
                          name={event.artista}
                          stroke={colors[idx % colors.length]}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
