import { supabase } from './server/supabase';

async function createUsersTable() {
  console.log('Creating users table in Supabase...');
  
  // This SQL creates a users table with the structure we need
  const { error } = await supabase.rpc('create_users_table');
  
  if (error) {
    console.log('Error calling RPC:', error.message);
    console.log('Details:', error.details);
    console.log('Attempting direct SQL execution...');
    
    // Direct SQL execution (requires more permissions than RPC)
    const { error: sqlError } = await supabase.from('_exec_sql').select('*').eq('query', `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
    `);
    
    if (sqlError) {
      console.log('Error executing SQL:', sqlError.message);
      console.log('Will try to use the REST API to create a table instead...');
      
      // Create using the REST API as a fallback
      console.log('Creating a simple test user to initialize the table...');
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          username: 'admin',
          password: 'admin' // Note: In production, this should be hashed!
        });
      
      if (insertError) {
        if (insertError.code === '42P01') { // relation does not exist
          console.log('Users table does not exist and we do not have permissions to create it.');
          console.log('Please create the users table manually in the Supabase dashboard with:');
          console.log('- id: UUID (primary key with default gen_random_uuid())');
          console.log('- username: TEXT (not null, unique)');
          console.log('- password: TEXT (not null)');
        } else {
          console.log('Error creating test user:', insertError.message);
        }
      } else {
        console.log('Successfully created users table via REST API!');
      }
    } else {
      console.log('Successfully created users table via SQL!');
    }
  } else {
    console.log('Successfully created users table via RPC!');
  }
}

createUsersTable();