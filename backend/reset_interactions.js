import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function resetInteractions() {
  const userId = '5def1159-8b09-4e20-99a8-e5b44e798391';
  console.log(`Resetting interactions for user ID: ${userId}`);

  const { error: delErr } = await supabase
    .from('interactions')
    .delete()
    .eq('user_id', userId);

  if (delErr) {
    console.error('Failed to delete interactions:', delErr);
  } else {
    console.log('Interactions successfully cleared. You can now see the same profiles again.');
  }
}

resetInteractions();
