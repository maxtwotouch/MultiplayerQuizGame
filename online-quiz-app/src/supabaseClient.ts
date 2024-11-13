// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl) {
  throw new Error('supabaseUrl is required.');
}

if (!supabaseAnonKey) {
  throw new Error('supabaseAnonKey is required.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
