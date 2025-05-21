import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from '@angular/fire/firestore';

import { Observable, catchError, from, map, of, shareReplay, tap } from 'rxjs';

import { LoggingService } from './logging.service';
import { NotificationService } from './notification.service';
import { Appointment } from '../models/appointment.model';

// Interface local estendida para refletir o que está sendo usado no serviço
interface AppointmentExtended extends Appointment {
  date: string;
  timeSlot: string;
  timestamp?: number;
}

interface CacheItem {
  data: AppointmentExtended[];
  timestamp: number;
  key: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppointmentQueryService {
  private readonly CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutos
  private cache = new Map<string, CacheItem>();
  private activeQueries = new Map<string, Observable<AppointmentExtended[]>>();

  constructor(
    private firestore: Firestore,
    private notificationService: NotificationService,
    private logger: LoggingService
  ) {}

  /**
   * Limpa o cache de agendamentos
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.info('Cache de agendamentos limpo');
  }

  /**
   * Gera uma chave para o cache baseada nos parâmetros
   */
  private generateCacheKey(type: string, params: Record<string, unknown>): string {
    return `${type}:${JSON.stringify(params)}`;
  }

  /**
   * Obtém dados do cache se disponíveis e válidos
   */
  private getFromCache(key: string): AppointmentExtended[] | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_EXPIRY_MS) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Salva dados no cache
   */
  private saveToCache(key: string, data: AppointmentExtended[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      key,
    });
  }

  /**
   * Obtém agendamentos por cliente
   * @param clientId ID do cliente
   * @returns Observable com lista de agendamentos
   */
  getAppointmentsByClient(clientId: string): Observable<AppointmentExtended[]> {
    console.log(`Buscando histórico para cliente ID: ${clientId}`);
    const appointmentsRef = collection(this.firestore, 'appointments');
    const q = query(appointmentsRef, where('userId', '==', clientId), orderBy('dateTime', 'desc'));

    return collectionData(q, { idField: 'id' }).pipe(
      map(docs => {
        console.log(`Agendamentos encontrados: ${docs.length}`);
        return docs as AppointmentExtended[];
      }),
      catchError(error => {
        console.error('Erro ao buscar histórico do cliente:', error);
        this.notificationService.error('Não foi possível carregar o histórico do cliente');
        return of([]);
      })
    );
  }

  /**
   * Obtém agendamentos por intervalo de datas com cache
   * @param startDate Data inicial
   * @param endDate Data final
   * @returns Observable com lista de agendamentos
   */
  getAppointmentsByDateRange(startDate: Date, endDate: Date): Observable<AppointmentExtended[]> {
    // Ajustar endDate para incluir todo o dia final
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    // Criar chave de cache
    const params = { start: startDate.toISOString(), end: adjustedEndDate.toISOString() };
    const cacheKey = this.generateCacheKey('dateRange', params);

    // Verificar se já existe uma consulta em andamento
    const activeQuery = this.activeQueries.get(cacheKey);
    if (activeQuery) {
      this.logger.info(
        `Reusing existing query for date range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
      );
      return activeQuery;
    }

    // Verificar cache
    const cachedData = this.getFromCache(cacheKey);
    if (cachedData) {
      this.logger.info(
        `Using cached data for date range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
      );
      return of(cachedData);
    }

    // Converter para timestamp para comparação
    const startTimestamp = startDate.getTime();
    const endTimestamp = adjustedEndDate.getTime();

    this.logger.debug(
      `Buscando agendamentos entre: ${startDate.toLocaleDateString()} e ${endDate.toLocaleDateString()}`
    );

    // Tentar abordagem alternativa que não depende de timestamp
    this.logger.info(
      `Experimentando consulta alternativa para a data ${startDate.toLocaleDateString()}`
    );

    // Alternativa 1: Consulta sem filtros de timestamp para depuração
    const appointmentsRef = collection(this.firestore, 'appointments');
    const q = query(appointmentsRef);

    // Executar a consulta
    const queryObservable = from(getDocs(q)).pipe(
      map(querySnapshot => {
        const allAppointments: AppointmentExtended[] = [];
        querySnapshot.forEach(doc => {
          const data = doc.data() as AppointmentExtended;
          allAppointments.push({
            ...data,
            id: doc.id,
          });
        });

        this.logger.debug(`Recuperados ${allAppointments.length} agendamentos no total`);

        // Filtrar manualmente por data para garantir
        const filteredAppointments = allAppointments.filter(appointment => {
          try {
            if (!appointment.dateTime) return false;

            const appointmentDate = new Date(appointment.dateTime);
            const appointmentTimestamp = appointmentDate.getTime();

            const isInRange =
              appointmentTimestamp >= startTimestamp && appointmentTimestamp <= endTimestamp;

            if (isInRange) {
              this.logger.debug(
                `Encontrado agendamento para ${appointmentDate.toLocaleDateString()}: ${appointment.clientName}`
              );
            }

            return isInRange;
          } catch (error) {
            this.logger.error(`Erro ao processar data do agendamento ${appointment.id}`, error);
            return false;
          }
        });

        this.logger.debug(
          `Encontrados ${filteredAppointments.length} agendamentos no período após filtro manual`
        );

        // Salva no cache
        this.saveToCache(cacheKey, filteredAppointments);
        return filteredAppointments;
      }),
      catchError(error => {
        this.logger.error('Erro ao obter agendamentos por intervalo de data:', error);
        this.notificationService.error(
          'Não foi possível carregar os agendamentos para este período'
        );
        return of([]);
      }),
      // Compartilhar a mesma resposta para várias assinaturas
      shareReplay(1),
      tap(() => {
        // Remover a consulta ativa após conclusão
        setTimeout(() => {
          this.activeQueries.delete(cacheKey);
        }, 100);
      })
    );

    // Armazenar a consulta ativa
    this.activeQueries.set(cacheKey, queryObservable);
    return queryObservable;
  }

  /**
   * Obtém agendamentos por data com cache eficiente
   * @param date Data dos agendamentos
   * @returns Observable com lista de agendamentos
   */
  getAppointmentsByDate(date: Date): Observable<AppointmentExtended[]> {
    // Define o início do dia (00:00:00)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    // Define o fim do dia (23:59:59.999)
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getAppointmentsByDateRange(startOfDay, endOfDay);
  }

  /**
   * Obtém agendamentos por data
   * @param date Data dos agendamentos
   * @returns Observable com lista de agendamentos
   */
  getAppointmentsByDateRangeOld(date: Date): Observable<AppointmentExtended[]> {
    // Define o início do dia (00:00:00)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    // Define o fim do dia (23:59:59.999)
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointmentsRef = collection(this.firestore, 'appointments');
    const q = query(
      appointmentsRef,
      where('timestamp', '>=', startOfDay.getTime()),
      where('timestamp', '<=', endOfDay.getTime()),
      orderBy('timestamp', 'asc')
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map(docs => docs as AppointmentExtended[]),
      catchError(error => {
        console.error('Erro ao obter agendamentos para a data:', error);
        this.notificationService.error('Não foi possível carregar os agendamentos para esta data');
        return of([]);
      })
    );
  }

  /**
   * Obtém todos os agendamentos (geralmente usado apenas para depuração)
   * @returns Observable com lista de agendamentos
   */
  getAllAppointments(): Observable<AppointmentExtended[]> {
    const appointmentsRef = collection(this.firestore, 'appointments');

    return collectionData(appointmentsRef, { idField: 'id' }).pipe(
      map(docs => docs as AppointmentExtended[]),
      catchError(error => {
        console.error('Erro ao obter todos os agendamentos:', error);
        this.notificationService.error('Não foi possível carregar os agendamentos');
        return of([]);
      })
    );
  }

  /**
   * Obtém um agendamento específico por ID
   * @param appointmentId ID do agendamento
   * @returns Observable com o agendamento
   */
  getAppointmentById(appointmentId: string): Observable<AppointmentExtended | null> {
    const appointmentRef = doc(this.firestore, `appointments/${appointmentId}`);

    return from(getDoc(appointmentRef)).pipe(
      map(docSnap => {
        if (!docSnap.exists()) {
          return null;
        }
        return { id: docSnap.id, ...docSnap.data() } as AppointmentExtended;
      }),
      catchError(error => {
        console.error('Erro ao obter agendamento por ID:', error);
        this.notificationService.error('Não foi possível carregar os detalhes do agendamento');
        return of(null);
      })
    );
  }

  /**
   * Obtém agendamentos por podóloga e data com cache
   * @param podologaId ID da podóloga
   * @param date Data dos agendamentos
   * @returns Observable com lista de agendamentos
   */
  getAppointmentsByPodologaAndDate(
    podologaId: string,
    date: Date
  ): Observable<AppointmentExtended[]> {
    // Criar chave de cache
    const params = { podologaId, date: date.toISOString() };
    const cacheKey = this.generateCacheKey('podologaDate', params);

    // Verificar se já existe uma consulta em andamento
    const activeQuery = this.activeQueries.get(cacheKey);
    if (activeQuery) {
      return activeQuery;
    }

    // Verificar cache
    const cachedData = this.getFromCache(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    // Define o início do dia (00:00:00)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    // Define o fim do dia (23:59:59.999)
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointmentsRef = collection(this.firestore, 'appointments');
    const q = query(
      appointmentsRef,
      where('podologaId', '==', podologaId),
      where('timestamp', '>=', startOfDay.getTime()),
      where('timestamp', '<=', endOfDay.getTime()),
      orderBy('timestamp', 'asc')
    );

    const queryObservable = collectionData(q, { idField: 'id' }).pipe(
      map(docs => {
        const appointments = docs as AppointmentExtended[];
        this.saveToCache(cacheKey, appointments);
        return appointments;
      }),
      catchError(error => {
        this.logger.error('Erro ao obter agendamentos por podóloga e data:', error);
        this.notificationService.error(
          'Não foi possível carregar os agendamentos para esta podóloga'
        );
        return of([]);
      }),
      shareReplay(1),
      tap(() => {
        setTimeout(() => {
          this.activeQueries.delete(cacheKey);
        }, 100);
      })
    );

    this.activeQueries.set(cacheKey, queryObservable);
    return queryObservable;
  }

  /**
   * Obtém o nome de um cliente pelo ID
   * @param clientId ID do cliente
   * @returns Observable com o nome do cliente
   */
  getClientName(clientId: string | number): Observable<string> {
    const clientRef = doc(this.firestore, `users/${clientId.toString()}`);

    return from(getDoc(clientRef)).pipe(
      map(docSnap => {
        if (!docSnap.exists()) {
          return 'Cliente não encontrado';
        }
        const userData = docSnap.data();
        return userData['name'] || 'Cliente sem nome';
      }),
      catchError(error => {
        console.error('Erro ao obter nome do cliente:', error);
        return of('Erro ao carregar cliente');
      })
    );
  }

  /**
   * Obtém todos os agendamentos para um intervalo de datas completo
   * @param startDate Data inicial
   * @param endDate Data final
   * @returns Observable com lista de agendamentos
   */
  getAllAppointmentsForRange(startDate: Date, endDate: Date): Observable<AppointmentExtended[]> {
    return this.getAppointmentsByDateRange(startDate, endDate);
  }

  /**
   * DEBUG: Método para recuperar todos os agendamentos diretamente do banco
   * Usado apenas para diagnóstico
   */
  debugGetAllAppointments(): Observable<AppointmentExtended[]> {
    return this.getAllAppointments();
  }

  /**
   * Invalida o cache para uma data específica
   * @param date Data para invalidar no cache
   */
  invalidateCacheForDate(date: Date): void {
    const dateStr = date.toISOString().split('T')[0];
    // Percorrer todas as entradas do cache e remover as relacionadas a esta data
    for (const [key] of this.cache.entries()) {
      if (key.includes(dateStr)) {
        this.cache.delete(key);
      }
    }
    this.logger.info(`Cache invalidado para a data: ${date.toLocaleDateString()}`);
  }
}
