import { useState, ReactElement, cloneElement } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [selectedCountry, setSelectedCountry] = useState("México");
  const [selectedCity, setSelectedCity] = useState("CDMX");
  const [dateRange, setDateRange] = useState("Últimos 7 días");
  const [selectedGenre, setSelectedGenre] = useState("todos");
  const [selectedVenue, setSelectedVenue] = useState("todos");
  const [sortBy, setSortBy] = useState("impact");

  // Only pass filters to Index page (EventsRanking), not to other pages
  const shouldPassFilters = typeof children === 'object' && children !== null && 'type' in children;
  
  const childrenWithProps = shouldPassFilters
    ? cloneElement(children as ReactElement, {
        selectedCountry,
        selectedCity,
        dateRange,
        selectedGenre,
        selectedVenue,
        sortBy,
      })
    : children;

  return (
    <div className="flex min-h-screen w-full bg-background flex-col">
      <DashboardHeader 
        selectedCountry={selectedCountry}
        selectedCity={selectedCity}
        dateRange={dateRange}
        selectedGenre={selectedGenre}
        selectedVenue={selectedVenue}
        sortBy={sortBy}
        onCountryChange={setSelectedCountry}
        onCityChange={setSelectedCity}
        onDateRangeChange={setDateRange}
        onGenreChange={setSelectedGenre}
        onVenueChange={setSelectedVenue}
        onSortChange={setSortBy}
      />
      <main className="flex-1 p-0.5 sm:p-1 overflow-auto">
        {childrenWithProps}
      </main>
      <footer className="border-t border-border p-0.5 text-center text-xs text-muted-foreground hidden sm:block">
        ©2025
      </footer>
    </div>
  );
};
