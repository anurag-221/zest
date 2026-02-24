import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Checking push tables...');
  
  const { error: subError } = await supabase.from('push_subscriptions').select('count', { count: 'exact', head: true });
  if (subError) console.log('❌ push_subscriptions table error:', subError.message);
  else console.log('✅ push_subscriptions table exists.');

  const { error: campError } = await supabase.from('push_campaigns').select('count', { count: 'exact', head: true });
  if (campError) console.log('❌ push_campaigns table error:', campError.message);
  else console.log('✅ push_campaigns table exists.');
}

check();
