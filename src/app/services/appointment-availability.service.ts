import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from '@angular/fire/firestore';

import { Observable, from, of } from 'rxjs';

import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { HolidayService } from './holiday.service';
import { NotificationService } from './notification.service';
import { BlockedTime } from '../models/blocked-time.model';

@Injectable({
  providedIn: 'root',
})
export class AppointmentAvailabilityService {
  constructor(
    private firestore: Firestore,
    private notificationService: NotificationService,
    private holidayService: HolidayService
  ) {}

  /**
   * Verifica se um horário específico está disponível
   * @param date Data e hora do agendamento
   * @param podologistId ID do podólogo (opcional)
   * @returns Observable com a disponibilidade (true = disponível)
   */
  isTimeSlotAvailable(date: string, podologistId?: string): Observable<boolean> {
    const dateFormatted = formatDate(date, 'yyyy-MM-dd', 'pt');

    // Busca primeiro por bloqueios de horário
    const blockedTimesRef = collection(this.firestore, 'blockedTimes');
    let blockedQuery = query(blockedTimesRef, where('date', '==', dateFormatted));

    if (podologistId) {
      blockedQuery = query(blockedQuery, where('podologistId', '==', podologistId));
    }

    return from(getDocs(blockedQuery)).pipe(
      switchMap(snapshot => {
        // Se encontrou bloqueios, verifica se afetam o horário específico
        if (!snapshot.empty) {
          const blockedTimes = snapshot.docs.map(doc => doc.data() as BlockedTime);
          for (const blockedTime of blockedTimes) {
            // Se for bloqueio para o dia inteiro
            if (blockedTime.allDay) {
              return of(false);
            }

            // Se for bloqueio para um horário específico
            if (
              blockedTime.timeSlots &&
              blockedTime.timeSlots.includes(formatDate(date, 'HH:mm', 'pt'))
            ) {
              return of(false);
            }
          }
        }

        // Sem bloqueios, então verifica agendamentos existentes
        return this.checkExistingAppointments(date, podologistId);
      }),
      catchError(error => {
        console.error('Erro ao verificar disponibilidade:', error);
        this.notificationService.error('Não foi possível verificar a disponibilidade do horário');
        return of(false);
      })
    );
  }

  /**
   * Verifica se já existem agendamentos para um horário específico
   * @param date Data e hora do agendamento
   * @param podologistId ID do podólogo (opcional)
   * @returns Observable com a disponibilidade (true = disponível)
   */
  private checkExistingAppointments(date: string, podologistId?: string): Observable<boolean> {
    const formattedDate = formatDate(date, 'yyyy-MM-dd', 'pt');
    const timeSlot = formatDate(date, 'HH:mm', 'pt');

    const appointmentsRef = collection(this.firestore, 'appointments');
    let appointmentQuery = query(
      appointmentsRef,
      where('date', '==', formattedDate),
      where('timeSlot', '==', timeSlot),
      where('status', 'in', ['scheduled', 'confirmed'])
    );

    if (podologistId) {
      appointmentQuery = query(appointmentQuery, where('podologistId', '==', podologistId));
    }

    return from(getDocs(appointmentQuery)).pipe(
      map(snapshot => snapshot.empty),
      catchError(error => {
        console.error('Erro ao verificar agendamentos existentes:', error);
        return of(false);
      })
    );
  }

  /**
   * Obtém horários disponíveis para uma data específica
   * @param date Data para verificar disponibilidade
   * @param podologistId ID do podólogo (opcional)
   * @returns Observable com lista de horários disponíveis
   */
  getAvailableTimeSlots(date: string | Date, podologistId?: string): Observable<string[]> {
    // Converter para string se for um objeto Date
    const dateStr = date instanceof Date ? formatDate(date, 'yyyy-MM-dd', 'pt') : date;

    // Lista de horários padrões
    const defaultTimeSlots = [
      '08:00',
      '08:30',
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '13:00',
      '13:30',
      '14:00',
      '14:30',
      '15:00',
      '15:30',
      '16:00',
      '16:30',
      '17:00',
      '17:30',
    ];

    const formattedDate = formatDate(dateStr, 'yyyy-MM-dd', 'pt');

    // Busca por bloqueios de horário
    const blockedTimesRef = collection(this.firestore, 'blockedTimes');
    let blockedQuery = query(blockedTimesRef, where('date', '==', formattedDate));

    if (podologistId) {
      blockedQuery = query(blockedQuery, where('podologistId', '==', podologistId));
    }

    return from(getDocs(blockedQuery)).pipe(
      switchMap(snapshot => {
        let availableSlots = [...defaultTimeSlots];

        // Remove horários bloqueados
        if (!snapshot.empty) {
          const blockedTimes = snapshot.docs.map(doc => doc.data() as BlockedTime);

          for (const blockedTime of blockedTimes) {
            if (blockedTime.allDay) {
              return of([]); // Dia inteiro bloqueado
            }

            // Corrigido o possível undefined
            if (blockedTime.timeSlots && blockedTime.timeSlots.length > 0) {
              availableSlots = availableSlots.filter(
                slot => !blockedTime.timeSlots?.includes(slot)
              );
            }
          }
        }

        // Busca agendamentos existentes para a data
        return this.getBookedTimeSlots(formattedDate, podologistId).pipe(
          map(bookedSlots => {
            return availableSlots.filter(slot => !bookedSlots.includes(slot));
          })
        );
      }),
      catchError(error => {
        console.error('Erro ao obter horários disponíveis:', error);
        this.notificationService.error('Não foi possível obter os horários disponíveis');
        return of([]);
      })
    );
  }

  /**
   * Obtém horários já agendados para uma data específica
   * @param date Data para verificar
   * @param podologistId ID do podólogo (opcional)
   * @returns Observable com lista de horários agendados
   */
  private getBookedTimeSlots(date: string, podologistId?: string): Observable<string[]> {
    const appointmentsRef = collection(this.firestore, 'appointments');
    let appointmentQuery = query(
      appointmentsRef,
      where('date', '==', date),
      where('status', 'in', ['scheduled', 'confirmed'])
    );

    if (podologistId) {
      appointmentQuery = query(appointmentQuery, where('podologistId', '==', podologistId));
    }

    return from(getDocs(appointmentQuery)).pipe(
      map(snapshot => {
        if (snapshot.empty) {
          return [];
        }
        return snapshot.docs.map(doc => {
          const data = doc.data() as { timeSlot: string };
          return data.timeSlot;
        });
      }),
      catchError(error => {
        console.error('Erro ao obter horários agendados:', error);
        return of([]);
      })
    );
  }

  /**
   * Bloqueia um horário ou dia inteiro
   * @param blockedTime Dados do bloqueio
   * @returns Observable com o ID do bloqueio criado
   */
  blockTime(blockedTime: Omit<BlockedTime, 'id'>): Observable<string> {
    const blockedTimeId = `block-${Date.now()}`;
    const blockedTimeRef = doc(this.firestore, `blockedTimes/${blockedTimeId}`);

    return from(setDoc(blockedTimeRef, blockedTime)).pipe(
      map(() => blockedTimeId),
      tap(id => {
        console.log('Horário bloqueado com sucesso:', id);
        this.notificationService.success('Horário bloqueado com sucesso');
      }),
      catchError(error => {
        console.error('Erro ao bloquear horário:', error);
        this.notificationService.error('Não foi possível bloquear o horário');
        return of('');
      })
    );
  }

  /**
   * Remove um bloqueio de horário
   * @param id ID do bloqueio
   * @returns Observable indicando sucesso ou falha
   */
  unblockTime(id: string): Observable<boolean> {
    const blockedTimeRef = doc(this.firestore, `blockedTimes/${id}`);

    return from(deleteDoc(blockedTimeRef)).pipe(
      map(() => true),
      tap(() => {
        console.log('Bloqueio removido com sucesso');
        this.notificationService.success('Bloqueio de horário removido com sucesso');
      }),
      catchError(error => {
        console.error('Erro ao remover bloqueio:', error);
        this.notificationService.error('Não foi possível remover o bloqueio de horário');
        return of(false);
      })
    );
  }

  /**
   * Obtém todos os bloqueios para uma determinada data
   * @param date Data para verificar
   * @param podologistId ID do podólogo (opcional)
   * @returns Observable com lista de bloqueios
   */
  getBlockedTimes(date: string, podologistId?: string): Observable<BlockedTime[]> {
    const blockedTimesRef = collection(this.firestore, 'blockedTimes');
    let blockedQuery = query(blockedTimesRef, where('date', '==', date));

    if (podologistId) {
      blockedQuery = query(blockedQuery, where('podologistId', '==', podologistId));
    }

    return from(getDocs(blockedQuery)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => {
          return { id: doc.id, ...doc.data() } as BlockedTime;
        });
      }),
      catchError(error => {
        console.error('Erro ao obter bloqueios de horário:', error);
        this.notificationService.error('Não foi possível carregar os bloqueios de horário');
        return of([]);
      })
    );
  }

  /**
   * Verifica se um dia é dia útil (não é final de semana)
   * @param date Data a verificar
   * @returns true se for dia útil
   */
  isBusinessDay(date: Date): boolean {
    const day = date.getDay();
    // Verifica se não é final de semana (0 = Domingo, 6 = Sábado) e não é feriado
    return day !== 0 && day !== 6 && !this.holidayService.isHoliday(date);
  }

  /**
   * Verifica a disponibilidade de um horário em todos os profissionais
   * @param dateTime Data e hora para verificar
   * @returns Observable com resultado da disponibilidade
   */
  isGlobalTimeSlotAvailable(dateTime: Date): Observable<boolean> {
    return this.isTimeSlotAvailable(dateTime.toISOString());
  }

  /**
   * Verifica se um horário está disponível para atualização de um agendamento existente
   * (ignora o próprio agendamento na verificação)
   */
  isTimeSlotAvailableForUpdate(dateTime: Date, podologaId: string): Observable<boolean> {
    return this.isTimeSlotAvailable(dateTime.toISOString(), podologaId);
  }
}
