import { inject } from "@angular/core";
import { CanActivateChildFn, Router } from "@angular/router";
import { getSupabase } from "@core/services";

export const publicGuard: CanActivateChildFn = async (childRoute, state) => {
  const router = inject(Router);
  const supabase = await getSupabase();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    return router.parseUrl("/inicio");
  }

  return true;
};
