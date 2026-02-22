'use server';

import { AppEvent } from '@/types';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';

export async function saveEvent(event: AppEvent) {
  const { error } = await supabaseAdmin.from('events').upsert({
      id: event.id,
      name: event.name,
      type: event.type,
      schedule: event.schedule,
      rules: event.rules,
      assets: event.assets,
      target_cities: event.targetCities
  });

  if (error) {
      console.error('Failed to save event — Supabase error:', JSON.stringify(error, null, 2));
      throw new Error(error.message || 'Database Error');
  }

  revalidatePath('/');
  revalidatePath('/admin/events');
  return { success: true };
}

export async function getProductTags(): Promise<string[]> {
  try {
      const { data, error } = await supabaseAdmin
          .from('products')
          .select('tags');
      if (error) return [];
      
      // Flatten and deduplicate all tags across all products
      const allTags = data
          ?.flatMap((p: any) => p.tags || [])
          .filter(Boolean);
      return [...new Set(allTags as string[])].sort();
  } catch {
      return [];
  }
}

export async function deleteEvent(eventId: string) {
  const { error } = await supabaseAdmin.from('events').delete().eq('id', eventId);
  
  if (error) {
      console.error('Failed to delete event', error);
      throw new Error('Database Error');
  }

  revalidatePath('/');
  revalidatePath('/admin/events');
  return { success: true };
}
