'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { City } from '@/types';
import { revalidatePath } from 'next/cache';

export async function saveCity(city: City) {
  const { error } = await supabaseAdmin.from('cities').upsert({
      id: city.id,
      name: city.name,
      pincodes: city.pincodes,
      is_active: city.isActive,
      lat: city.lat,
      lng: city.lng,
      display_name: city.displayName
  }, { onConflict: 'id' });

  if (error) {
      console.error('Failed to save city', error);
      return { success: false, error: 'Database error' };
  }

  revalidatePath('/');
  revalidatePath('/admin/events/new');
  revalidatePath('/admin/events/[id]');
  revalidatePath('/admin/cities');
  return { success: true };
}

export async function deleteCity(cityId: string) {
    const { error } = await supabaseAdmin.from('cities').delete().eq('id', cityId);
    
    if (error) {
        console.error('Failed to delete city', error);
        return { success: false, error: 'Database error' };
    }
    
    revalidatePath('/');
    revalidatePath('/admin/cities');
    return { success: true };
}
