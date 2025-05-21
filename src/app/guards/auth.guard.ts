import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { LoggingService } from '../services/logging.service';

// Definindo o tipo Role explicitamente
type Role = 'admin' | 'client' | 'funcionario';

/**
 * Guard de autenticação e autorização
 * Verifica se o usuário está autenticado e se tem as permissões necessárias
 * para acessar a rota
 *
 * Restrições especiais:
 * - Áreas de caixa e relatório mensal são restritas a administradores
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private router: Router,
    private logger: LoggingService
  ) {}

  /**
   * Verifica se o usuário está autenticado antes de permitir acesso às rotas protegidas
   * Se não estiver autenticado, redireciona para a página de login
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.logger.debug('AuthGuard verificando rota:', route.routeConfig?.path);

    // Verificar se o usuário está autenticado
    if (!this.authService.isLoggedIn()) {
      this.logger.warn('Usuário não autenticado, redirecionando para login');
      return this.router.createUrlTree(['/login']);
    }

    // Verificar se a rota requer um papel específico
    const requiredRole = route.data['role'] as string | undefined;
    if (requiredRole) {
      return this.checkRole(requiredRole);
    }

    return true;
  }

  /**
   * Verifica se o usuário tem o papel necessário
   * @param role Papel necessário para acessar a rota
   * @returns boolean se o usuário tiver o papel necessário, ou um UrlTree para redirecionar
   */
  private checkRole(role: string): boolean | UrlTree {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.logger.warn('Usuário não encontrado');
      return this.router.createUrlTree(['/login']);
    }

    const userRole = currentUser.role as Role;

    // Lógica específica para cada caso
    switch (role) {
      case 'admin':
        // Somente administradores podem acessar
        if (userRole === 'admin') return true;
        break;

      case 'client':
        // Somente clientes podem acessar
        if (userRole === 'client') return true;
        break;

      case 'funcionario':
        // Somente funcionários podem acessar
        if (userRole === 'funcionario') return true;
        break;

      case 'admin-or-funcionario':
        // Administradores ou funcionários podem acessar
        if (userRole === 'admin' || userRole === 'funcionario') return true;
        break;

      default:
        // Para qualquer outro papel específico, verificar igualdade
        if (userRole === role) return true;
    }

    // Se chegou aqui, o usuário não tem permissão
    this.logger.warn('Usuário não tem o papel necessário:', {
      requiredRole: role,
      userRole: userRole,
    });

    return this.router.createUrlTree(['/']);
  }
}
