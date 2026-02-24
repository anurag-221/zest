'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { sendPushNotification } from '@/lib/push-service';

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
  try {
    const { data, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('endpoint, user_id, created_at, users(name, phone)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to get subscribers', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('getSubscribers exception:', err);
    return [];
  }
}

// ── Get all campaigns ─────────────────────────────────────────────────────────
export async function getCampaigns(): Promise<PushCampaign[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('push_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to get campaigns', error);
      return [];
    }
    return (data || []) as PushCampaign[];
  } catch (err) {
    console.error('getCampaigns exception:', err);
    return [];
  }
}

// ── Save a campaign (draft or scheduled) ─────────────────────────────────────
export async function saveCampaign(campaign: Omit<PushCampaign, 'id' | 'created_at' | 'sent_at' | 'recipient_count'>) {
    try {
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

        revalidatePath('/admin/notifications', 'page');
        return { success: true, id };
    } catch (error: any) {
        console.error('saveCampaign exception:', error);
        throw error;
    }
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
  try {
    const result = await sendPushNotification(campaign);

    if (!result.success) {
        throw new Error(result.message || 'Failed to send');
    }

    revalidatePath('/admin/notifications', 'page');
    return result;
  } catch (error: any) {
    console.error('sendCampaignNow exception:', error);
    throw error;
  }
}
