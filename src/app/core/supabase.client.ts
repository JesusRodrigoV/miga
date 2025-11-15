import { environment } from "@env";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  environment.supabaseUrl,
  environment.supabaseAnonKey,
);
