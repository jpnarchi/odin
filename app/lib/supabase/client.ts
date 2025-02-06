import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fvtbnjwtnulpwlmediiv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2dGJuand0bnVscHdsbWVkaWl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3MzM0NTQsImV4cCI6MjA1NDMwOTQ1NH0.oGGlJzqKy_aFWA6q5dK432MW6vqt6ThWzsTaC68Ubdc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});