'use server';

import { db } from '@/lib/fs-db';
import { AppEvent } from '@/types';
import { revalidatePath } from 'next/cache';

export async function saveEvent(event: AppEvent) {
  const events = await db.events.getAll();
  const existingIndex = events.findIndex(e => e.id === event.id);

  if (existingIndex >= 0) {
    events[existingIndex] = event;
  } else {
    events.push(event);
  }

  await db.events.saveAll(events);
  revalidatePath('/'); // Refresh home page
  revalidatePath('/admin/events');
  return { success: true };
}

export async function deleteEvent(eventId: string) {
  const events = await db.events.getAll();
  const filtered = events.filter(e => e.id !== eventId);
  await db.events.saveAll(filtered);
  revalidatePath('/');
  revalidatePath('/admin/events');
  return { success: true };
}
