import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Users, Radio, TrendingUp, Music, Headphones, BarChart3 } from "lucide-react";

interface ArtistData {
  id: string;
  name: string;
  genre: string;
  digitalScore: number;
  radioScore: number;
  streams: string;
  followers: string;
  playlists: number;
  monthlyListeners: string;
  spins: number;
  stations: number;
  trend: "up" | "down" | "stable";
}

// Mock data por país y ciudad
const artistDataByCountryCity: Record<string, Record<string, ArtistData[]>> = {
  "México": {
    "CDMX": [
      { id: "1", name: "Peso Pluma", genre: "Regional", digitalScore: 95, radioScore: 88, streams: "2.8M", followers: "1.2M", playlists: 847, monthlyListeners: "18.5M", spins: 1250, stations: 42, trend: "up" },
      { id: "2", name: "Bad Bunny", genre: "Urbano", digitalScore: 98, radioScore: 72, streams: "4.1M", followers: "2.5M", playlists: 1230, monthlyListeners: "42.3M", spins: 890, stations: 38, trend: "up" },
      { id: "3", name: "Grupo Frontera", genre: "Regional", digitalScore: 87, radioScore: 92, streams: "1.9M", followers: "800K", playlists: 520, monthlyListeners: "12.1M", spins: 1480, stations: 56, trend: "up" },
      { id: "4", name: "Feid", genre: "Urbano", digitalScore: 91, radioScore: 68, streams: "2.3M", followers: "1.1M", playlists: 680, monthlyListeners: "28.7M", spins: 720, stations: 34, trend: "stable" },
      { id: "5", name: "Luis Miguel", genre: "Balada", digitalScore: 78, radioScore: 95, streams: "1.2M", followers: "980K", playlists: 340, monthlyListeners: "8.2M", spins: 1680, stations: 62, trend: "stable" },
      { id: "6", name: "Natanael Cano", genre: "Regional", digitalScore: 89, radioScore: 75, streams: "2.1M", followers: "950K", playlists: 410, monthlyListeners: "15.8M", spins: 920, stations: 40, trend: "up" },
      { id: "7", name: "Karol G", genre: "Urbano", digitalScore: 94, radioScore: 70, streams: "3.2M", followers: "1.8M", playlists: 890, monthlyListeners: "38.5M", spins: 780, stations: 36, trend: "up" },
      { id: "8", name: "Banda MS", genre: "Regional", digitalScore: 72, radioScore: 94, streams: "1.1M", followers: "650K", playlists: 280, monthlyListeners: "6.9M", spins: 1520, stations: 58, trend: "stable" },
    ],
    "Guadalajara": [
      { id: "1", name: "Grupo Firme", genre: "Regional", digitalScore: 88, radioScore: 96, streams: "2.1M", followers: "1.0M", playlists: 620, monthlyListeners: "14.2M", spins: 1720, stations: 64, trend: "up" },
      { id: "2", name: "Christian Nodal", genre: "Regional", digitalScore: 85, radioScore: 93, streams: "1.8M", followers: "920K", playlists: 480, monthlyListeners: "11.8M", spins: 1580, stations: 58, trend: "stable" },
      { id: "3", name: "Peso Pluma", genre: "Regional", digitalScore: 93, radioScore: 85, streams: "2.6M", followers: "1.1M", playlists: 790, monthlyListeners: "18.5M", spins: 1180, stations: 48, trend: "up" },
      { id: "4", name: "Los Bukis", genre: "Balada", digitalScore: 68, radioScore: 91, streams: "890K", followers: "520K", playlists: 210, monthlyListeners: "4.5M", spins: 1420, stations: 55, trend: "stable" },
      { id: "5", name: "Julión Álvarez", genre: "Regional", digitalScore: 71, radioScore: 89, streams: "780K", followers: "480K", playlists: 180, monthlyListeners: "3.8M", spins: 1350, stations: 52, trend: "down" },
      { id: "6", name: "Junior H", genre: "Regional", digitalScore: 86, radioScore: 78, streams: "1.6M", followers: "720K", playlists: 380, monthlyListeners: "10.2M", spins: 1020, stations: 42, trend: "up" },
    ],
    "Monterrey": [
      { id: "1", name: "Grupo Frontera", genre: "Regional", digitalScore: 90, radioScore: 94, streams: "2.2M", followers: "850K", playlists: 560, monthlyListeners: "12.1M", spins: 1620, stations: 60, trend: "up" },
      { id: "2", name: "Peso Pluma", genre: "Regional", digitalScore: 94, radioScore: 87, streams: "2.7M", followers: "1.15M", playlists: 820, monthlyListeners: "18.5M", spins: 1280, stations: 50, trend: "up" },
      { id: "3", name: "Los Tigres del Norte", genre: "Regional", digitalScore: 65, radioScore: 96, streams: "680K", followers: "420K", playlists: 150, monthlyListeners: "5.2M", spins: 1750, stations: 68, trend: "stable" },
      { id: "4", name: "Carín León", genre: "Regional", digitalScore: 88, radioScore: 90, streams: "1.9M", followers: "780K", playlists: 450, monthlyListeners: "13.4M", spins: 1450, stations: 54, trend: "up" },
      { id: "5", name: "Intocable", genre: "Regional", digitalScore: 70, radioScore: 92, streams: "720K", followers: "380K", playlists: 160, monthlyListeners: "4.1M", spins: 1520, stations: 56, trend: "stable" },
      { id: "6", name: "Fuerza Regida", genre: "Regional", digitalScore: 87, radioScore: 76, streams: "1.7M", followers: "680K", playlists: 390, monthlyListeners: "11.9M", spins: 980, stations: 38, trend: "up" },
    ],
  },
  "Colombia": {
    "Bogotá": [
      { id: "1", name: "Shakira", genre: "Pop", digitalScore: 96, radioScore: 85, streams: "3.5M", followers: "2.1M", playlists: 980, monthlyListeners: "52.1M", spins: 1120, stations: 45, trend: "up" },
      { id: "2", name: "Karol G", genre: "Urbano", digitalScore: 95, radioScore: 82, streams: "3.8M", followers: "1.9M", playlists: 920, monthlyListeners: "38.5M", spins: 980, stations: 42, trend: "up" },
      { id: "3", name: "J Balvin", genre: "Urbano", digitalScore: 92, radioScore: 78, streams: "2.9M", followers: "1.5M", playlists: 750, monthlyListeners: "31.2M", spins: 850, stations: 38, trend: "stable" },
      { id: "4", name: "Maluma", genre: "Urbano", digitalScore: 89, radioScore: 80, streams: "2.4M", followers: "1.3M", playlists: 620, monthlyListeners: "25.8M", spins: 920, stations: 40, trend: "stable" },
      { id: "5", name: "Feid", genre: "Urbano", digitalScore: 93, radioScore: 75, streams: "2.8M", followers: "1.2M", playlists: 710, monthlyListeners: "28.7M", spins: 780, stations: 35, trend: "up" },
    ],
    "Medellín": [
      { id: "1", name: "Karol G", genre: "Urbano", digitalScore: 97, radioScore: 88, streams: "4.2M", followers: "2.0M", playlists: 1050, monthlyListeners: "38.5M", spins: 1280, stations: 48, trend: "up" },
      { id: "2", name: "J Balvin", genre: "Urbano", digitalScore: 94, radioScore: 82, streams: "3.1M", followers: "1.6M", playlists: 820, monthlyListeners: "31.2M", spins: 980, stations: 42, trend: "stable" },
      { id: "3", name: "Maluma", genre: "Urbano", digitalScore: 91, radioScore: 85, streams: "2.6M", followers: "1.4M", playlists: 680, monthlyListeners: "25.8M", spins: 1050, stations: 44, trend: "up" },
      { id: "4", name: "Ryan Castro", genre: "Urbano", digitalScore: 85, radioScore: 79, streams: "1.8M", followers: "780K", playlists: 420, monthlyListeners: "12.4M", spins: 850, stations: 36, trend: "up" },
    ],
  },
  "Argentina": {
    "Buenos Aires": [
      { id: "1", name: "Duki", genre: "Urbano", digitalScore: 94, radioScore: 76, streams: "2.9M", followers: "1.4M", playlists: 680, monthlyListeners: "22.1M", spins: 820, stations: 35, trend: "up" },
      { id: "2", name: "Tini", genre: "Pop", digitalScore: 88, radioScore: 82, streams: "2.1M", followers: "1.1M", playlists: 520, monthlyListeners: "15.8M", spins: 980, stations: 42, trend: "stable" },
      { id: "3", name: "Maria Becerra", genre: "Urbano", digitalScore: 91, radioScore: 78, streams: "2.5M", followers: "1.2M", playlists: 610, monthlyListeners: "18.9M", spins: 880, stations: 38, trend: "up" },
      { id: "4", name: "Paulo Londra", genre: "Urbano", digitalScore: 86, radioScore: 72, streams: "1.8M", followers: "950K", playlists: 450, monthlyListeners: "14.2M", spins: 720, stations: 32, trend: "stable" },
      { id: "5", name: "Trueno", genre: "Urbano", digitalScore: 89, radioScore: 68, streams: "2.0M", followers: "980K", playlists: 480, monthlyListeners: "16.5M", spins: 680, stations: 28, trend: "up" },
    ],
  },
};

const genreColors: Record<string, string> = {
  "Urbano": "bg-gradient-to-r from-purple-500 to-pink-500",
  "Regional": "bg-gradient-to-r from-orange-500 to-red-500",
  "Pop": "bg-gradient-to-r from-pink-500 to-purple-500",
  "Rock": "bg-gradient-to-r from-gray-700 to-gray-900",
  "Balada": "bg-gradient-to-r from-rose-500 to-pink-500",
};

const getTrendIcon = (trend: "up" | "down" | "stable") => {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (trend === "down") return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
  return <div className="h-4 w-4 rounded-full bg-muted" />;
};

const countries = Object.keys(artistDataByCountryCity);
const genres = ["Todos", "Urbano", "Regional", "Pop", "Rock", "Balada"];

export const ArtistRecommendation = () => {
  const [selectedCountry, setSelectedCountry] = useState("México");
  const [selectedCity, setSelectedCity] = useState("CDMX");
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [sortMode, setSortMode] = useState<"combined" | "digital" | "radio">("combined");

  const cities = useMemo(() => {
    return Object.keys(artistDataByCountryCity[selectedCountry] || {});
  }, [selectedCountry]);

  // Reset city when country changes
  useMemo(() => {
    const availableCities = Object.keys(artistDataByCountryCity[selectedCountry] || {});
    if (!availableCities.includes(selectedCity)) {
      setSelectedCity(availableCities[0] || "");
    }
  }, [selectedCountry]);

  const artists = useMemo(() => {
    const countryData = artistDataByCountryCity[selectedCountry] || {};
    const data = countryData[selectedCity] || [];
    
    // Filter by genre
    const filtered = selectedGenre === "Todos" 
      ? data 
      : data.filter(a => a.genre === selectedGenre);
    
    return [...filtered].sort((a, b) => {
      if (sortMode === "digital") return b.digitalScore - a.digitalScore;
      if (sortMode === "radio") return b.radioScore - a.radioScore;
      const combinedA = (a.digitalScore * 0.5) + (a.radioScore * 0.5);
      const combinedB = (b.digitalScore * 0.5) + (b.radioScore * 0.5);
      return combinedB - combinedA;
    });
  }, [selectedCountry, selectedCity, selectedGenre, sortMode]);

  const getCombinedScore = (artist: ArtistData) => {
    return Math.round((artist.digitalScore * 0.5) + (artist.radioScore * 0.5));
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Recomendación de Artistas
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Artistas con mayor potencial por plaza basado en datos digitales y radio
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="País" />
              </SelectTrigger>
              <SelectContent className="bg-background border">
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Ciudad" />
              </SelectTrigger>
              <SelectContent className="bg-background border">
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Género" />
              </SelectTrigger>
              <SelectContent className="bg-background border">
                {genres.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-4">
        <Tabs value={sortMode} onValueChange={(v) => setSortMode(v as typeof sortMode)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="combined" className="text-xs sm:text-sm flex items-center gap-1">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              Combinado
            </TabsTrigger>
            <TabsTrigger value="digital" className="text-xs sm:text-sm flex items-center gap-1">
              <Headphones className="h-3 w-3 sm:h-4 sm:w-4" />
              Digital
            </TabsTrigger>
            <TabsTrigger value="radio" className="text-xs sm:text-sm flex items-center gap-1">
              <Radio className="h-3 w-3 sm:h-4 sm:w-4" />
              Radio
            </TabsTrigger>
          </TabsList>

          <TabsContent value={sortMode} className="space-y-3">
            {artists.map((artist, index) => (
              <div 
                key={artist.id}
                className="group p-4 rounded-xl border bg-card hover:bg-muted/50 transition-all animate-fade-in cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Ranking */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-md">
                      {index + 1}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground truncate">{artist.name}</h3>
                      <Badge className={`${genreColors[artist.genre] || "bg-muted"} text-white border-0 text-xs`}>
                        {artist.genre}
                      </Badge>
                      {getTrendIcon(artist.trend)}
                    </div>

                    {/* Score Principal */}
                    <div className="mb-3">
                      {sortMode === "combined" && (
                        <div className="flex items-center gap-3">
                          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            {getCombinedScore(artist)}
                          </div>
                          <div className="flex-1">
                            <Progress value={getCombinedScore(artist)} className="h-2" />
                          </div>
                        </div>
                      )}
                      {sortMode === "digital" && (
                        <div className="flex items-center gap-3">
                          <div className="text-2xl font-bold text-blue-500">
                            {artist.digitalScore}
                          </div>
                          <div className="flex-1">
                            <Progress value={artist.digitalScore} className="h-2 [&>div]:bg-blue-500" />
                          </div>
                        </div>
                      )}
                      {sortMode === "radio" && (
                        <div className="flex items-center gap-3">
                          <div className="text-2xl font-bold text-orange-500">
                            {artist.radioScore}
                          </div>
                          <div className="flex-1">
                            <Progress value={artist.radioScore} className="h-2 [&>div]:bg-orange-500" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Métricas detalladas */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Digital */}
                      <div className="space-y-1.5 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                          <Headphones className="h-3 w-3" />
                          Digital
                          <span className="ml-auto font-bold">{artist.digitalScore}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <div className="text-muted-foreground">Oyentes/mes</div>
                            <div className="font-semibold text-foreground">{artist.monthlyListeners}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Playlists</div>
                            <div className="font-semibold text-foreground">{artist.playlists}</div>
                          </div>
                        </div>
                      </div>

                      {/* Radio */}
                      <div className="space-y-1.5 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <div className="flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400">
                          <Radio className="h-3 w-3" />
                          Radio
                          <span className="ml-auto font-bold">{artist.radioScore}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div>
                            <div className="text-muted-foreground">Spins</div>
                            <div className="font-semibold text-foreground">{artist.spins.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Estaciones</div>
                            <div className="font-semibold text-foreground">{artist.stations}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
