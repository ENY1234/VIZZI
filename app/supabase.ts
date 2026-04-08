import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://qpcukamntnlaqzvcfdxp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwY3VrYW1udG5sYXF6dmNmZHhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwOTU5NDksImV4cCI6MjA4OTY3MTk0OX0.esegmcvGStbSX8TMTpQ3tHo3SQ-7tJ6iKle8ANHU6Mo',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
