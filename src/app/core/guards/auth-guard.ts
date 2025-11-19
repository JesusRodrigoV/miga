import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { getSupabase } from "@core/services";

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const supabase = await getSupabase();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    return true;
  }
  return router.createUrlTree(["/login"]);
};
