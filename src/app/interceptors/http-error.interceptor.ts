import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, throwError } from 'rxjs';

import { catchError, retry } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { LoggingService } from '../services/logging.service';
import { NotificationService } from '../services/notification.service';

export const httpErrorInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);
  const router = inject(Router);
  const logger = inject(LoggingService);

  // Adicionar token de autenticação, se disponível
  if (authService.isAuthenticated()) {
    const token = authService.getToken();
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  }

  return next(request).pipe(
    // Tenta a requisição até 2 vezes antes de falhar
    retry(1),
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';

      if (error.error instanceof ErrorEvent) {
        // Erro do lado do cliente
        errorMessage = `Erro: ${error.error.message}`;
        notificationService.error(errorMessage);
      } else {
        // Erro retornado pelo backend
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || 'Requisição inválida';
            notificationService.error(errorMessage);
            break;
          case 401:
            errorMessage = 'Sua sessão expirou. Por favor, faça login novamente.';
            notificationService.warning(errorMessage);
            authService.logout();
            router.navigate(['/login']);
            break;
          case 403:
            errorMessage = 'Acesso negado';
            notificationService.error(errorMessage);
            break;
          case 404:
            errorMessage = 'Recurso não encontrado';
            notificationService.error(errorMessage);
            break;
          case 500:
            errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
            notificationService.error(errorMessage);
            break;
          default:
            errorMessage = `Erro ${error.status}: ${error.error?.message || 'Ocorreu um erro inesperado'}`;
            notificationService.error(errorMessage);
        }
      }

      // Usar o serviço de logging para registrar o erro
      logger.error('Erro HTTP:', error);
      return throwError(() => new Error(errorMessage));
    })
  );
};
