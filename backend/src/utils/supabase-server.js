const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_KEY;

// Create a Supabase client for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

module.exports = {
  supabase
};