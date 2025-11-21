import { createClient } from '@supabase/supabase-js';

// For React Native/Expo apps, environment variables need EXPO_PUBLIC_ prefix
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Create Supabase client only if properly configured
let supabase = null;

if (isSupabaseConfigured()) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: {
        // Use a simple in-memory storage for now
        // In production, you might want to use AsyncStorage or SecureStore
        getItem: (key) => null,
        setItem: (key, value) => {},
        removeItem: (key) => {}
      },
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
  console.log('Supabase client initialized successfully');
} else {
  console.log('Supabase not configured - using mock mode');
}

export default supabase;