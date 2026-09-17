import { createClient } from '@supabase/supabase-js';

/**
 * Anon/publishable key is safe in the client.
 * Prefer EXPO_PUBLIC_* env; fall back to Wafflr App project for local Expo Go.
 */
const url =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  'https://emkdofdotchrvihilqsk.supabase.co';

const anonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVta2RvZmRvdGNocnZpaGlscXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NDY4MjYsImV4cCI6MjEwNTIyMjgyNn0.NgjLv3GaD5nepvfDfQF_nbRHiYKAGphZCp0IvyAvDHg';

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
