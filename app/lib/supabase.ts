import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qnztkvfapmcsepprrutt.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImQ5YzI2MTRmLTNmZjktNDBkNC05OTAzLWUxYzY1YzM2Y2I4YiJ9.eyJwcm9qZWN0SWQiOiJxbnp0a3ZmYXBtY3NlcHBycnV0dCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc4NjA0ODQwLCJleHAiOjIwOTM5NjQ4NDAsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.gbwYfKiL2ks6iJ9fRtHaUcwpWcXXP5rlIslaHncZ6WI';

// Provide a no-op WebSocket stub so realtime-js doesn't crash during SSR/Node build.
// We don't use realtime features — only REST + edge functions.
class NoopWS {
  constructor(_url?: any) {}
  addEventListener() {}
  removeEventListener() {}
  send() {}
  close() {}
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  realtime: { transport: NoopWS as any },
});

export { supabase };
