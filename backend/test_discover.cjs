const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lmokzdhsnqjjqcrmgwtm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxtb2t6ZGhzbnFqanFjcm1nd3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NTU1MjksImV4cCI6MjA4NzQzMTUyOX0.ulwlqvqm3J2VUHOXuV-7BurmvG-ip-ZikNgvS3SAwis';
const sb = createClient(supabaseUrl, supabaseKey);

async function testDiscover() {
  const { data } = await sb.from('users').select('id, telegram_id');
  if (data && data.length > 0) {
    const uid = data[0].id;
    const url = 'http://localhost:5001/api/profiles/discover?user_id=' + uid;
    const res = await fetch(url);
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
  } else {
    console.log('No users found in db');
  }
}

testDiscover();
