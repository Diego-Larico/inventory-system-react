import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nyviopitgbsagvuojbil.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55dmlvcGl0Z2JzYWd2dW9qYmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Nzk5MDQsImV4cCI6MjA3OTA1NTkwNH0.HWjxPDzdbSFnawoCKVNPnB-EKGB6HB2yVa3hWlC3p1k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
