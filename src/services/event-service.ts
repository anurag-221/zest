import { AppEvent } from '../types';
import eventsData from '../../data/events.json';

export const EventService = {
  getActiveEvents: (cityId?: string): AppEvent[] => {
    const now = new Date();
    return (eventsData as AppEvent[]).filter(event => {
      const start = new Date(event.schedule.start);
      const end = new Date(event.schedule.end);
      
      const isTimeActive = now >= start && now <= end;
      if (!isTimeActive) return false;

      if (event.targetCities.includes('all')) return true;
      if (cityId && event.targetCities.includes(cityId)) return true;
      
      return false;
    });
  },

  getEventById: (id: string): AppEvent | undefined => {
    return (eventsData as AppEvent[]).find(e => e.id === id);
  }
};
