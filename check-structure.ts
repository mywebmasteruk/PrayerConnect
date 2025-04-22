import { supabase } from './server/supabase';

async function checkTableStructure() {
  console.log('Checking structure of prayers table...');
  
  // We'll use a PostgreSQL introspection query to get the column information
  const { data, error } = await supabase.rpc('get_table_structure', { 
    table_name: 'prayers'
  });
  
  if (error) {
    console.log('RPC error:', error.message);
    console.log('Trying alternate method...');
    
    // Alternative: Query system tables directly
    const { data: columnsData, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'prayers');
    
    if (columnsError) {
      console.log('Could not query schema information:', columnsError.message);
    } else {
      console.log('Columns in prayers table:', columnsData);
    }
  } else {
    console.log('Table structure:', data);
  }
}

checkTableStructure();