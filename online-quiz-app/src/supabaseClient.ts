// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Access environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Optional: Log the variables to verify they are loaded correctly
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey);

// Validate the presence of environment variables
if (!supabaseUrl) {
  throw new Error('Supabase URL is not defined. Please set VITE_SUPABASE_URL in your .env file.');
}

if (!supabaseAnonKey) {
  throw new Error('Supabase Anon Key is not defined. Please set VITE_SUPABASE_ANON_KEY in your .env file.');
}

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

