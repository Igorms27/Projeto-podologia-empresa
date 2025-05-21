import { Injectable, NgZone } from '@angular/core';
import {
  Firestore,
  Unsubscribe,
  addDoc,
  collection,
  collectionData,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from '@angular/fire/firestore';

import { BehaviorSubject, Observable, from, of, switchMap, throwError } from 'rxjs';

import { catchError, map, tap } from 'rxjs/operators';

import { AppointmentAvailabilityService } from './appointment-availability.service';
import { AppointmentQueryService } from './appointment-query.service';
import { AppointmentStatusService } from './appointment-status.service';
import { AuthService } from './auth.service';
import { ErrorHandlerService } from './error-handler.service';
import { HolidayService } from './holiday.service';
import { LoggingService } from './logging.service';
import { NotificationService } from './notification.service';
import { Appointment } from '../models/appointment.model';
import { DateUtils } from '../shared/utils/date-utils';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  appointments$ = this.appointmentsSubject.asObservable();

  // Coleção do Firestore
  private appointmentsCollection = 'appointments';

  // Horários disponíveis para agendamento (intervalos de 30 minutos, das 9h30 às 17h30)
  private availableTimeSlots = [
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
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

  // Lista de feriados nacionais para 2024 e 2025
  private holidays: Date[] = [
    // 2024
    new Date(2024, 0, 1), // Ano Novo
    new Date(2024, 1, 12), // Carnaval
    new Date(2024, 1, 13), // Carnaval
    new Date(2024, 2, 29), // Sexta-feira Santa
    new Date(2024, 3, 21), // Tiradentes
    new Date(2024, 4, 1), // Dia do Trabalho
    new Date(2024, 4, 30), // Corpus Christi
    new Date(2024, 8, 7), // Independência
    new Date(2024, 9, 12), // Nossa Senhora Aparecida
    new Date(2024, 10, 2), // Finados
    new Date(2024, 10, 15), // Proclamação da República
    new Date(2024, 11, 25), // Natal

    // 2025
    new Date(2025, 0, 1), // Ano Novo
    new Date(2025, 2, 3), // Carnaval
    new Date(2025, 2, 4), // Carnaval
    new Date(2025, 3, 18), // Sexta-feira Santa
    new Date(2025, 3, 21), // Tiradentes
    new Date(2025, 4, 1), // Dia do Trabalho
    new Date(2025, 5, 19), // Corpus Christi
    new Date(2025, 8, 7), // Independência
    new Date(2025, 9, 12), // Nossa Senhora Aparecida
    new Date(2025, 10, 2), // Finados
    new Date(2025, 10, 15), // Proclamação da República
    new Date(2025, 11, 25), // Natal
  ];

  // Adicionando propriedade para o cache de agendamentos
  private appointmentsCache = new Map<string, Appointment[]>();
  private unsubscribeRealtime: Unsubscribe | null = null;

  constructor(
    private firestore: Firestore,
    private notificationService: NotificationService,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private availabilityService: AppointmentAvailabilityService,
    private queryService: AppointmentQueryService,
    private statusService: AppointmentStatusService,
    private holidayService: HolidayService,
    private logging: LoggingService,
    private zone: NgZone
  ) {
    // Iniciar o listener em tempo real imediatamente
    this.setupRealtimeUpdates();
  }

  /**
   * Configura um listener em tempo real para atualizações de agendamentos
   * Esta função substitui o loadAppointments antigo por uma versão em tempo real
   * @param startDate Data inicial (opcional)
   * @param endDate Data final (opcional)
   */
  private setupRealtimeUpdates(startDate?: Date, endDate?: Date): void {
    try {
      // Cancelar qualquer listener existente
      if (this.unsubscribeRealtime) {
        this.unsubscribeRealtime();
      }

      const appointmentsRef = collection(this.firestore, this.appointmentsCollection);
      let q;

      // Se temos um intervalo de datas, fazer a query específica
      if (startDate && endDate) {
        // Query para o intervalo de datas
        q = query(
          appointmentsRef,
          where('dateTime', '>=', startDate.toISOString()),
          where('dateTime', '<=', endDate.toISOString())
        );

        this.logging.info(
          `Iniciando listener em tempo real: ${startDate.toLocaleDateString()} a ${endDate.toLocaleDateString()}`
        );
      } else {
        // Query para ordenar por data/hora (caso geral)
        q = query(appointmentsRef, orderBy('dateTime', 'desc'));
        this.logging.info('Listener em tempo real para agendamentos configurado');
      }

      // Configurar um listener em tempo real
      this.unsubscribeRealtime = onSnapshot(
        q,
        snapshot => {
          this.zone.run(() => {
            const appointments: Appointment[] = [];

            snapshot.forEach(doc => {
              appointments.push({
                id: doc.id,
                ...doc.data(),
              } as Appointment);
            });

            if (startDate && endDate) {
              const dateKey = this.formatDateForQuery(startDate);
              this.logging.info(
                `🔴 Atualização em tempo real para ${dateKey}: ${appointments.length} agendamentos`
              );

              // Atualizar o cache
              this.appointmentsCache.set(dateKey, appointments);
            } else {
              this.logging.info(
                `🔴 Atualização em tempo real: ${appointments.length} agendamentos`
              );
            }

            // Se houve mudanças desde a última consulta
            if (snapshot.docChanges().length > 0) {
              // Registrar detalhes das mudanças
              snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                  this.logging.info(`Agendamento ADICIONADO: ${change.doc.id}`);
                }
                if (change.type === 'modified') {
                  this.logging.info(`Agendamento MODIFICADO: ${change.doc.id}`);
                }
                if (change.type === 'removed') {
                  this.logging.info(`Agendamento REMOVIDO: ${change.doc.id}`);
                }
              });
            }

            // Atualizar o subject com os novos dados
            this.appointmentsSubject.next(appointments);
          });
        },
        error => {
          this.zone.run(() => {
            this.logging.error('Erro no listener em tempo real:', error);
            // Tentar reconectar após um erro
            setTimeout(() => {
              this.setupRealtimeUpdates(startDate, endDate);
            }, 5000);
          });
        }
      );
    } catch (error) {
      this.logging.error('Erro ao configurar listener em tempo real:', error);
    }
  }

  /**
   * Recarrega agendamentos em tempo real para uma data específica
   * @param formattedDate Data formatada para consulta (YYYY-MM-DD)
   */
  reloadAppointmentsRealtime(formattedDate: string): void {
    this.logging.info(`Configurando listener em tempo real para data: ${formattedDate}`);

    // Invalidar o cache para esta data
    this.invalidateCache(new Date(formattedDate));

    // Configurar atualização em tempo real para a data específica
    const [year, month, day] = formattedDate.split('-').map(part => parseInt(part, 10));
    const startDate = new Date(year, month - 1, day, 0, 0, 0);
    const endDate = new Date(year, month - 1, day, 23, 59, 59);

    this.setupRealtimeUpdates(startDate, endDate);
  }

  /**
   * Invalida o cache para uma data específica
   * @param date Data para invalidar no cache
   */
  invalidateCache(date: Date): void {
    const formattedDate = this.formatDateForQuery(date);
    this.logging.info(`Invalidando cache para data: ${formattedDate}`);

    // Atualizar o cache se existir
    if (this.appointmentsCache.has(formattedDate)) {
      this.appointmentsCache.delete(formattedDate);
      this.logging.info(`Cache para ${formattedDate} removido com sucesso`);
    }
  }

  /**
   * Formata uma data para consulta no formato YYYY-MM-DD
   * @param date Data para formatar
   * @returns String formatada
   */
  private formatDateForQuery(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Retorna todos os agendamentos
   */
  getAppointments(): Observable<Appointment[]> {
    const appointmentsRef = collection(this.firestore, this.appointmentsCollection);
    return collectionData(appointmentsRef, { idField: 'id' }).pipe(
      map(data => data as Appointment[]),
      this.errorHandler.handleObservableError('AppointmentService.getAppointments')
    );
  }

  /**
   * Verifica se o usuário atual tem permissão para criar agendamentos
   * @returns true se o usuário pode criar agendamentos
   */
  private canCreateAppointment(): boolean {
    const isAdmin = this.authService.isAdmin();
    const isFuncionario = this.authService.isFuncionario();
    const currentUser = this.authService.getCurrentUser();

    console.log('DEBUG - Verificando permissão para criar agendamento:');
    console.log(`- Usuário atual: ${currentUser?.name} (${currentUser?.role})`);
    console.log(`- isAdmin: ${isAdmin}`);
    console.log(`- isFuncionario: ${isFuncionario}`);

    return isAdmin || isFuncionario;
  }

  /**
   * Verifica se o usuário atual tem permissão para manipular agendamentos
   * @returns true se o usuário pode manipular agendamentos
   */
  private canManageAppointment(): boolean {
    const isAdmin = this.authService.isAdmin();
    const isFuncionario = this.authService.isFuncionario();
    const currentUser = this.authService.getCurrentUser();

    console.log('DEBUG - Verificando permissão para manipular agendamento:');
    console.log(`- Usuário atual: ${currentUser?.name} (${currentUser?.role})`);
    console.log(`- isAdmin: ${isAdmin}`);
    console.log(`- isFuncionario: ${isFuncionario}`);

    return isAdmin || isFuncionario;
  }

  /**
   * Cria um novo agendamento com verificação RIGOROSA de disponibilidade
   */
  createAppointment(appointment: Appointment): Observable<Appointment> {
    // Verificar se o usuário atual tem permissão para criar agendamentos
    if (!this.canCreateAppointment()) {
      console.error('Usuário sem permissão para criar agendamentos');
      return throwError(() => new Error('Você não tem permissão para criar agendamentos.'));
    }

    const appointmentsRef = collection(this.firestore, this.appointmentsCollection);

    // Extrair detalhes da data/hora
    const appointmentDate = new Date(appointment.dateTime);
    const formattedTime = DateUtils.toTimeString(appointmentDate);

    console.log(
      `INICIANDO CRIAÇÃO DE AGENDAMENTO: ${DateUtils.toDisplayDateTimeString(appointmentDate)}`
    );
    console.log(`Procedimentos: ${appointment.procedureNames.join(', ')}`);

    // VERIFICAÇÃO FINAL DE DISPONIBILIDADE - Modificado para verificar apenas para esta podóloga
    return this.availabilityService
      .isTimeSlotAvailable(appointmentDate.toISOString(), appointment.podologaId)
      .pipe(
        switchMap(isAvailable => {
          if (!isAvailable) {
            console.error(`❌ HORÁRIO ${formattedTime} OCUPADO - Criação de agendamento rejeitada`);
            return throwError(
              () =>
                new Error(
                  `O horário ${formattedTime} já está ocupado por outro agendamento. Por favor, escolha outro horário.`
                )
            );
          }

          console.log(`✅ Horário ${formattedTime} confirmado como DISPONÍVEL`);

          // Adicionar campos importantes para facilitar consultas
          const timeSlot = `${appointmentDate.getHours().toString().padStart(2, '0')}:${appointmentDate.getMinutes().toString().padStart(2, '0')}`;

          // Preparar o agendamento (status inicial = 'agendado')
          const appointmentData = {
            ...appointment,
            status: 'agendado',
            createdAt: DateUtils.toISOString(new Date()),
            // Adicionar campos essenciais para consultas
            timeSlot: timeSlot,
            timestamp: appointmentDate.getTime(),
          };

          // Remover id se presente (para o Firestore gerar um novo)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...newAppointmentData } = appointmentData;

          console.log(`Salvando agendamento com timestamp: ${appointmentDate.getTime()}`);

          // Adicionar ao Firestore
          return from(addDoc(appointmentsRef, newAppointmentData)).pipe(
            map(docRef => {
              console.log(`✅ AGENDAMENTO CRIADO COM SUCESSO - ID: ${docRef.id}`);

              // Criar objeto do novo agendamento com ID
              const newAppointment = {
                ...appointmentData,
                id: docRef.id,
              } as Appointment;

              // Atualizar a lista local de agendamentos
              const currentAppointments = this.appointmentsSubject.getValue();
              this.appointmentsSubject.next([...currentAppointments, newAppointment]);

              // Invalidar cache para forçar recarga dos dados
              this.invalidateCache(appointmentDate);

              // Notificar o usuário
              this.notificationService.success('Agendamento criado com sucesso!');

              return newAppointment;
            })
          );
        }),
        // Substituir o catchError por nosso handler centralizado
        this.errorHandler.handleObservableError('AppointmentService.createAppointment')
      );
  }

  /**
   * Verifica se uma data é um feriado
   */
  isHoliday(date: Date): boolean {
    return this.holidayService.isHoliday(date);
  }

  /**
   * Verifica se uma data é dia útil (não é final de semana nem feriado)
   */
  isBusinessDay(date: Date): boolean {
    return this.availabilityService.isBusinessDay(date);
  }

  /**
   * Verifica se um horário está disponível GLOBALMENTE (todas as podólogas)
   * @param dateTime Data e hora a serem verificados
   * @returns Observable que emite true se o horário estiver globalmente disponível
   */
  isGlobalTimeSlotAvailable(dateTime: Date): Observable<boolean> {
    return this.availabilityService.isGlobalTimeSlotAvailable(dateTime);
  }

  /**
   * Verifica se um horário está disponível para uma podóloga específica
   * @param dateTime Data e hora a serem verificados
   * @param podologaId ID da podóloga
   * @returns Observable que emite true se o horário estiver disponível
   */
  isTimeSlotAvailable(dateTime: Date, podologaId: string): Observable<boolean> {
    return this.availabilityService.isTimeSlotAvailable(dateTime.toISOString(), podologaId);
  }

  /**
   * Permite verificar ignorando um agendamento específico (útil para edições)
   * @param dateTime Nova data/hora
   * @param podologaId ID da podóloga
   */
  isTimeSlotAvailableForUpdate(dateTime: Date, podologaId: string): Observable<boolean> {
    return this.availabilityService.isTimeSlotAvailableForUpdate(dateTime, podologaId);
  }

  /**
   * Retorna os horários disponíveis para um dia específico
   * Usando lógica simplificada e corrigida para garantir precisão
   */
  getAvailableTimeSlots(date: Date, podologaId: string): Observable<string[]> {
    return this.availabilityService.getAvailableTimeSlots(date, podologaId);
  }

  /**
   * Retorna os agendamentos de um cliente específico
   */
  getAppointmentsByClient(clientId: string | number): Observable<Appointment[]> {
    return this.queryService.getAppointmentsByClient(clientId.toString());
  }

  /**
   * Retorna os agendamentos em um intervalo de datas específico
   * @param startDate Data de início no formato yyyy-MM-dd
   * @param endDate Data de fim no formato yyyy-MM-dd
   */
  getAppointmentsByDateRange(startDate: string, endDate: string): Observable<Appointment[]> {
    // Converter strings para Date
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    return this.queryService.getAppointmentsByDateRange(startDateObj, endDateObj);
  }

  /**
   * Método alternativo para recuperar agendamentos por intervalo de datas
   * Usa um intervalo completo do dia para pegar todos os agendamentos
   */
  getAllAppointmentsForRange(startDate: Date, endDate: Date): Observable<Appointment[]> {
    return this.queryService.getAllAppointmentsForRange(startDate, endDate);
  }

  /**
   * Cancela um agendamento
   */
  cancelAppointment(appointment: Appointment | string): Observable<Appointment> {
    console.log('[DEBUG-CRITICAL] AppointmentService.cancelAppointment - iniciando cancelamento');

    // Se for uma string (ID), criar objeto mínimo
    const appointmentObj =
      typeof appointment === 'string' ? ({ id: appointment } as Appointment) : appointment;

    console.log('[DEBUG-CRITICAL] Agendamento a ser cancelado:', appointmentObj);

    if (!appointmentObj || !appointmentObj.id) {
      console.error('[DEBUG-CRITICAL] Agendamento sem ID válido!');
      return throwError(() => new Error('ID de agendamento inválido'));
    }

    // Usar o serviço de status diretamente
    return this.statusService.cancelAppointment(appointmentObj).pipe(
      tap(result => {
        console.log('[DEBUG-CRITICAL] Resultado do cancelamento:', result);

        // Invalidar explicitamente o cache para este dia
        if (appointmentObj.dateTime) {
          const appointmentDate = new Date(appointmentObj.dateTime);
          console.log('[DEBUG-CRITICAL] Invalidando cache para a data:', appointmentDate);
          this.invalidateCache(appointmentDate);
        }

        // Recarregar os dados em tempo real após cancelamento
        console.log('[DEBUG-CRITICAL] Forçando recarga em tempo real após cancelamento');
        if (appointmentObj.dateTime) {
          const date = new Date(appointmentObj.dateTime);
          const formattedDate = this.formatDateForQuery(date);
          this.reloadAppointmentsRealtime(formattedDate);
        } else {
          // Se não temos data do agendamento, recarregar tudo
          this.setupRealtimeUpdates();
        }
      }),
      catchError(error => {
        console.error('[DEBUG-CRITICAL] Erro no cancelamento:', error);

        // Tentar relatar informações adicionais para debug
        if (error && error.code) {
          console.error(`[DEBUG-CRITICAL] Código de erro: ${error.code}`);
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * Confirma um agendamento
   */
  confirmAppointment(appointment: Appointment | string): Observable<Appointment> {
    // Verificar se o usuário atual tem permissão para manipular agendamentos
    if (!this.canManageAppointment()) {
      console.error('Usuário sem permissão para confirmar agendamentos');
      return throwError(() => new Error('Você não tem permissão para confirmar agendamentos.'));
    }

    return this.statusService
      .confirmAppointment(appointment)
      .pipe(tap(() => this.setupRealtimeUpdates()));
  }

  /**
   * Finaliza um agendamento e o marca como completo
   */
  completeAppointment(
    appointment: Appointment | string,
    paymentMethod?: 'dinheiro' | 'pix' | 'cartao'
  ): Observable<Appointment> {
    // Verificar se o usuário atual tem permissão para manipular agendamentos
    if (!this.canManageAppointment()) {
      console.error('Usuário sem permissão para finalizar agendamentos');
      return throwError(() => new Error('Você não tem permissão para finalizar agendamentos.'));
    }

    return this.statusService
      .completeAppointment(appointment, paymentMethod)
      .pipe(tap(() => this.setupRealtimeUpdates()));
  }

  /**
   * Adiciona um novo feriado à lista
   */
  addHoliday(date: Date, description?: string): void {
    this.holidayService.addHoliday(date, description);
  }

  /**
   * Retorna a lista de feriados
   */
  getHolidays(): Date[] {
    return this.holidayService.getHolidays();
  }

  /**
   * Debugging: Retorna todos os agendamentos para uma data e profissional específicos
   * independente do status, para ajudar a diagnosticar problemas de disponibilidade
   */
  debugAppointmentsForDateAndPodologa(
    date: Date,
    podologaId: string
  ): Observable<Record<string, unknown>[]> {
    return this.queryService.getAppointmentsByPodologaAndDate(podologaId, date).pipe(
      map(appointments => {
        return appointments.map(apt => {
          const aptDate = new Date(apt.dateTime);
          return {
            id: apt.id,
            ...apt,
            dateTimeFormatted: DateUtils.toDisplayDateTimeString(aptDate),
          };
        });
      })
    );
  }

  /**
   * Função de manutenção: Limpa agendamentos cancelados antigos
   * para resolver problemas de disponibilidade de horários
   */
  cleanupCanceledAppointments(): Observable<string[]> {
    console.log('Iniciando limpeza de agendamentos cancelados antigos...');
    const appointmentsRef = collection(this.firestore, this.appointmentsCollection);

    // Buscar agendamentos cancelados
    const q = query(appointmentsRef, where('status', '==', 'cancelado'));

    return from(getDocs(q)).pipe(
      map(snapshot => {
        console.log(`Total de agendamentos cancelados: ${snapshot.size}`);
        const threshold = new Date();
        threshold.setDate(threshold.getDate() - 30); // 30 dias atrás

        const deletedIds: string[] = [];

        snapshot.forEach(docSnapshot => {
          const data = docSnapshot.data() as Appointment;
          const appointmentDate = new Date(data.dateTime);

          // Se o agendamento for de mais de 30 dias atrás
          if (appointmentDate < threshold) {
            console.log(
              `Apagando agendamento cancelado de ${appointmentDate.toLocaleDateString()}`
            );
            // Armazenar ID para retornar
            deletedIds.push(docSnapshot.id);
          }
        });

        console.log(`${deletedIds.length} agendamentos cancelados antigos processados`);
        return deletedIds;
      }),
      catchError(error => {
        console.error('Erro ao limpar agendamentos cancelados:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtém o nome de um cliente pelo ID
   */
  getClientName(clientId: string | number): Observable<string> {
    return this.queryService.getClientName(clientId);
  }

  /**
   * DEBUG: Método para recuperar todos os agendamentos diretamente do banco
   * Usado apenas para diagnóstico
   */
  debugGetAllAppointments(): Observable<Appointment[]> {
    return this.queryService.debugGetAllAppointments();
  }
}
