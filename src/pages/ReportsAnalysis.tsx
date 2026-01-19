import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SaturationCalendar } from "@/components/reports/SaturationCalendar";
import { GenreCompetition } from "@/components/reports/GenreCompetition";
import { OpportunitiesReport } from "@/components/reports/OpportunitiesReport";
import { TemporalMetrics } from "@/components/reports/TemporalMetrics";
import { DateComparison } from "@/components/reports/DateComparison";
import { Calendar, TrendingUp, Lightbulb, BarChart3, GitCompare } from "lucide-react";

const ReportsAnalysis = () => {
  return (
    <DashboardLayout>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Análisis y Recomendaciones</h1>
            <p className="text-muted-foreground">Optimiza la programación de tus eventos</p>
          </div>
        </div>

        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendario</span>
            </TabsTrigger>
            <TabsTrigger value="competition" className="flex items-center gap-2">
              <GitCompare className="h-4 w-4" />
              <span className="hidden sm:inline">Competencia</span>
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Oportunidades</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Métricas</span>
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Comparar</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <SaturationCalendar />
          </TabsContent>

          <TabsContent value="competition">
            <GenreCompetition />
          </TabsContent>

          <TabsContent value="opportunities">
            <OpportunitiesReport />
          </TabsContent>

          <TabsContent value="metrics">
            <TemporalMetrics />
          </TabsContent>

          <TabsContent value="comparison">
            <DateComparison />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ReportsAnalysis;
