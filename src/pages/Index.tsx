import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { EventsRanking } from "@/components/dashboard/EventsRanking";
import { ArtistRecommendation } from "@/components/dashboard/ArtistRecommendation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, FileText } from "lucide-react";
import { LatestMentions } from "@/components/dashboard/LatestMentions";
import { ArtistRanking } from "@/components/dashboard/ArtistRanking";
import Reportes  from "@/components/Reportes";

const Index = () => {
  const [activeTab, setActiveTab] = useState("eventos");

  return (
    <DashboardLayout>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-3xl grid-cols-4 mb-6">
          <TabsTrigger value="eventos" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Ranking de Eventos
          </TabsTrigger>
          <TabsTrigger value="artistas" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Ranking de Artistas
          </TabsTrigger>
          {/*<TabsTrigger value="artistas" className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Recomendación de Artistas
          </TabsTrigger>*/}
          <TabsTrigger value="menciones" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-5" />
            Ultimas Menciones
          </TabsTrigger>
          <TabsTrigger 
            value="reportes" 
            className="flex items-center gap-2 "
          >
            <FileText className="h-4 w-4" />
            Generar Reportes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="menciones">
          <LatestMentions />
        </TabsContent>

        <TabsContent value="eventos">
          <EventsRanking />
        </TabsContent>

        <TabsContent value="artistas">
          {/*<ArtistRecommendation />*/}
          <ArtistRanking />
        </TabsContent>
        <TabsContent value="reportes" className="animate-in fade-in-50 duration-300">
          <Reportes /> 
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Index;
