import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Guard de permissões administrativas
 * Verifica se o usuário atual tem permissões de administrador ou funcionário
 * Restringe acesso às áreas administrativas
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  // Verificar se o usuário está autenticado
  if (!authService.isAuthenticated()) {
    notificationService.warning('Por favor, faça login para acessar esta página');
    router.navigate(['/login']);
    return false;
  }

  // Verificar se o usuário é administrador OU funcionário
  if (!authService.isAdmin() && !authService.isFuncionario()) {
    console.log('Usuário não tem permissões administrativas. Acesso negado.');
    notificationService.error('Acesso restrito apenas para equipe administrativa');
    router.navigate(['/']);
    return false;
  }

  return true;
};

/**
 * Guard exclusivo para administradores (mais restritivo)
 * Verifica se o usuário é especificamente um administrador
 */
export const adminOnlyGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  // Verificar se o usuário está autenticado
  if (!authService.isAuthenticated()) {
    notificationService.warning('Por favor, faça login para acessar esta página');
    router.navigate(['/login']);
    return false;
  }

  // Verificar se o usuário é administrador
  if (!authService.isAdmin()) {
    console.log('Usuário não é administrador. Acesso negado.');
    notificationService.error('Acesso restrito apenas para administradores');
    router.navigate(['/admin/dashboard']);
    return false;
  }

  return true;
};
