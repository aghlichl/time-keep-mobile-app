// Environment configuration
// Copy this file and rename it to config.local.ts, then fill in your actual values

export const config = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project-ref.supabase.co',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-here',
  },
};
