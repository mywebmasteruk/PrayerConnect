import { supabase } from './server/supabase';

async function checkTables() {
  console.log('Checking if tables exist in Supabase...');
  
  // Check if prayers table exists
  const { data: prayersData, error: prayersError } = await supabase
    .from('prayers')
    .select('*')
    .limit(1);
  
  if (prayersError) {
    console.log('prayers table error:', prayersError.message);
  } else {
    console.log('prayers table exists!');
    console.log('Sample data:', prayersData);
  }

  // Check if users table exists
  const { data: usersData, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1);
  
  if (usersError) {
    console.log('users table error:', usersError.message);
  } else {
    console.log('users table exists!');
    console.log('Sample data:', usersData);
  }
}

checkTables();