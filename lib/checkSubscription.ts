import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function isUserPremium(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('premium_users')
    .select('subscription_status')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Subscription check error:', error);
    return false;
  }

  return data?.subscription_status === 'active';
}