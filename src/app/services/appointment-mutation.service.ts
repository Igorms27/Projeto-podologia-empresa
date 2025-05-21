import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';

import { Observable, from, of } from 'rxjs';

import { catchError, map, tap } from 'rxjs/operators';

import { LoggingService } from './logging.service';
import { NotificationService } from './notification.service';
import { Appointment } from '../models/appointment.model';

// Interface local estendida para refletir o que está sendo usado no serviço
interface AppointmentExtended extends Appointment {
  date: string;
  timeSlot: string;
  timestamp?: number;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  canceledAt?: string;
  cancellationReason?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppointmentMutationService {
  constructor(
    private firestore: Firestore,
    private notificationService: NotificationService,
    private logger: LoggingService
  ) {}

  /**
   * Cria um novo agendamento
   * @param appointment Dados do agendamento
   * @returns Observable com o ID do agendamento criado
   */
  createAppointment(appointment: Omit<AppointmentExtended, 'id'>): Observable<string> {
    // Adiciona timestamp para facilitar consultas por data
    const appointmentWithTimestamp = {
      ...appointment,
      timestamp: new Date(appointment.date).getTime(),
      createdAt: new Date().toISOString(),
    };

    const appointmentsRef = collection(this.firestore, 'appointments');
    return from(addDoc(appointmentsRef, appointmentWithTimestamp)).pipe(
      map(docRef => docRef.id),
      tap(id => {
        this.logger.info('Agendamento criado com sucesso:', id);
        this.notificationService.success('Agendamento realizado com sucesso');
      }),
      catchError(error => {
        this.logger.error('Erro ao criar agendamento:', error);
        this.notificationService.error('Não foi possível criar o agendamento');
        return of('');
      })
    );
  }

  /**
   * Atualiza um agendamento existente
   * @param id ID do agendamento
   * @param appointmentData Dados atualizados do agendamento
   * @returns Observable indicando sucesso ou falha
   */
  updateAppointment(
    id: string,
    appointmentData: Partial<AppointmentExtended>
  ): Observable<boolean> {
    // Se houver alteração na data, atualiza também o timestamp
    const updateData: Partial<AppointmentExtended> = { ...appointmentData };

    if (appointmentData.date) {
      updateData.timestamp = new Date(appointmentData.date).getTime();
    }

    updateData.updatedAt = new Date().toISOString();

    const appointmentRef = doc(this.firestore, `appointments/${id}`);
    return from(updateDoc(appointmentRef, updateData)).pipe(
      map(() => true),
      tap(() => {
        this.logger.info('Agendamento atualizado com sucesso');
        this.notificationService.success('Agendamento atualizado com sucesso');
      }),
      catchError(error => {
        this.logger.error('Erro ao atualizar agendamento:', error);
        this.notificationService.error('Não foi possível atualizar o agendamento');
        return of(false);
      })
    );
  }

  /**
   * Remove um agendamento
   * @param id ID do agendamento
   * @returns Observable indicando sucesso ou falha
   */
  deleteAppointment(id: string): Observable<boolean> {
    const appointmentRef = doc(this.firestore, `appointments/${id}`);
    return from(deleteDoc(appointmentRef)).pipe(
      map(() => true),
      tap(() => {
        this.logger.info('Agendamento excluído com sucesso');
        this.notificationService.success('Agendamento excluído com sucesso');
      }),
      catchError(error => {
        this.logger.error('Erro ao excluir agendamento:', error);
        this.notificationService.error('Não foi possível excluir o agendamento');
        return of(false);
      })
    );
  }

  /**
   * Marca um agendamento como concluído
   * @param id ID do agendamento
   * @param notes Observações do atendimento
   * @returns Observable indicando sucesso ou falha
   */
  completeAppointment(id: string, notes: string = ''): Observable<boolean> {
    const updateData = {
      status: 'completed',
      notes: notes,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const appointmentRef = doc(this.firestore, `appointments/${id}`);
    return from(updateDoc(appointmentRef, updateData)).pipe(
      map(() => true),
      tap(() => {
        this.logger.info('Agendamento marcado como concluído');
        this.notificationService.success('Atendimento registrado com sucesso');
      }),
      catchError(error => {
        this.logger.error('Erro ao concluir agendamento:', error);
        this.notificationService.error('Não foi possível registrar o atendimento');
        return of(false);
      })
    );
  }

  /**
   * Cancela um agendamento
   * @param id ID do agendamento
   * @param reason Motivo do cancelamento
   * @returns Observable indicando sucesso ou falha
   */
  cancelAppointment(id: string, reason: string = ''): Observable<boolean> {
    const updateData = {
      status: 'canceled',
      cancellationReason: reason,
      canceledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const appointmentRef = doc(this.firestore, `appointments/${id}`);
    return from(updateDoc(appointmentRef, updateData)).pipe(
      map(() => true),
      tap(() => {
        this.logger.info('Agendamento cancelado com sucesso');
        this.notificationService.success('Agendamento cancelado com sucesso');
      }),
      catchError(error => {
        this.logger.error('Erro ao cancelar agendamento:', error);
        this.notificationService.error('Não foi possível cancelar o agendamento');
        return of(false);
      })
    );
  }

  /**
   * Marca um agendamento como não compareceu (no-show)
   * @param id ID do agendamento
   * @returns Observable indicando sucesso ou falha
   */
  markAsNoShow(id: string): Observable<boolean> {
    const updateData = {
      status: 'no-show',
      updatedAt: new Date().toISOString(),
    };

    const appointmentRef = doc(this.firestore, `appointments/${id}`);
    return from(updateDoc(appointmentRef, updateData)).pipe(
      map(() => true),
      tap(() => {
        this.logger.info('Agendamento marcado como não compareceu');
        this.notificationService.success('Cliente marcado como não compareceu');
      }),
      catchError(error => {
        this.logger.error('Erro ao marcar não comparecimento:', error);
        this.notificationService.error('Não foi possível registrar o não comparecimento');
        return of(false);
      })
    );
  }
}
