import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

const sql = `
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'festival',
    schedule JSONB NOT NULL DEFAULT '{"start": "", "end": ""}'::jsonb,
    rules JSONB NOT NULL DEFAULT '{"showTags": [], "boostCategory": ""}'::jsonb,
    assets JSONB NOT NULL DEFAULT '{"banner": "", "themeColor": "#000000"}'::jsonb,
    target_cities TEXT[] DEFAULT ARRAY['all'],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
`;

async function run() {
    console.log(`Connecting to project: ${projectRef}`);
    
    // Use Supabase Management API to run SQL
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceKey}`
        },
        body: JSON.stringify({ query: sql })
    });

    const body = await res.json().catch(() => ({}));
    
    if (res.ok) {
        console.log('✅ events table created successfully!');
    } else {
        console.log(`⚠️  Management API returned ${res.status}:`, body);
        console.log('\nPlease run this SQL manually in Supabase Dashboard → SQL Editor:\n');
        console.log(sql);
    }
}

run().catch(console.error);
