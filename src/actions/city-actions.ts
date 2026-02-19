'use server';

import { db } from '@/lib/fs-db';
import { City } from '@/types';
import { revalidatePath } from 'next/cache';

export async function saveCity(city: City) {
  const cities = await db.cities.getAll();
  const existingIndex = cities.findIndex(c => c.id === city.id);

  if (existingIndex >= 0) {
    cities[existingIndex] = city;
  } else {
    cities.push(city);
  }

  await db.cities.saveAll(cities);
  revalidatePath('/');
  revalidatePath('/admin/events/new');
  revalidatePath('/admin/events/[id]');
  return { success: true };
}

export async function deleteCity(cityId: string) {
    const cities = await db.cities.getAll();
    const newCities = cities.filter(c => c.id !== cityId);
    await db.cities.saveAll(newCities);
    revalidatePath('/');
    return { success: true };
}
