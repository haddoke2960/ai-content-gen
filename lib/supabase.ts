import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jwdiqetmiheowrezorbg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3ZGlxZXRtaWhlb3dyZXpvcmJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NjY1OTQsImV4cCI6MjA2MjI0MjU5NH0.-m8rFYr_pps_xB_ZOl9U2l-qgfauT8NHmkXcWCdBRtI';

export const supabase = createClient(supabaseUrl, supabaseKey);