import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import LoginIcon from "@mui/icons-material/Login";
import { LoginButton } from "./login/LoginButton";

interface DashboardHeaderProps {
  selectedCountry: string;
  selectedCity: string;
  dateRange: string;
  selectedGenre: string;
  selectedVenue: string;
  sortBy: string;
  onCountryChange: (country: string) => void;
  onCityChange: (city: string) => void;
  onDateRangeChange: (range: string) => void;
  onGenreChange: (genre: string) => void;
  onVenueChange: (venue: string) => void;
  onSortChange: (sort: string) => void;

  // --- NUEVAS PROPS (Opcionales para que no truene si faltan) ---
  countriesList?: string[];
  citiesList?: string[];
  venuesList?: string[];
}

// Listas de respaldo (Fallback) por si la API falla o tarda en cargar
const defaultCountries = [
  "México",
  "Estados Unidos",
  "Colombia",
  "Argentina",
  "Chile",
];
const defaultDateRanges = [
  "Todos",
  "Últimos 7 días",
  "Últimos 14 días",
  "Últimos 30 días",
  "Este mes",
  "Mes anterior",
];

export const DashboardHeader = ({
  selectedCountry,
  selectedCity,
  dateRange,
  selectedGenre,
  selectedVenue,
  sortBy,
  onCountryChange,
  onCityChange,
  onDateRangeChange,
  onGenreChange,
  onVenueChange,
  onSortChange,
  // Recibimos las listas dinámicas
  countriesList = [],
  citiesList = [],
  venuesList = [],
}: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isReportsPage = location.pathname === "/reports";

  const countriesDisplay =
    countriesList.length > 0 ? countriesList : defaultCountries;

  const citiesDisplay = citiesList;

  //Venues
  const venuesDisplay = venuesList.length > 0 ? venuesList : ["todos"];

  return (
    <header className="border-b border-border bg-card sticky top-0 z-10">
      <div className="flex items-center justify-between p-1 sm:p-2">
        {/* Logo and Title Section */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <img src={logo} alt="MonitorLatino" className="h-8 sm:h-12 w-auto" />
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-2xl font-bold text-foreground leading-tight">
              Concert Insights
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Dashboard
            </p>
          </div>
          <Button
            variant={isReportsPage ? "default" : "outline"}
            size="sm"
            onClick={() => navigate(isReportsPage ? "/" : "/reports")}
            className="flex items-center gap-1 ml-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isReportsPage ? "Eventos" : "Análisis"}
            </span>
          </Button>
        </div>

        {/* Filters and Login */}
        <div className="flex items-center gap-2">
          {/* All Filters in one line */}
          <div className="flex gap-1 items-center flex-shrink-0">
            {/* PAÍS */}
            <Select value={selectedCountry} onValueChange={onCountryChange}>
              <SelectTrigger className="bg-background border-border h-6 text-xs w-16 sm:w-24">
                <SelectValue placeholder="País" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                {countriesDisplay.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* CIUDAD */}
            <Select value={selectedCity} onValueChange={onCityChange}>
              <SelectTrigger className="bg-background border-border h-6 text-xs w-16 sm:w-24">
                <SelectValue placeholder="Ciudad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todas</SelectItem>
                {citiesDisplay.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* RANGO DE FECHAS */}
            <Select value={dateRange} onValueChange={onDateRangeChange}>
              <SelectTrigger className="bg-background border-border h-6 text-xs w-20 sm:w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {defaultDateRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* GÉNERO (Este se mantiene estático por ahora) */}
            <Select value={selectedGenre} onValueChange={onGenreChange}>
              <SelectTrigger className="bg-background border-border h-6 text-xs w-20 sm:w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Urbano">Urbano</SelectItem>
                <SelectItem value="Regional">Regional</SelectItem>
                <SelectItem value="Pop">Pop</SelectItem>
                <SelectItem value="Rock">Rock</SelectItem>
                <SelectItem value="Balada">Balada</SelectItem>
                <SelectItem value="Clásica">Clásica</SelectItem>
              </SelectContent>
            </Select>

            {/* VENUE */}
            <Select value={selectedVenue} onValueChange={onVenueChange}>
              <SelectTrigger className="bg-background border-border h-6 text-xs w-20 sm:w-28">
                <SelectValue placeholder="Venue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {venuesDisplay.map((venue) => (
                  <SelectItem key={venue} value={venue}>
                    {venue === "todos" ? "Todos" : venue}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* ORDENAR POR */}
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="bg-background border-border h-6 text-xs w-20 sm:w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="impact">Impacto</SelectItem>
                <SelectItem value="date">Fecha</SelectItem>
                <SelectItem value="capacity">Capacidad</SelectItem>
                <SelectItem value="spots">Spots</SelectItem>
                <SelectItem value="mentions">Menciones</SelectItem>
                <SelectItem value="total">Total</SelectItem>
                <SelectItem value="reach">Alcance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Login Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 flex items-center justify-center"
            onClick={() => console.log("Abrir componente de login")}
          >
            <LoginButton />
          </Button>
        </div>
      </div>
    </header>
  );
};
