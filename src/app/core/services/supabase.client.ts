import { environment } from "@env";
import { SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = async (): Promise<SupabaseClient> => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const { createClient } = await import("@supabase/supabase-js");
  supabaseInstance = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey,
  );

  return supabaseInstance;
};
