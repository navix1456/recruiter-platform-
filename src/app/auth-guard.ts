import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from './services/supabase.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  const { data: { session } } = await supabaseService.client.auth.getSession();

  if (session) {
    return true;
  } else {
    return router.parseUrl('/login');
  }
};
