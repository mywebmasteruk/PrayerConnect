import { supabase } from './server/supabase';

async function testPrayerTable() {
  console.log('Testing prayers table by attempting to create a test prayer...');
  
  // Try to create a test prayer to determine available columns
  const { data, error } = await supabase
    .from('prayers')
    .insert({
      content: 'TEST PRAYER - PLEASE DELETE'
    })
    .select()
    .single();
  
  if (error) {
    console.log('Error creating test prayer:', error.message);
    console.log('Details:', error.details);
  } else {
    console.log('Successfully created test prayer with structure:');
    console.log(data);
    
    // Clean up test data
    const { error: deleteError } = await supabase
      .from('prayers')
      .delete()
      .eq('id', data.id);
    
    if (deleteError) {
      console.log('Error deleting test prayer:', deleteError.message);
    } else {
      console.log('Successfully deleted test prayer');
    }
  }
}

testPrayerTable();