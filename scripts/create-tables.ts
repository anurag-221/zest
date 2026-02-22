import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
    console.log('Reading schema...');
    const schemaPath = path.join(process.cwd(), 'supabase-schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf-8');

    // Super simple split for now; assumes no semicolons inside strings
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);

    for (const statement of statements) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        // We use an RPC call if setup, or direct REST query if available, 
        // Note: supabase-js does not have a direct sql() executor unless using REST API postgres meta or an RPC wrapper.
        // Let's create an RPC wrapper if not exists, or just use raw fetch
        try {
            const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${supabaseKey}`,
                    'apikey': supabaseKey as string
                },
                body: JSON.stringify({ query: statement })
            });

            if(!res.ok) {
                 const err = await res.json();
                 // Ignore 'already exists'
                 if(!err.message?.includes('already exists')) {
                      console.warn(`Note: execution issue (might be RPC missing): ${err.message}`);
                 }
            } else {
                console.log('Success.')
            }

        } catch (e: any) {
            console.error('Failed to execute statement', e.message);
        }
    }
    
    console.log('Table schema sync attempt complete. Note: If RPC exec_sql is missing, please copy the last two tables from supabase-schema.sql and execute them manually in the Supabase Dashboard SQL Editor.');
}

createTables();
