import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function run() {
    const { data: users } = await supabase.from('users').select('id, first_name, gender, age, onboarding_completed, telegram_id');
    console.log('USERS:', JSON.stringify(users, null, 2));

    const { data: interactions } = await supabase.from('interactions').select('*');
    console.log('INTERACTIONS:', JSON.stringify(interactions, null, 2));
}
run();
