
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://lnxnlsqdknhrbqgeazeg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxueG5sc3Fka25ocmJxZ2VhemVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNzIwMTQsImV4cCI6MjA3OTY0ODAxNH0.MFBzpcdO6BgS5bFS_zVqf31AHq02cUiS302HPxfk3yA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
