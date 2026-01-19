// Script temporal para filtrar eventos
import { realEventsDatabase } from './realEventsDatabase';

// Filtrar eventos después del 23 de noviembre de 2025
const filteredEvents = realEventsDatabase.filter(event => {
  const eventDate = new Date(event.dateISO);
  const cutoffDate = new Date('2025-11-24');
  return eventDate >= cutoffDate;
});

console.log(`Total eventos originales: ${realEventsDatabase.length}`);
console.log(`Eventos después del 24 nov: ${filteredEvents.length}`);
console.log(`Eventos eliminados: ${realEventsDatabase.length - filteredEvents.length}`);

export { filteredEvents };
