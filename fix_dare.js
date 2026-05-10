const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'app/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDare() {
  const dareId = 'd1027182-f574-4d39-b1d6-f015e570bee5';
  
  const { data, error } = await supabase
    .from('dares')
    .update({ status: 'accepted', recipient_wallet: '7jcgjL4yDJL8rAfgtPH7fPpusLiR9rbco5SRN2DWd2Ph' })
    .eq('id', dareId);

  if (error) {
    console.error("Error updating:", error);
  } else {
    console.log("Successfully fixed dare status to accepted!");
  }
}

fixDare();
