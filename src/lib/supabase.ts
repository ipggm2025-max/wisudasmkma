import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dzgdocqppfzdebgyqhib.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6Z2RvY3FwcGZ6ZGViZ3lxaGliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDkxNTUsImV4cCI6MjA5MDI4NTE1NX0.t89e1VjTsCtnrJmh8rffENo6e3FrBVFo0DQgPe_sYmY';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables are missing in .env. Using fallback values provided in the prompt.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
