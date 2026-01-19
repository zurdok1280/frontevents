import reggaetonImg from '@/assets/events/reggaeton-concert.jpg';
import bandaImg from '@/assets/events/banda-concert.jpg';
import popImg from '@/assets/events/pop-concert.jpg';
import regionalMexicanoImg from '@/assets/events/regional-mexican-concert.jpg';
import hipHopImg from '@/assets/events/hiphop-concert.jpg';
import rockImg from '@/assets/events/rock-concert.jpg';
import electronicImg from '@/assets/events/electronic-concert.jpg';
import metalImg from '@/assets/events/metal-concert.jpg';
import electropopImg from '@/assets/events/electropop-concert.jpg';
import rockAlternativoImg from '@/assets/events/rock-alternativo-concert.jpg';
import jazzFusionImg from '@/assets/events/jazz-fusion-concert.jpg';
import folkIndieImg from '@/assets/events/folk-indie-concert.jpg';
import soulFunkImg from '@/assets/events/soul-funk-concert.jpg';
import baladaImg from '@/assets/events/balada-concert.jpg';

export const getImageByGenre = (genre: string): string => {
  const genreMap: Record<string, string> = {
    'Reggaeton': reggaetonImg,
    'Banda': bandaImg,
    'Pop': popImg,
    'Pop Latino': popImg,
    'Regional Mexicano': regionalMexicanoImg,
    'Corridos Tumbados': regionalMexicanoImg,
    'Hip Hop': hipHopImg,
    'Rock': rockImg,
    'Rock Alternativo': rockAlternativoImg,
    'Rock Clásico': rockImg,
    'Rock en Español': rockImg,
    'Rock Progresivo': rockImg,
    'Electrónica': electronicImg,
    'Electropop': electropopImg,
    'Death Metal': metalImg,
    'Rock/Metal': metalImg,
    'R&B': popImg,
    'Soul/Funk': soulFunkImg,
    'Balada': baladaImg,
    'Folk/Indie': folkIndieImg,
    'Indie Pop': folkIndieImg,
    'Ska': rockImg,
    'Jazz Fusion': jazzFusionImg,
  };

  return genreMap[genre] || popImg;
};
