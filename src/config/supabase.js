import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ou chave não encontradas em app.json -> extra');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);