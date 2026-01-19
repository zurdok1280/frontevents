// Utilidades para generar datos simulados de Digital Buzz

export interface BuzzEvent {
  id: string;
  evento: string;
  artista: string;
  genero: string;
  ciudad: string;
  venue: string;
  fecha: string;
  capacidad: number;
  radio_spots: number;
  radio_menciones: number;
  radio_total: number;
  alcance: string;
}

export const buzzEvents: BuzzEvent[] = [
  {id:"badbunny-cdmx-2025-11-15",evento:"Bad Bunny - Most Wanted Tour",artista:"Bad Bunny",genero:"Pop/Urbano",ciudad:"CDMX",venue:"Foro Sol",fecha:"2025-11-15",capacidad:65000,radio_spots:420,radio_menciones:156,radio_total:576,alcance:"2.8M"},
  {id:"pesopluma-gdl-2025-11-22",evento:"Peso Pluma - Éxodo Tour",artista:"Peso Pluma",genero:"Regional",ciudad:"Guadalajara",venue:"Estadio Akron",fecha:"2025-11-22",capacidad:48071,radio_spots:385,radio_menciones:142,radio_total:527,alcance:"2.1M"},
  {id:"karolg-mty-2025-11-28",evento:"Karol G - Mañana Será Bonito Tour",artista:"Karol G",genero:"Pop/Urbano",ciudad:"Monterrey",venue:"Estadio BBVA",fecha:"2025-11-28",capacidad:53500,radio_spots:310,radio_menciones:118,radio_total:428,alcance:"1.9M"},
  {id:"taylorswift-cdmx-2025-12-12",evento:"Taylor Swift - The Eras Tour",artista:"Taylor Swift",genero:"Anglo",ciudad:"CDMX",venue:"Foro Sol",fecha:"2025-12-12",capacidad:65000,radio_spots:298,radio_menciones:95,radio_total:393,alcance:"1.8M"},
  {id:"frontera-cdmx-2025-12-05",evento:"Grupo Frontera en Vivo",artista:"Grupo Frontera",genero:"Regional",ciudad:"CDMX",venue:"Auditorio Nacional",fecha:"2025-12-05",capacidad:10000,radio_spots:245,radio_menciones:89,radio_total:334,alcance:"1.4M"},
  {id:"feid-pue-2025-12-18",evento:"Feid - Mor Tour",artista:"Feid",genero:"Pop/Urbano",ciudad:"Puebla",venue:"Estadio Cuauhtémoc",fecha:"2025-12-18",capacidad:42648,radio_spots:218,radio_menciones:76,radio_total:294,alcance:"1.2M"},
  {id:"bandams-gdl-2025-12-20",evento:"Banda MS en Concierto",artista:"Banda MS",genero:"Regional",ciudad:"Guadalajara",venue:"Arena VFG",fecha:"2025-12-20",capacidad:11000,radio_spots:195,radio_menciones:68,radio_total:263,alcance:"1.1M"},
  {id:"coldplay-cdmx-2025-12-27",evento:"Coldplay - Music of Spheres",artista:"Coldplay",genero:"Anglo",ciudad:"CDMX",venue:"Foro Sol",fecha:"2025-12-27",capacidad:65000,radio_spots:182,radio_menciones:71,radio_total:253,alcance:"1.5M"},
  {id:"natanael-mty-2026-01-03",evento:"Natanael Cano en Vivo",artista:"Natanael Cano",genero:"Regional",ciudad:"Monterrey",venue:"Arena Monterrey",fecha:"2026-01-03",capacidad:17000,radio_spots:168,radio_menciones:59,radio_total:227,alcance:"0.95M"},
  {id:"dualipa-cdmx-2026-01-08",evento:"Dua Lipa - Future Nostalgia Tour",artista:"Dua Lipa",genero:"Anglo",ciudad:"CDMX",venue:"Palacio de los Deportes",fecha:"2026-01-08",capacidad:22300,radio_spots:156,radio_menciones:54,radio_total:210,alcance:"1.3M"}
];

// Función para parsear alcance a número
const parseReach = (reach: string): number => {
  const num = parseFloat(reach.replace(/[KM]/g, ''));
  return reach.includes('M') ? num : num / 1000;
};

// Seeded random para consistencia
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

// Generar menciones semanales (12 semanas)
export const generateWeeklyMentions = (event: BuzzEvent): number[] => {
  const random = new SeededRandom(event.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
  const reachInMillions = parseReach(event.alcance);
  const base = 600 + (event.capacidad / 80) + (reachInMillions * 1200);
  
  const eventDate = new Date(event.fecha);
  const today = new Date('2025-10-09'); // Current date
  const weeksUntilEvent = Math.floor((eventDate.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000));
  
  const mentions: number[] = [];
  
  for (let i = 11; i >= 0; i--) {
    const weekFromEvent = weeksUntilEvent - (11 - i);
    
    // Sigmoidal ramp-up hacia W-1
    let sigmoidFactor: number;
    if (weekFromEvent > 0) {
      // Post-evento (caída 30-60%)
      sigmoidFactor = random.range(0.3, 0.6);
    } else if (weekFromEvent === 0) {
      // Semana del evento (pico)
      sigmoidFactor = 1;
    } else {
      // Pre-evento (ramp-up)
      const weeksAway = Math.abs(weekFromEvent);
      sigmoidFactor = 1 / (1 + Math.exp(weeksAway - 6));
    }
    
    const weekMentions = Math.round(base * sigmoidFactor * random.range(0.85, 1.15));
    mentions.push(Math.max(50, weekMentions));
  }
  
  return mentions;
};

// Generar sentimiento por género
export const generateSentiment = (event: BuzzEvent): number => {
  const random = new SeededRandom(event.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + 1000);
  
  if (event.genero === "Pop/Urbano") {
    return random.range(0.66, 0.78);
  } else if (event.genero === "Regional") {
    return random.range(0.62, 0.74);
  } else {
    return random.range(0.68, 0.80);
  }
};

// Calcular Buzz Score
export const calculateBuzzScore = (event: BuzzEvent, mentions: number[]): number => {
  const last4Weeks = mentions.slice(-4);
  const prev2Weeks = mentions.slice(-6, -4);
  const last2Weeks = mentions.slice(-2);
  
  // Volumen (peso 0.5)
  const avgLast4 = last4Weeks.reduce((a, b) => a + b, 0) / 4;
  const maxVolume = 10000;
  const volumeScore = Math.min(avgLast4 / maxVolume, 1);
  
  // Crecimiento (peso 0.3)
  const avgPrev2 = prev2Weeks.reduce((a, b) => a + b, 0) / 2;
  const avgLast2 = last2Weeks.reduce((a, b) => a + b, 0) / 2;
  const growth = avgPrev2 > 0 ? (avgLast2 - avgPrev2) / avgPrev2 : 0;
  const growthScore = Math.max(0, Math.min(growth, 1));
  
  // Sentimiento (peso 0.2)
  const sentiment = generateSentiment(event);
  
  return Math.round((volumeScore * 0.5 + growthScore * 0.3 + sentiment * 0.2) * 100);
};

// Calcular crecimiento porcentual
export const calculateGrowth = (mentions: number[]): number => {
  const last2Weeks = mentions.slice(-2);
  const prev2Weeks = mentions.slice(-4, -2);
  
  const avgLast2 = last2Weeks.reduce((a, b) => a + b, 0) / 2;
  const avgPrev2 = prev2Weeks.reduce((a, b) => a + b, 0) / 2;
  
  if (avgPrev2 === 0) return 0;
  return Math.round(((avgLast2 - avgPrev2) / avgPrev2) * 100);
};

// Generar hashtags
export const generateHashtags = (event: BuzzEvent): { primary: string; secondary: string } => {
  const artistSlug = event.artista.replace(/\s+/g, '');
  const citySlug = event.ciudad.replace(/\s+/g, '');
  const primary = `#${artistSlug}${citySlug}`;
  
  const tourMatch = event.evento.match(/- (.+?)(?:\s+Tour)?$/);
  let secondary = `#${artistSlug}Tour`;
  
  if (tourMatch) {
    const tourName = tourMatch[1].replace(/\s+/g, '');
    secondary = `#${tourName.replace(/Tour$/, '')}Tour`;
  }
  
  return { primary, secondary };
};

// Generar influencers simulados
export interface Influencer {
  name: string;
  handle: string;
  platform: 'X' | 'Instagram' | 'TikTok' | 'YouTube';
  avatar: string;
  mentions: number;
  engagement: number;
  sentiment: number;
  postUrl: string;
  postPreview: string;
}

export const generateInfluencers = (event: BuzzEvent, count: number = 5): Influencer[] => {
  const random = new SeededRandom(event.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + 2000);
  const platforms: Array<'X' | 'Instagram' | 'TikTok' | 'YouTube'> = ['X', 'Instagram', 'TikTok', 'YouTube'];
  const sentiment = generateSentiment(event);
  
  const influencerTypes = [
    { prefix: 'Música', type: 'news' },
    { prefix: 'Conciertos', type: 'fan' },
    { prefix: event.ciudad, type: 'local' },
    { prefix: event.artista, type: 'fan' },
    { prefix: 'Live', type: 'news' }
  ];
  
  const influencers: Influencer[] = [];
  
  for (let i = 0; i < count; i++) {
    const typeInfo = influencerTypes[i % influencerTypes.length];
    const platform = platforms[Math.floor(random.next() * platforms.length)];
    const baseMentions = Math.round(random.range(50, 300));
    const engagementMultiplier = random.range(15, 45);
    
    influencers.push({
      name: `${typeInfo.prefix} ${typeInfo.type === 'news' ? 'News' : 'Fan'}`,
      handle: `@${typeInfo.prefix.toLowerCase()}${typeInfo.type}${Math.round(random.range(1, 99))}`,
      platform,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${event.id}-${i}`,
      mentions: baseMentions,
      engagement: Math.round(baseMentions * engagementMultiplier),
      sentiment: random.range(sentiment - 0.05, sentiment + 0.05),
      postUrl: `https://${platform.toLowerCase()}.com/post/simulated-${event.id}-${i}`,
      postPreview: generatePostPreview(event, typeInfo.type, random)
    });
  }
  
  return influencers.sort((a, b) => b.engagement - a.engagement);
};

const generatePostPreview = (event: BuzzEvent, type: string, random: SeededRandom): string => {
  const previews = {
    news: [
      `🚨 CONFIRMADO: ${event.artista} en ${event.ciudad}`,
      `📢 Anuncian fecha de ${event.artista} en ${event.venue}`,
      `🎤 ${event.artista} llega a ${event.ciudad} - Detalles aquí`
    ],
    fan: [
      `¡NO PUEDO ESPERAR! 😭 ${event.artista} en ${event.ciudad}`,
      `Ya tengo mis boletos para ${event.artista} 🎉`,
      `Quién va al concierto de ${event.artista}? 🙋‍♀️`
    ],
    local: [
      `${event.ciudad} se prepara para recibir a ${event.artista} 🔥`,
      `Gran expectativa en ${event.ciudad} por ${event.artista}`,
      `${event.venue} lista para el show de ${event.artista}`
    ]
  };
  
  const options = previews[type as keyof typeof previews] || previews.news;
  return options[Math.floor(random.next() * options.length)];
};

// Calcular cumplimiento de radio
export interface RadioCompliance {
  eventId: string;
  evento: string;
  spots: number;
  menciones: number;
  total: number;
  esperado: number;
  cumplimiento: number;
  status: 'OK' | 'Medio' | 'Bajo';
}

export const calculateRadioCompliance = (event: BuzzEvent): RadioCompliance => {
  const reachInMillions = parseReach(event.alcance);
  const esperado = (event.capacidad / 1000) + (reachInMillions * 50);
  const cumplimiento = event.radio_total / esperado;
  
  let status: 'OK' | 'Medio' | 'Bajo';
  if (cumplimiento >= 1.0) {
    status = 'OK';
  } else if (cumplimiento >= 0.7) {
    status = 'Medio';
  } else {
    status = 'Bajo';
  }
  
  return {
    eventId: event.id,
    evento: event.evento,
    spots: event.radio_spots,
    menciones: event.radio_menciones,
    total: event.radio_total,
    esperado: Math.round(esperado),
    cumplimiento: Math.round(cumplimiento * 100),
    status
  };
};

// Generar anotaciones de picos
export interface TrendAnnotation {
  week: number;
  label: string;
}

export const generateAnnotations = (event: BuzzEvent): TrendAnnotation[] => {
  const random = new SeededRandom(event.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + 3000);
  
  const possibleAnnotations = [
    { week: 8, label: "Anuncio 2ª fecha" },
    { week: 8, label: "Pre-venta inicia" },
    { week: 9, label: "Sold out zona VIP" },
    { week: 10, label: "Video viral TikTok" },
    { week: 10, label: "Sold out zona A" },
    { week: 11, label: "Último día preventa" },
    { week: 11, label: "Trending topic" }
  ];
  
  const annotations: TrendAnnotation[] = [];
  const selectedWeeks = new Set<number>();
  
  // Seleccionar 2-3 anotaciones aleatorias
  const count = Math.floor(random.range(2, 4));
  while (annotations.length < count && possibleAnnotations.length > 0) {
    const idx = Math.floor(random.next() * possibleAnnotations.length);
    const annotation = possibleAnnotations[idx];
    
    if (!selectedWeeks.has(annotation.week)) {
      annotations.push(annotation);
      selectedWeeks.add(annotation.week);
    }
    
    possibleAnnotations.splice(idx, 1);
  }
  
  return annotations.sort((a, b) => a.week - b.week);
};

// Datos por plataforma para heatmap
export const splitByPlatform = (total: number, seed: number): { X: number; IG: number; TikTok: number; YT: number } => {
  const random = new SeededRandom(seed);
  
  // Porcentajes base con variación
  const xPct = random.range(0.22, 0.28);
  const igPct = random.range(0.27, 0.33);
  const ttPct = random.range(0.27, 0.33);
  const ytPct = 1 - xPct - igPct - ttPct;
  
  return {
    X: Math.round(total * xPct),
    IG: Math.round(total * igPct),
    TikTok: Math.round(total * ttPct),
    YT: Math.round(total * ytPct)
  };
};
