import { inject } from "@angular/core/primitives/di";
import { CanActivateFn, Router } from "@angular/router";
import { supabase } from "@core/supabase.client";

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    return true;
  }
  return router.createUrlTree(["/login"]);
};
