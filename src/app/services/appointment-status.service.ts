import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from '@angular/fire/firestore';

import { Observable, from, of, throwError } from 'rxjs';

import { catchError, map, switchMap } from 'rxjs/operators';

import { ErrorHandlerService } from './error-handler.service';
import { NotificationService } from './notification.service';
import { Appointment } from '../models/appointment.model';

@Injectable({
  providedIn: 'root',
})
export class AppointmentStatusService {
  // Coleção do Firestore
  private appointmentsCollection = 'appointments';

  constructor(
    private firestore: Firestore,
    private notificationService: NotificationService,
    private errorHandler: ErrorHandlerService
  ) {}

  /**
   * Método de diagnóstico para verificar a estrutura da coleção de agendamentos
   */
  private debugAppointmentCollection(): Observable<Record<string, unknown>[]> {
    console.log('[DEBUG-CRITICAL] Verificando estrutura da coleção de agendamentos...');
    const collectionRef = collection(this.firestore, this.appointmentsCollection);
    return from(getDocs(collectionRef)).pipe(
      map(snapshot => {
        console.log(`[DEBUG-CRITICAL] Total de documentos na coleção: ${snapshot.size}`);
        const docs: Record<string, unknown>[] = [];
        snapshot.forEach(docSnap => {
          docs.push({
            id: docSnap.id,
            ...docSnap.data(),
          });
        });
        return docs;
      }),
      catchError(error => {
        console.error('[DEBUG-CRITICAL] Erro ao acessar coleção:', error);
        return of([]);
      })
    );
  }

  /**
   * Cancela um agendamento (exclui completamente do Firebase)
   */
  cancelAppointment(appointment: Appointment | string): Observable<Appointment> {
    const id = typeof appointment === 'string' ? appointment : appointment.id;
    const originalAppointment = typeof appointment === 'string' ? null : appointment;

    if (!id) {
      console.error('[DEBUG-CRITICAL] Erro ao cancelar agendamento: ID não fornecido');
      return throwError(() => new Error('ID de agendamento não fornecido'));
    }

    console.log(
      `[DEBUG-CRITICAL] ========= INICIANDO PROCESSO DE EXCLUSÃO DE AGENDAMENTO =========`
    );
    console.log(`[DEBUG-CRITICAL] ID do agendamento: ${id}`);
    if (originalAppointment) {
      console.log(`[DEBUG-CRITICAL] Status atual do agendamento: ${originalAppointment.status}`);
      console.log(`[DEBUG-CRITICAL] Data/hora do agendamento: ${originalAppointment.dateTime}`);
      console.log(`[DEBUG-CRITICAL] Cliente: ${originalAppointment.clientName}`);
    }

    // Obter referência ao documento
    const appointmentRef = doc(this.firestore, `${this.appointmentsCollection}/${id}`);
    console.log(`[DEBUG-CRITICAL] Caminho do documento: ${this.appointmentsCollection}/${id}`);

    // Primeiro verificar se o documento existe
    return from(getDoc(appointmentRef)).pipe(
      switchMap(docSnap => {
        if (!docSnap.exists()) {
          console.error(`[DEBUG-CRITICAL] Documento do agendamento ${id} NÃO ENCONTRADO!`);
          return throwError(() => new Error(`Agendamento com ID ${id} não encontrado`));
        }

        const data = docSnap.data();
        console.log(`[DEBUG-CRITICAL] Documento encontrado no Firestore com dados:`, data);

        // Salvar os dados do documento para retornar após a exclusão
        const appointmentData = {
          id,
          ...data,
          status: 'cancelado', // Marcar como cancelado no objeto retornado
        } as Appointment;

        // Excluir o documento do Firebase
        console.log(`[DEBUG-CRITICAL] Excluindo documento do agendamento ${id}...`);
        return from(deleteDoc(appointmentRef)).pipe(
          map(() => {
            console.log(`[DEBUG-CRITICAL] ✅ Documento do agendamento ${id} excluído com sucesso!`);
            this.notificationService.success('Agendamento cancelado e removido com sucesso!');
            return appointmentData;
          }),
          catchError(error => {
            console.error(`[DEBUG-CRITICAL] ❌ Erro ao excluir documento:`, error);
            this.notificationService.error('Erro ao cancelar agendamento');
            return throwError(() => error);
          })
        );
      }),
      catchError(error => {
        console.error(`[DEBUG-CRITICAL] ❌ Erro ao verificar documento:`, error);
        this.notificationService.error('Erro ao verificar documento do agendamento');
        return throwError(() => error);
      })
    );
  }

  /**
   * Confirma um agendamento
   */
  confirmAppointment(appointment: Appointment | string): Observable<Appointment> {
    const id = typeof appointment === 'string' ? appointment : appointment.id;

    if (!id) {
      console.error('Erro ao confirmar agendamento: ID não fornecido');
      return throwError(() => new Error('ID de agendamento não fornecido'));
    }

    const appointmentRef = doc(this.firestore, `${this.appointmentsCollection}/${id}`);

    return from(updateDoc(appointmentRef, { status: 'confirmado' })).pipe(
      map(() => {
        this.notificationService.success('Agendamento confirmado com sucesso!');
        if (typeof appointment === 'string') {
          return { id, status: 'confirmado' } as Appointment;
        } else {
          return { ...appointment, status: 'confirmado' } as Appointment;
        }
      }),
      catchError(error => {
        console.error(`Erro ao confirmar agendamento ${id}:`, error);
        this.notificationService.error('Erro ao confirmar agendamento');
        return throwError(() => error);
      })
    );
  }

  /**
   * Finaliza um agendamento e o marca como completo
   */
  completeAppointment(
    appointment: Appointment | string,
    paymentMethod?: 'dinheiro' | 'pix' | 'cartao'
  ): Observable<Appointment> {
    const id = typeof appointment === 'string' ? appointment : appointment.id;

    if (!id) {
      console.error('Erro ao finalizar agendamento: ID não fornecido');
      return throwError(() => new Error('ID de agendamento não fornecido'));
    }

    const appointmentRef = doc(this.firestore, `${this.appointmentsCollection}/${id}`);

    // Objeto a ser atualizado
    const updateData: Partial<Appointment> = {
      status: 'finalizado',
    };

    // Se o método de pagamento foi informado, incluí-lo na atualização
    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod;
    }

    return from(updateDoc(appointmentRef, updateData)).pipe(
      map(() => {
        this.notificationService.success('Agendamento finalizado com sucesso!');
        if (typeof appointment === 'string') {
          return { id, status: 'finalizado', paymentMethod } as Appointment;
        } else {
          return { ...appointment, status: 'finalizado', paymentMethod } as Appointment;
        }
      }),
      catchError(error => {
        console.error(`Erro ao finalizar agendamento ${id}:`, error);
        this.notificationService.error('Erro ao finalizar agendamento');
        return throwError(() => error);
      })
    );
  }

  /**
   * Define um agendamento como "não compareceu" (no-show)
   */
  markAsNoShow(appointment: Appointment | string): Observable<Appointment> {
    const id = typeof appointment === 'string' ? appointment : appointment.id;

    if (!id) {
      console.error('Erro ao marcar como não compareceu: ID não fornecido');
      return throwError(() => new Error('ID de agendamento não fornecido'));
    }

    const appointmentRef = doc(this.firestore, `${this.appointmentsCollection}/${id}`);

    return from(updateDoc(appointmentRef, { status: 'no-show' })).pipe(
      map(() => {
        this.notificationService.success('Agendamento marcado como não compareceu!');
        if (typeof appointment === 'string') {
          return { id, status: 'no-show' } as Appointment;
        } else {
          return { ...appointment, status: 'no-show' } as Appointment;
        }
      }),
      catchError(error => {
        console.error(`Erro ao marcar agendamento ${id} como não compareceu:`, error);
        this.notificationService.error('Erro ao atualizar status do agendamento');
        return throwError(() => error);
      })
    );
  }
}
