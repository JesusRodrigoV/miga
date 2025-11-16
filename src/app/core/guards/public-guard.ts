import { inject } from "@angular/core";
import { CanActivateChildFn, Router } from "@angular/router";
import { supabase } from "@core/services";

export const publicGuard: CanActivateChildFn = async (childRoute, state) => {
  const router = inject(Router);

  const { data } = await supabase.auth.getSession();

  if (data.session) {
    return router.createUrlTree(["/inicio"]);
  }

  return true;
};
