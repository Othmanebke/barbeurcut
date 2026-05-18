import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

/* Si les variables d'env ne sont pas renseignées → mode démo (mock) */
export const SUPABASE_READY =
  Boolean(url && key && !url.includes('your-project-id'));

export const supabase = SUPABASE_READY
  ? createClient(url, key, {
      realtime: { params: { eventsPerSecond: 10 } },
    })
  : null;
