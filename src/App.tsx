import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import EventDetail from "./pages/EventDetail";
import StationSchedule from "./pages/StationSchedule";
import RadioDetail from "./pages/RadioDetail";
import ReportsAnalysis from "./pages/ReportsAnalysis";
import NotFound from "./pages/NotFound";
import { LatestMentionsPerArtist } from "./components/dashboard/LatestMentionsPerArtist";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/reports" element={<ReportsAnalysis />} />
          <Route path="/event/:eventId" element={<EventDetail />} />
          <Route path="/event/:eventId/station/:stationName" element={<StationSchedule />} />
          <Route path="/event/:eventId/radio/:radioStation" element={<RadioDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          {/* OTHER ROUTES */}
          <Route path="artist/:artistName" element={<LatestMentionsPerArtist />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
