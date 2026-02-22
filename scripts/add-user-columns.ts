/**
 * Script to add new columns to existing Supabase users table.
 * Run with: npx tsx scripts/add-user-columns.ts
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addColumns() {
    const sql = `
        ALTER TABLE users
            ADD COLUMN IF NOT EXISTS cart JSONB DEFAULT '[]'::jsonb,
            ADD COLUMN IF NOT EXISTS wishlist JSONB DEFAULT '[]'::jsonb,
            ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC DEFAULT 500,
            ADD COLUMN IF NOT EXISTS wallet_transactions JSONB DEFAULT '[]'::jsonb,
            ADD COLUMN IF NOT EXISTS viewed_products JSONB DEFAULT '[]'::jsonb;
    `;

    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey as string
        },
        body: JSON.stringify({ query: sql })
    });

    if (res.ok) {
        console.log('✅ Columns added successfully via RPC.');
    } else {
        const err = await res.json().catch(() => ({}));
        // If RPC not found, remind user to run DDL manually
        if (res.status === 404 || (err as any).message?.includes('does not exist')) {
            console.log('\n⚠️  RPC exec_sql not found. Please run this SQL in the Supabase Dashboard SQL Editor:\n');
            console.log(sql);
        } else {
            console.log('RPC result:', err);
            console.log('\nIf columns already exist, you can safely ignore the above. Otherwise run this SQL in the Supabase Dashboard:\n');
            console.log(sql);
        }
    }
}

addColumns().catch(console.error);
