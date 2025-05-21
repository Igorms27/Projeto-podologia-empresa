import { Injectable } from '@angular/core';

import { Observable, OperatorFunction, catchError, throwError } from 'rxjs';

import { LoggingService } from './logging.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(
    private logger: LoggingService,
    private notificationService: NotificationService
  ) {}

  handleError(error: unknown, context: string, showNotification = true): void {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Log do erro
    this.logger.error(`Erro em ${context}: ${errorMessage}`, error);

    // Notificação para o usuário (opcional)
    if (showNotification) {
      this.notificationService.error(`Erro: ${errorMessage}`);
    }
  }

  handleObservableError<T>(
    context: string,
    customMessage?: string,
    showNotification = true
  ): OperatorFunction<T, T> {
    return catchError((error: unknown): Observable<T> => {
      this.handleError(error, context, showNotification);
      return throwError(() => new Error(customMessage || `Erro em ${context}`));
    });
  }
}
