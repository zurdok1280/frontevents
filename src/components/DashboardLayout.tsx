import { useState, useMemo, createContext, useContext, useEffect } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DashboardContext = createContext<any>(null);

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error(
      "useDashboardContext debe usarse dentro de DashboardLayout",
    );
  }
  return context;
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  //  ESTADOS DE SELECCIÓN
  const [selectedCountry, setSelectedCountry] = useState("Todos");
  const [selectedCity, setSelectedCity] = useState("Todos");
  const [dateRange, setDateRange] = useState("Todos");
  const [selectedGenre, setSelectedGenre] = useState("todos");
  const [selectedVenue, setSelectedVenue] = useState("todos");
  const [sortBy, setSortBy] = useState("impact");

  //  ESTADOS DE DATOS
  const [listaPaises, setListaPaises] = useState<string[]>([]);
  const [listaCiudades, setListaCiudades] = useState<string[]>([]);
  const [listaVenues, setListaVenues] = useState<string[]>([]);

  // URL Base
  const API_URL = "https://backevent.monitorlatino.com/api/dashboard";
  //const API_URL = "http://localhost:8080/api/dashboard";



  //CARGA DE DATOS

  //Paises y Venues
  useEffect(() => {
    // Cargar Países
    fetch(`${API_URL}/filtros/paises`)
      .then((res) => res.json())
      .then((data) => {
        setListaPaises(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error paises:", err));

    // Venues
    fetch(`${API_URL}/filtros/venues`)
      .then((res) => res.json())
      .then((data) => setListaVenues(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error venues:", err));
  }, []);

  //Si cambia PAIS -> Cargar CIUDADES de ese país
  useEffect(() => {
    setSelectedCity("Todas");
    let url = `${API_URL}/filtros/ciudades`;
    //filtramos si hay un país seleccionado y no es "Todos"
    if (
      selectedCountry &&
      selectedCountry !== "Todos" &&
      selectedCountry !== "Todas"
    ) {
      url += `?pais=${encodeURIComponent(selectedCountry)}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => setListaCiudades(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error ciudades:", err));
  }, [selectedCountry]);

  //Contexto global
  const contextValue = {
    selectedCountry,
    selectedCity,
    dateRange,
    selectedVenue,
    selectedGenre,
    sortBy,
    // Setters
    setSelectedCountry,
    setSelectedCity,
    setDateRange,
    setSelectedGenre,
    setSelectedVenue,
    setSortBy,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      <div className="flex min-h-screen w-full bg-background flex-col">
        {/* PASAMOS LAS LISTAS REALES AL HEADER */}
        <DashboardHeader
          // Valores seleccionados
          selectedCountry={selectedCountry}
          selectedCity={selectedCity}
          dateRange={dateRange}
          selectedGenre={selectedGenre}
          selectedVenue={selectedVenue}
          sortBy={sortBy}
          // Funciones de cambio
          onCountryChange={setSelectedCountry}
          onCityChange={setSelectedCity}
          onDateRangeChange={setDateRange}
          onGenreChange={setSelectedGenre}
          onVenueChange={setSelectedVenue}
          onSortChange={setSortBy}
          countriesList={listaPaises}
          citiesList={listaCiudades}
          venuesList={listaVenues}
        />

        <main className="flex-1 p-0.5 sm:p-1 overflow-auto">{children}</main>

        <footer className="border-t border-border p-0.5 text-center text-xs text-muted-foreground hidden sm:block">
          ©2025
        </footer>
      </div>
    </DashboardContext.Provider>
  );
};
