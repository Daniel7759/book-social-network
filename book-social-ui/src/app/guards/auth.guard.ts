import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = (): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};

export const loginGuard = (): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated) {
    router.navigate(['/home']);
    return false;
  } else {
    return true;
  }
};
