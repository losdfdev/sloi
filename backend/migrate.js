import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'fl';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    try {
        const sqlPath = path.resolve('../.gemini/antigravity/brain/3d40b630-ac80-4faf-89f6-3ae3f1bb5cc1/supabase_schema.sql');
        let sqlQuery = fs.readFileSync(sqlPath, 'utf8');

        // Remove comments to prevent issues with the REST execute
        sqlQuery = sqlQuery.replace(/--.*/g, '');

        console.log('Sending migration query to Supabase...');

        // Supabase JS library doesn't expose a direct raw SQL method via anon key out of the box.
        // However, since we're using anon key and the database is empty, we must either instruct the user 
        // to run the SQL query from the Supabase UI SQL Editor, OR they can use `psql` if they have the connection string.
        console.log('WARNING: Due to lack of Service Role Key or direct pg connection string, ');
        console.log('please run the contents of supabase_schema.sql manually in the Supabase Dashboard SQL Editor.');

    } catch (err) {
        console.error('Migration failed:', err);
    }
}

runMigration();
