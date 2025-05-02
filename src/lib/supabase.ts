
import { createClient } from '@supabase/supabase-js';

// Obtenha o URL e a chave anônima diretamente das variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jspfbcnpuojyhjattvrm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzcGZiY25wdW9qeWhqYXR0dnJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMzMyODUsImV4cCI6MjA2MTcwOTI4NX0.Jl8uwcyEoxR5XLtr2NDniYJ9o-iLwpCqKFToaEwzFW4';

// Criar o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Verificar se estamos usando um cliente mock para desenvolvimento
export const isMockSupabase = supabaseUrl === 'https://placeholder-url.supabase.co';
