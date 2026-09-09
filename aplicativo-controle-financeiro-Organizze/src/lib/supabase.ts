import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
  ?? 'https://bysalrnsjgyuxdytqxch.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string
  ?? 'sb_publishable_uHRPRk_l-hb3t_fAcm7Keg_t4ieOyOI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
