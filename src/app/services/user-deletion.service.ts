import { Injectable } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from '@angular/fire/firestore';

import { Observable, forkJoin, from, of, throwError } from 'rxjs';

import { catchError, map, switchMap } from 'rxjs/operators';

import { AppointmentService } from './appointment.service';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { UserService } from './user.service'; // Added UserService import here
import { Appointment } from '../models/appointment.model';
import { User } from '../models/user.model';
import { DateUtils } from '../shared/utils/date-utils';

/**
 * Interface para usuário anonimizado após exclusão
 */
interface DeletedUser {
  hash_cpf: string; // Hash do CPF para verificações futuras
  anonymized_id: string; // ID anônimo para referência
  deletion_date: string; // Data da exclusão
  reason: string; // Motivo da exclusão
  has_issues: boolean; // Flag para problemas
  issue_records?: UserIssue[]; // Registros de problemas (opcional)
  appointment_history?: AnonymizedAppointment[]; // Histórico de agendamentos (opcional)
  medical_conditions?: Record<string, unknown>; // Condições médicas importantes (opcional)
  [key: string]: unknown;
}

// Interface para agendamentos anônimos
interface AnonymizedAppointment {
  id?: string;
  date_time: string;
  procedures: string[];
  status: string;
  payment_status?: string;
  service_type?: string;
  podologa_id?: string;
  observations?: string;
  medical_info?: Record<string, unknown>;
}

// Interface para problemas do usuário
interface UserIssue {
  type: string;
  count: number;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserDeletionService {
  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private notificationService: NotificationService,
    private userService: UserService // Added UserService injection here
  ) {}

  /**
   * Gera um hash simples para o CPF (em produção, use um algoritmo mais robusto)
   */
  private generateCpfHash(cpf: string): string {
    // Remover caracteres não numéricos
    const cleanCpf = cpf.replace(/\D/g, '');

    // Criar um hash simples para este exemplo
    // Em produção, considere usar um algoritmo de hash mais robusto
    let hash = 0;
    for (let i = 0; i < cleanCpf.length; i++) {
      const char = cleanCpf.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Converter para inteiro 32 bits
    }

    // Converter para string hexadecimal
    return 'CPF_' + Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Gera ID anonimizado para o usuário excluído
   */
  private generateAnonymizedId(): string {
    // Gerar um ID aleatório com prefixo para indicar que é um usuário anônimo
    const randomPart = Math.random().toString(36).substring(2, 10);
    const timestamp = Date.now().toString(36);

    return `ANON_${timestamp}_${randomPart}`;
  }

  /**
   * Verifica se há problemas registrados para o usuário
   */
  private checkUserIssues(userId: string): Observable<UserIssue[]> {
    const issues: UserIssue[] = [];

    // Verificar se há agendamentos pendentes
    return this.appointmentService.getAppointmentsByClient(userId).pipe(
      map(appointments => {
        const pendingAppointments = appointments.filter(
          apt => apt.status === 'agendado' || apt.status === 'confirmado'
        );

        if (pendingAppointments && pendingAppointments.length > 0) {
          issues.push({
            type: 'PENDING_APPOINTMENTS',
            count: pendingAppointments.length,
            description: `Cliente possui ${pendingAppointments.length} agendamento(s) pendente(s)`,
          });
        }
        return issues;
      })
    );
  }

  /**
   * Implementa o processo completo de exclusão de usuário com anonimização
   */
  deleteUserAndAnonymize(
    userId: string,
    reason: string = 'solicitação do cliente'
  ): Observable<boolean> {
    // 1. Buscar dados do usuário
    return this.authService.getClientById(userId).pipe(
      switchMap(userData => {
        if (!userData) {
          return throwError(() => new Error('Usuário não encontrado'));
        }

        // 2. Criar hash do CPF para referência futura
        const hashedCpf = this.generateCpfHash(userData.cpf);

        // 3. Verificar problemas do usuário
        return this.checkUserIssues(userId).pipe(
          switchMap(issues => {
            // 4. Buscar agendamentos do usuário para preservar histórico anônimo
            return this.appointmentService.getAppointmentsByClient(userId).pipe(
              map(appointments => {
                // 5. Criar registro anônimo para preservar histórico
                const anonymizedUser: DeletedUser = {
                  hash_cpf: hashedCpf,
                  anonymized_id: this.generateAnonymizedId(),
                  deletion_date: DateUtils.toISOString(new Date()),
                  reason: reason,
                  has_issues: issues.length > 0,
                  issue_records: issues.length > 0 ? issues : undefined,
                  appointment_history: this.formatAnonymizedAppointments(appointments),
                  medical_conditions: this.extractMedicalConditions(userData),
                };

                // Remover campos undefined
                Object.keys(anonymizedUser).forEach(key => {
                  if (anonymizedUser[key as keyof DeletedUser] === undefined) {
                    delete anonymizedUser[key as keyof DeletedUser];
                  }
                });

                return { userData, anonymizedUser, appointments };
              })
            );
          })
        );
      }),
      // 6. Salvar registro anônimo na coleção de usuários excluídos
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      switchMap(({ userData, anonymizedUser, appointments }) => {
        const deletedUsersCollection = collection(this.firestore, 'deletedUsers');

        return from(addDoc(deletedUsersCollection, anonymizedUser)).pipe(
          // 7. Excluir dados do usuário e relacionados
          switchMap(docRef => {
            console.log(`Registro anônimo criado com ID: ${docRef.id}`);

            // Conjunto de tarefas a executar
            const deletionTasks: Observable<boolean>[] = [];

            // 7b. Excluir agendamentos (opcional - você pode decidir manter esses registros)
            // Alternativa: Você poderia anonimizar esses registros em vez de excluí-los
            // eslint-disable-next-line no-constant-condition
            if (this.shouldDeleteAppointments()) {
              // Implementado como método para evitar condição constante
              const appointmentIds = appointments.filter(a => a.id).map(a => a.id as string);
              for (const aptId of appointmentIds) {
                deletionTasks.push(
                  from(deleteDoc(doc(this.firestore, 'appointments', aptId))).pipe(
                    map(() => true),
                    catchError(error => {
                      console.error(`Erro ao excluir agendamento ${aptId}:`, error);
                      return of(false);
                    })
                  )
                );
              }
            }

            // 7c. Finalmente, excluir o usuário
            deletionTasks.push(
              this.userService.deleteUser(userId).pipe(
                catchError(error => {
                  console.error('Erro ao excluir usuário:', error);
                  return of(false);
                })
              )
            );

            // Executar todas as tarefas de exclusão
            return forkJoin(deletionTasks).pipe(
              map(results => {
                // Se todas as operações foram bem-sucedidas
                const allSucceeded = results.every(result => result === true);
                if (allSucceeded) {
                  this.notificationService.success('Usuário excluído com sucesso');
                } else {
                  this.notificationService.warning(
                    'Usuário excluído, mas alguns dados podem não ter sido removidos completamente'
                  );
                }
                return true;
              }),
              catchError(error => {
                console.error('Erro durante o processo de exclusão:', error);
                this.notificationService.error('Erro ao excluir usuário');
                return of(false);
              })
            );
          })
        );
      }),
      catchError(error => {
        console.error('Erro no processo de exclusão:', error);
        this.notificationService.error('Erro ao processar exclusão do usuário');
        return of(false);
      })
    );
  }

  /**
   * Método que controla se agendamentos devem ser excluídos
   * Implementado como método para evitar condição constante no código
   */
  private shouldDeleteAppointments(): boolean {
    return false; // Desativado por padrão - decisão de negócio
  }

  /**
   * Formata agendamentos para armazenamento anônimo
   */
  private formatAnonymizedAppointments(appointments: Appointment[]): AnonymizedAppointment[] {
    if (!appointments || appointments.length === 0) {
      return [];
    }

    return appointments.map(apt => {
      // Criar uma versão anônima do agendamento com apenas os dados necessários
      const anonymized: AnonymizedAppointment = {
        id: apt.id,
        date_time: apt.dateTime,
        procedures: apt.procedureNames || [],
        status: apt.status,
        payment_status: 'pago', // Informação fictícia; ajuste conforme seu modelo de dados
        podologa_id: apt.podologaId,
        observations: apt.podologaNome, // Usando o nome como observação para exemplo
        medical_info: this.extractMedicalInfo(apt),
      };

      // Remover campos undefined
      Object.keys(anonymized).forEach(key => {
        if (anonymized[key as keyof AnonymizedAppointment] === undefined) {
          delete anonymized[key as keyof AnonymizedAppointment];
        }
      });

      return anonymized;
    });
  }

  /**
   * Extrai informações médicas de um agendamento para preservar dados relevantes
   */
  private extractMedicalInfo(appointment: Appointment): Record<string, unknown> | undefined {
    // Este é um método de espaço reservado - não temos campos médicos no appointment
    // Em uma implementação real, você extrairia dados médicos do agendamento

    const medicalInfo: Record<string, unknown> = {};

    // Exemplo fictício - ajuste conforme seu modelo de dados real
    medicalInfo['procedures'] = appointment.procedures;

    return Object.keys(medicalInfo).length > 0 ? medicalInfo : undefined;
  }

  /**
   * Extrai condições médicas dos dados do usuário para preservação anônima
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private extractMedicalConditions(userData: User): Record<string, unknown> | undefined {
    // Este é um espaço reservado para a lógica de extração de condições médicas
    // Implemente conforme necessário com base nos dados do usuário

    // Por exemplo, você pode extrair informações como:
    // - Diabético
    // - Hipertenso
    // - Alergias
    // - Outras condições médicas relevantes

    // Retornando undefined por padrão até que a implementação seja necessária
    return undefined;
  }

  /**
   * Verifica se um CPF específico tem histórico de problemas
   * Útil para filtrar novos cadastros de clientes problemáticos
   */
  checkCpfForIssues(cpf: string): Observable<{
    hasIssues: boolean;
    previouslyDeleted: boolean;
    issues?: UserIssue[];
    deletionDate?: string;
  }> {
    // Gerar hash do CPF para busca
    const hashedCpf = this.generateCpfHash(cpf);

    // Buscar em deletedUsers
    const deletedUsersCollection = collection(this.firestore, 'deletedUsers');
    const q = query(deletedUsersCollection, where('hash_cpf', '==', hashedCpf));

    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (snapshot.empty) {
          // Nenhum registro encontrado
          return {
            hasIssues: false,
            previouslyDeleted: false,
          };
        }

        // CPF encontrado - obter dados do primeiro documento
        const userData = snapshot.docs[0].data() as DeletedUser;

        // Verificar a data da exclusão para análise de tempo
        const deletionDate = userData.deletion_date;
        let formattedDate = '';

        if (deletionDate) {
          const date = new Date(deletionDate);
          formattedDate = DateUtils.toDisplayDateString(date);
        }

        // Verificar se existem problemas registrados
        const hasIssues = userData.has_issues || false;

        return {
          hasIssues: hasIssues,
          previouslyDeleted: true,
          issues: userData.issue_records || [],
          deletionDate: formattedDate || userData.deletion_date,
        };
      }),
      catchError(error => {
        console.error('Erro ao verificar CPF:', error);
        return of({
          hasIssues: false,
          previouslyDeleted: false,
        });
      })
    );
  }
}
