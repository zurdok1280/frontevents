import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";

const alerts = [
  {
    type: "error",
    title: "Pacing bajo en 2 estaciones",
    description: "Evento: Banda Estelar – CDMX. La Buena y Urban Beat están por debajo del 85% de pacing.",
    icon: AlertCircle,
    color: "destructive",
  },
  {
    type: "warning",
    title: "Riesgo de burnout",
    description: 'Canción "Hit Verano" en Estación FM 99.5 con 320 spins/día. Considerar reducción gradual.',
    icon: AlertTriangle,
    color: "warning",
  },
  {
    type: "success",
    title: "Crecimiento acelerado",
    description: "Streams locales de Urbano Flow +20% en última semana. Recomendar aumentar inversión.",
    icon: CheckCircle,
    color: "success",
  },
  {
    type: "warning",
    title: "Bajo rendimiento digital",
    description: "Balada Romántica con crecimiento de playlist adds menor al esperado (+3% vs +10% objetivo).",
    icon: AlertTriangle,
    color: "warning",
  },
  {
    type: "success",
    title: "Cumplimiento óptimo",
    description: "FM 99.5 y Radio Digital con delivery >90% y sin desviaciones significativas en CPM.",
    icon: CheckCircle,
    color: "success",
  },
];

const getAlertStyles = (color: string) => {
  switch (color) {
    case "destructive":
      return "bg-destructive/10 border-destructive/20 text-destructive";
    case "warning":
      return "bg-warning/10 border-warning/20 text-warning";
    case "success":
      return "bg-success/10 border-success/20 text-success";
    default:
      return "bg-muted border-border";
  }
};

export const Alerts = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">Alertas y Recomendaciones</CardTitle>
          <Button variant="default" className="gap-2">
            Ver plan sugerido
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getAlertStyles(alert.color)} transition-colors hover:opacity-80`}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <alert.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold">{alert.title}</h4>
                    <p className="text-sm opacity-90">{alert.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">Alertas críticas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-warning/10">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">Advertencias</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">Oportunidades</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
