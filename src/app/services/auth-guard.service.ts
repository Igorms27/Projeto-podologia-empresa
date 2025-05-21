import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Observable, of } from 'rxjs';

import { switchMap } from 'rxjs/operators';

import { NotificationService } from './notification.service';
import { PasswordDialogComponent } from '../shared/components/dialogs/password-dialog/password-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService {
  // Tempo em milissegundos que a autorização é válida (8 horas)
  private readonly AUTH_EXPIRATION_TIME = 8 * 60 * 60 * 1000;

  constructor(
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {}

  /**
   * Solicita uma senha para acessar uma área restrita
   * @param area Nome da área para exibir no diálogo
   * @returns Um Observable que emite true se a senha for correta, false caso contrário
   */
  checkPasswordForRestrictedArea(area: string): Observable<boolean> {
    // Verificar se já tem autorização salva
    if (this.isAreaAuthorized(area)) {
      return of(true);
    }

    const dialogRef = this.dialog.open(PasswordDialogComponent, {
      width: '400px',
      data: {
        title: 'Área Restrita',
        message: `O acesso à área de ${area} requer autenticação. Por favor, digite a senha de administrador.`,
      },
      disableClose: true,
    });

    return dialogRef.afterClosed().pipe(
      switchMap(result => {
        if (result === true) {
          // Salvar autorização no localStorage
          this.saveAreaAuthorization(area);
          return of(true);
        } else {
          this.notificationService.warning('Acesso negado à área restrita.');
          return of(false);
        }
      })
    );
  }

  /**
   * Salva a autorização de uma área no localStorage
   * @param area Nome da área autorizada
   */
  private saveAreaAuthorization(area: string): void {
    const now = new Date().getTime();
    const authData = {
      timestamp: now,
      expiresAt: now + this.AUTH_EXPIRATION_TIME,
    };

    localStorage.setItem(`auth_${area}`, JSON.stringify(authData));
  }

  /**
   * Verifica se uma área está autorizada
   * @param area Nome da área para verificar
   * @returns true se a área estiver autorizada e a autorização for válida
   */
  isAreaAuthorized(area: string): boolean {
    const authDataString = localStorage.getItem(`auth_${area}`);
    if (!authDataString) return false;

    try {
      const authData = JSON.parse(authDataString);
      const now = new Date().getTime();

      // Verificar se a autorização expirou
      if (now > authData.expiresAt) {
        // Remover autorização expirada
        localStorage.removeItem(`auth_${area}`);
        return false;
      }

      return true;
    } catch {
      // Em caso de erro ao processar o JSON, remover a autorização
      localStorage.removeItem(`auth_${area}`);
      return false;
    }
  }

  /**
   * Remove todas as autorizações
   */
  clearAllAuthorizations(): void {
    // Limpar todas as autorizações do localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('auth_')) {
        localStorage.removeItem(key);
      }
    });
  }
}
