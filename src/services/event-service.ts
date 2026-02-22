import { AppEvent } from '../types';
import { supabaseClient } from '@/lib/supabase';

export const EventService = {
  getActiveEvents: async (cityId?: string): Promise<AppEvent[]> => {
    try {
      const { data, error } = await supabaseClient
        .from('events')
        .select('*');

      if (error || !data) return [];

      const now = new Date();

      return data
        .filter((ev: any) => {
          // 1. Date range check
          const start = ev.schedule?.start ? new Date(ev.schedule.start) : null;
          const end = ev.schedule?.end ? new Date(ev.schedule.end) : null;
          if (start && now < start) return false;
          if (end && now > end) return false;

          // 2. City check
          if (!cityId) return true;
          const cities: string[] = ev.target_cities || ['all'];
          return cities.includes('all') || cities.includes(cityId);
        })
        .map((ev: any): AppEvent => ({
          id: ev.id,
          name: ev.name,
          type: ev.type,
          schedule: ev.schedule,
          rules: ev.rules,
          assets: ev.assets,
          targetCities: ev.target_cities || ['all'],
        }));
    } catch {
      return [];
    }
  },

  getEventById: async (id: string): Promise<AppEvent | undefined> => {
    const { data, error } = await supabaseClient
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      schedule: data.schedule,
      rules: data.rules,
      assets: data.assets,
      targetCities: data.target_cities || ['all'],
    };
  }
};
