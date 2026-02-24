import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function test() {
  const { data: users } = await supabase.from('users').select('id, first_name').limit(2);
  console.log('Users:', users);
  
  if (users && users.length > 0) {
    const userId = users[0].id;
    console.log('Testing discover for', userId);
    
    // Test the specific discover logic
    let query = supabase.from('users').select('id, first_name').neq('id', userId)
      .or('is_banned.eq.false,is_banned.is.null')
      .or('show_in_search.eq.true,show_in_search.is.null')
      .order('created_at', { ascending: false })
      .limit(10);
      
    // Simulate exclude IDs
    const exclude = [users[1].id];
    console.log('Exclude:', `(${exclude.join(',')})`);
    
    // The problematic syntax:
    query = query.not('id', 'in', `(${exclude.join(',')})`);
    
    const res = await query;
    console.log('Result:', res.error || res.data);
  }
}
test();
