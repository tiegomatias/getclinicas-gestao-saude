
import { createClient } from '@supabase/supabase-js';

// Set default values for development to prevent crashes when environment variables are missing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Create a mock Supabase client that won't throw errors but also won't actually connect to Supabase
// This allows the app to load and run in development without crashing
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mock the service methods for local development when not connected to Supabase
export const isMockSupabase = supabaseUrl === 'https://placeholder-url.supabase.co';

export { supabase };
