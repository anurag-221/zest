'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export interface PushCampaign {
  id: string;
  title: string;
  body: string;
  icon?: string;
  url?: string;
  type: 'offer' | 'alert' | 'joke' | 'announcement';
  target_type: 'all' | 'city' | 'users';
  target_ids: string[];
  scheduled_at?: string | null;
  sent_at?: string | null;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  recipient_count: number;
  created_at: string;
}

// ── Get all push subscribers joined with user info ────────────────────────────
export async function getSubscribers() {
  const { data, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('endpoint, user_id, created_at, users(name, phone)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to get subscribers', error);
    return [];
  }
  return data || [];
}

// ── Get all campaigns ─────────────────────────────────────────────────────────
export async function getCampaigns(): Promise<PushCampaign[]> {
  const { data, error } = await supabaseAdmin
    .from('push_campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to get campaigns', error);
    return [];
  }
  return (data || []) as PushCampaign[];
}

// ── Save a campaign (draft or scheduled) ─────────────────────────────────────
export async function saveCampaign(campaign: Omit<PushCampaign, 'id' | 'created_at' | 'sent_at' | 'recipient_count'>) {
  const id = `camp-${Date.now()}`;
  const { error } = await supabaseAdmin.from('push_campaigns').insert({
    id,
    ...campaign,
    status: campaign.scheduled_at ? 'scheduled' : 'draft',
    recipient_count: 0,
  });

  if (error) {
    console.error('Failed to save campaign:', error);
    throw new Error(error.message);
  }

  revalidatePath('/admin/notifications');
  return { success: true, id };
}

// ── Send a campaign immediately ───────────────────────────────────────────────
export async function sendCampaignNow(campaign: {
  id?: string;
  title: string;
  body: string;
  icon?: string;
  url?: string;
  type: string;
  target_type: string;
  target_ids: string[];
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/push/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-secret': process.env.ADMIN_SECRET || 'zest-admin' },
    body: JSON.stringify(campaign),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to send');
  }

  revalidatePath('/admin/notifications');
  return await res.json();
}
