import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY; // Requires RLS bypass or appropriate policy if script runs client-side

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function grantPremium() {
    console.log("Searching for user 'старший на месте'...");

    // Try finding by first name / last name match
    const { data: users, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, is_premium')
        .ilike('first_name', '%старший%');

    if (error) {
        console.error("Error searching:", error);
        return;
    }

    if (users && users.length > 0) {
        const user = users[0];
        console.log(`Found user: ${user.first_name} ${user.last_name} (ID: ${user.id})`);

        // Update to premium
        const infinityDate = new Date('2099-12-31T23:59:59Z').toISOString();
        const { data: updated, error: updateError } = await supabase
            .from('users')
            .update({ is_premium: true, premium_expires_at: infinityDate })
            .eq('id', user.id)
            .select();

        if (updateError) {
            console.error("Failed to update premium status:", updateError);
        } else {
            console.log("Successfully granted Premium status ⭐️ to your account!");
        }
    } else {
        console.log("Could not find a user with the name 'старший'. Please manually set your is_premium in Supabase.");
    }
}

grantPremium();
