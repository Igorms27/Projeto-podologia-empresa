import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BehaviorSubject, Observable, of } from 'rxjs';

import { delay } from 'rxjs/operators';

import { Notification } from '../models/appointment.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  // Para simulação local
  private localNotifications: Notification[] = [];
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);

  constructor(private snackBar: MatSnackBar) {
    this.loadNotifications();
  }

  /**
   * Carrega as notificações do localStorage
   */
  private loadNotifications(): void {
    try {
      const storedData = localStorage.getItem('app_notifications');
      this.localNotifications = storedData ? JSON.parse(storedData) : [];
      this.notificationsSubject.next(this.localNotifications);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      this.localNotifications = [];
      this.notificationsSubject.next([]);
    }
  }

  /**
   * Salva as notificações no localStorage
   */
  private saveNotifications(): void {
    try {
      localStorage.setItem('app_notifications', JSON.stringify(this.localNotifications));
      this.notificationsSubject.next([...this.localNotifications]);
    } catch (error) {
      console.error('Erro ao salvar notificações:', error);
    }
  }

  /**
   * Exibe uma mensagem de sucesso
   * @param message Mensagem a ser exibida
   * @param duration Duração em milissegundos (padrão: 3000ms)
   */
  success(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Fechar', {
      duration: duration,
      panelClass: ['success-notification'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  /**
   * Exibe uma mensagem de erro
   * @param message Mensagem a ser exibida
   * @param duration Duração em milissegundos (padrão: 5000ms)
   */
  error(message: string, duration: number = 5000): void {
    this.snackBar.open(message, 'Fechar', {
      duration: duration,
      panelClass: ['error-notification'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  /**
   * Exibe uma mensagem de alerta
   * @param message Mensagem a ser exibida
   * @param duration Duração em milissegundos (padrão: 4000ms)
   */
  warning(message: string, duration: number = 4000): void {
    this.snackBar.open(message, 'Fechar', {
      duration: duration,
      panelClass: ['warning-notification'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  /**
   * Exibe uma mensagem informativa
   * @param message Mensagem a ser exibida
   * @param duration Duração em milissegundos (padrão: 3000ms)
   */
  info(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Fechar', {
      duration: duration,
      panelClass: ['info-notification'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  /**
   * Cria uma nova notificação no sistema
   * @param notification Objeto com os dados da notificação
   * @returns Observable com a notificação criada
   */
  createNotification(notification: Notification): Observable<Notification> {
    const notificationWithId: Notification = {
      ...notification,
      id: notification.id || `notif-${Date.now()}`,
    };

    this.localNotifications.push(notificationWithId);
    this.saveNotifications();
    return of(notificationWithId).pipe(delay(300));
  }

  /**
   * Obtém todas as notificações de um usuário
   * @param userId ID do usuário
   * @returns Observable com array de notificações
   */
  getNotifications(userId: string | number): Observable<Notification[]> {
    return of(this.localNotifications.filter(n => n.userId === userId)).pipe(delay(300));
  }

  /**
   * Marca uma notificação como lida
   * @param notificationId ID da notificação
   * @returns Observable com a notificação atualizada
   */
  markAsRead(notificationId: string): Observable<Notification | undefined> {
    const index = this.localNotifications.findIndex(n => n.id === notificationId);

    if (index === -1) {
      return of(undefined).pipe(delay(300));
    }

    this.localNotifications[index] = {
      ...this.localNotifications[index],
      read: true,
    };

    this.saveNotifications();
    return of(this.localNotifications[index]).pipe(delay(300));
  }
}
