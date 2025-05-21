import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Subscription } from 'rxjs';

// Componentes de diálogo
import { NovoAgendamentoAdminComponent } from './novo-agendamento-admin/novo-agendamento-admin.component';
import { Appointment } from '../../../models/appointment.model';
import { DailyCashReport, ExpenseCategory } from '../../../models/cashier.model';
import { AppointmentService } from '../../../services/appointment.service';
import { CashierService } from '../../../services/cashier.service';
import { LoggingService } from '../../../services/logging.service';
import { NotificationService } from '../../../services/notification.service';
import { PaymentMethodDialogComponent } from '../../../shared/components/dialogs/payment-method-dialog/payment-method-dialog.component';
import { DateUtils } from '../../../shared/utils/date-utils';

@Component({
  selector: 'app-agenda-admin',
  templateUrl: './agenda-admin.component.html',
  styleUrls: ['./agenda-admin.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AgendaAdminComponent implements OnInit, OnDestroy {
  selectedDate: Date = new Date();
  appointments: Appointment[] = [];
  timeSlots: string[] = [
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

  // Mapeamento das Podólogas para colunas na vista
  podologasDisplay = [
    { id: '4', nome: 'CLAUDIA', coluna: 0 },
    { id: '1', nome: 'VALDENICE', coluna: 1 },
    { id: '2', nome: 'SONIA', coluna: 2 },
    { id: '3', nome: '', coluna: 3 }, // Coluna vazia ou para outra podóloga
  ];

  loading = false;
  currentMonth: string = '';
  currentYear: number = 0;
  checkingAvailability: boolean = false;
  availableTimeSlots: { [key: string]: boolean } = {}; // Mapa de horários disponíveis

  // Filtro para desabilitar finais de semana e feriados
  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    // Verificar se é um dia útil (não é fim de semana nem feriado)
    return this.appointmentService.isBusinessDay(date);
  };

  // Propriedades para registro de despesas
  expenseDescription: string = '';
  expenseAmount: number | null = null;
  expenseCategory: string = '';
  expenseMessage: string = '';

  // Relatório diário
  dailyReport: DailyCashReport | null = null;

  // Cache local de agendamentos
  private appointmentsCache = new Map<string, Appointment[]>();
  private _appointmentsByTimeAndPodologa = new Map<string, Appointment[]>();
  private subscriptions = new Subscription();
  private pendingLoadTimer: number | null = null;

  // Timer para atualização automática
  private autoRefreshTimer: number | null = null;
  private readonly REFRESH_INTERVAL = 10000; // 10 segundos
  private forceInitialLoad = true;

  constructor(
    private appointmentService: AppointmentService,
    private notificationService: NotificationService,
    private cashierService: CashierService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private logger: LoggingService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // Configurar a data atual
    this.selectedDate = new Date();
    // Remover horas, minutos, segundos e milissegundos para evitar problemas
    this.selectedDate.setHours(0, 0, 0, 0);

    this.logger.debug('Inicializando AgendaAdminComponent');
    this.logger.debug(`Data selecionada: ${this.selectedDate.toLocaleDateString()}`);

    // Atualizar mês e ano primeiro para exibição no cabeçalho
    this.updateMonthYear();

    // Verificar e carregar a partir do cache local primeiro
    this.tryLoadFromLocalStorage();

    // Configurar escuta em tempo real para os agendamentos
    this.setupRealtimeListener();
  }

  ngOnDestroy(): void {
    // Cancelar todas as assinaturas
    this.subscriptions.unsubscribe();

    // Limpar timers
    if (this.pendingLoadTimer) {
      clearTimeout(this.pendingLoadTimer);
    }

    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
    }
  }

  /**
   * Tenta carregar dados do localStorage para mostrar algo rapidamente
   */
  private tryLoadFromLocalStorage(): void {
    try {
      const today = new Date().toISOString().split('T')[0];
      const cacheKey = `agenda_appointments_${today}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        const data = JSON.parse(cached);
        if (data && Array.isArray(data.appointments)) {
          // Mostrar dados do cache enquanto carrega dados frescos
          this.appointments = data.appointments;
          this.logger.info('Carregados dados temporários do cache local');
          this.cdr.detectChanges();
        }
      }
    } catch (error) {
      this.logger.error('Erro ao carregar do cache local:', error);
    }
  }

  /**
   * Salva dados no cache local para carregamento rápido futuro
   */
  private saveToLocalStorage(): void {
    try {
      const today = this.selectedDate.toISOString().split('T')[0];
      const data = {
        appointments: this.appointments,
        timestamp: Date.now(),
      };
      localStorage.setItem(`agenda_appointments_${today}`, JSON.stringify(data));
      this.logger.info('Dados da agenda salvos no cache local');
    } catch (error) {
      this.logger.error('Erro ao salvar no cache local:', error);
    }
  }

  updateMonthYear(): void {
    const months = [
      'JANEIRO',
      'FEVEREIRO',
      'MARÇO',
      'ABRIL',
      'MAIO',
      'JUNHO',
      'JULHO',
      'AGOSTO',
      'SETEMBRO',
      'OUTUBRO',
      'NOVEMBRO',
      'DEZEMBRO',
    ];
    this.currentMonth = months[this.selectedDate.getMonth()];
    this.currentYear = this.selectedDate.getFullYear();
  }

  /**
   * Configura escuta em tempo real para agendamentos
   */
  private setupRealtimeListener(): void {
    // Formatar a data para o listener em tempo real
    const formattedDate = this.formatDateForQuery(this.selectedDate);

    // Iniciar escuta em tempo real para a data selecionada
    this.appointmentService.reloadAppointmentsRealtime(formattedDate);

    // Inscrever-se no observable de agendamentos
    const subscription = this.appointmentService.appointments$.subscribe(appointments => {
      this.logger.info(`Recebidos ${appointments.length} agendamentos em tempo real`);

      if (appointments.length > 0) {
        // Filtrar para a data atual (garantia extra)
        const filteredAppointments = this.filterAppointmentsForCurrentDate(appointments);

        if (filteredAppointments.length > 0) {
          // Comparar com os agendamentos atuais para ver se há novidades
          const currentIds = new Set(this.appointments.map(a => a.id));
          const newAppointments = filteredAppointments.filter(a => !currentIds.has(a.id));

          // Se houver novos agendamentos ou a lista atual estiver vazia
          if (newAppointments.length > 0 || this.appointments.length === 0) {
            this.logger.info(
              `Atualizando agenda com ${filteredAppointments.length} agendamentos (${newAppointments.length} novos)`
            );

            // Atualizar a lista de agendamentos
            this.appointments = filteredAppointments;

            // Atualizar cache
            this.updateLocalCaches(filteredAppointments);

            // Limpar cache de resultados de getAppointmentsForTimeAndPodologa
            this._appointmentsByTimeAndPodologa.clear();

            // Forçar atualização da UI
            this.ngZone.run(() => {
              this.cdr.detectChanges();
            });
          }
        }
      }
    });

    this.subscriptions.add(subscription);
  }

  /**
   * Atualiza os caches locais com novos agendamentos
   * Não precisa mais filtrar agendamentos cancelados, já que são excluídos
   */
  private updateLocalCaches(appointments: Appointment[]): void {
    // Não precisamos mais filtrar por status, já que agendamentos cancelados são excluídos
    console.log(`[DEBUG] Atualizando cache: ${appointments.length} agendamentos`);

    // Cache em memória
    const formattedDate = this.formatDateForQuery(this.selectedDate);
    const cacheKey = `date_${formattedDate}`;
    this.appointmentsCache.set(cacheKey, [...appointments]);

    // Cache em localStorage
    try {
      const today = this.selectedDate.toISOString().split('T')[0];
      const cacheKey = `agenda_appointments_${today}`;
      const data = {
        appointments: appointments,
        timestamp: Date.now(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(data));
      this.logger.info('[DEBUG] Dados da agenda salvos no cache local');
    } catch (error) {
      this.logger.error('[DEBUG] Erro ao salvar no cache local:', error);
    }
  }

  /**
   * Limpa o cache quando a data muda
   */
  onDateChange(): void {
    // Limpar cache de resultados
    this._appointmentsByTimeAndPodologa.clear();

    this.updateMonthYear();

    // Configurar listener em tempo real para a nova data
    const formattedDate = this.formatDateForQuery(this.selectedDate);
    this.appointmentService.reloadAppointmentsRealtime(formattedDate);

    this.loadDailyReport();
  }

  getAppointmentsForTimeAndPodologa(time: string, podologaId: string): Appointment[] {
    if (!time || !podologaId || !this.appointments) {
      return [];
    }

    // Usar uma abordagem mais eficiente de filtragem
    const cacheKey = `${time}_${podologaId}`;
    const cachedResult = this._appointmentsByTimeAndPodologa.get(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    // Evitar recálculos desnecessários
    const filteredAppointments = this.appointments.filter(appointment => {
      // Verificar se o agendamento corresponde a este horário e podóloga
      if (appointment.podologaId !== podologaId) {
        return false;
      }

      // Verificar o horário
      const appointmentTime =
        appointment.timeSlot || this.getAppointmentTimeFromDateTime(appointment);
      return appointmentTime === time;
    });

    // Armazenar o resultado no cache
    this._appointmentsByTimeAndPodologa.set(cacheKey, filteredAppointments);

    return filteredAppointments;
  }

  getAppointmentDisplayText(appointment: Appointment): string {
    // Retorna o nome do cliente e o procedimento
    if (!appointment) return '';

    const clientName = appointment.clientName || 'Cliente';
    const procedure = appointment.procedureNames[0] || 'Procedimento';

    return `${clientName} - ${procedure}`;
  }

  openNovoAgendamento(time: string, podologaId: string): void {
    // Verificar se é dia útil
    if (!this.appointmentService.isBusinessDay(this.selectedDate)) {
      this.notificationService.error(
        'Não é possível agendar em dias não úteis (finais de semana ou feriados).'
      );
      return;
    }

    // Criar a data completa (data + hora)
    const [hours, minutes] = time.split(':').map(Number);
    const appointmentDate = new Date(this.selectedDate);
    appointmentDate.setHours(hours, minutes, 0, 0);

    console.log(
      `DEBUG - Iniciando abertura de novo agendamento às ${time} com podóloga ID ${podologaId}`
    );
    console.log(
      `DEBUG - Usuário atual: ${this.appointmentService['authService'].getCurrentUser()?.name} (${this.appointmentService['authService'].getCurrentUser()?.role})`
    );

    // Verificação visual/interface já passou, agora vamos fazer uma verificação no servidor
    // Mostrar indicador de carregamento
    this.checkingAvailability = true;

    // Verificar disponibilidade apenas para esta podóloga
    this.appointmentService.isTimeSlotAvailable(appointmentDate, podologaId).subscribe({
      next: isAvailable => {
        this.checkingAvailability = false;
        console.log(`DEBUG - Horário disponível? ${isAvailable}`);

        if (!isAvailable) {
          this.showOccupiedMessage(time);
          // Recarregar a agenda para garantir que a UI está atualizada
          this.loadAppointments();
          return;
        }

        // Se disponível, abre o diálogo
        this.openAgendamentoDialog(appointmentDate, podologaId);
      },
      error: error => {
        this.checkingAvailability = false;
        console.error('Erro ao verificar disponibilidade:', error);
        this.notificationService.error('Erro ao verificar disponibilidade do horário.');
      },
    });
  }

  // Método separado para abrir o diálogo de agendamento
  openAgendamentoDialog(appointmentDate: Date, podologaId: string): void {
    console.log(
      `DEBUG - Abrindo diálogo de agendamento para ${appointmentDate.toISOString()} com podóloga ${podologaId}`
    );

    const dialogRef = this.dialog.open(NovoAgendamentoAdminComponent, {
      width: '600px',
      data: {
        date: appointmentDate,
        podologaId: podologaId,
        podologaNome: this.podologasDisplay.find(p => p.id === podologaId)?.nome || '',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`DEBUG - Diálogo fechado com resultado:`, result);

      if (result) {
        // Se o resultado for um objeto Appointment, salvar no serviço
        if (typeof result === 'object' && result.dateTime) {
          console.log('Criando novo agendamento com os dados:', result);

          this.appointmentService.createAppointment(result).subscribe({
            next: newAppointment => {
              console.log('DEBUG - Agendamento criado com sucesso:', newAppointment);
              this.notificationService.success('Agendamento criado com sucesso!');

              // Verificar se o agendamento já está na lista, se não adicionar manualmente
              const appointmentExists = this.appointments.some(apt => apt.id === newAppointment.id);
              if (!appointmentExists) {
                console.log('Adicionando novo agendamento à lista local');
                this.appointments = [...this.appointments, newAppointment];
              }

              // Recarregar todos os agendamentos do servidor para garantir
              this.loadAppointments();
            },
            error: error => {
              console.error('DEBUG - Erro ao criar agendamento:', error);
              this.notificationService.error(
                'Erro ao criar agendamento: ' + (error.message || 'Tente novamente.')
              );
              this.loadAppointments(); // Recarregar para exibir o estado atual
            },
          });
        } else {
          this.loadAppointments();
        }
      }
    });
  }

  // Método para registrar despesa
  registerExpense(): void {
    if (!this.expenseDescription || !this.expenseAmount || !this.expenseCategory) {
      this.expenseMessage = 'Preencha todos os campos da despesa.';
      return;
    }

    const description = `${this.expenseDescription}`;
    const category = this.expenseCategory as ExpenseCategory;

    this.cashierService.registerExpense(description, this.expenseAmount, category).subscribe({
      next: () => {
        this.notificationService.success('Despesa registrada com sucesso!');
        this.expenseMessage = `Despesa "${this.expenseDescription}" (${this.expenseCategory}) no valor de R$ ${this.expenseAmount!.toFixed(2)} registrada.`;

        // Recarregar relatório diário
        this.loadDailyReport();

        // Limpar campos
        this.expenseDescription = '';
        this.expenseAmount = null;
        this.expenseCategory = '';
      },
      error: error => {
        console.error('Erro ao registrar despesa:', error);
        this.notificationService.error('Erro ao registrar despesa. Tente novamente.');
        this.expenseMessage = '';
      },
    });
  }

  /**
   * Método de depuração para fazer diagnóstico profundo de um agendamento específico
   */
  debugAppointment(appointment: Appointment): void {
    console.log('[DEBUG-CRITICAL] ======= DIAGNÓSTICO DE AGENDAMENTO =======');
    console.log('[DEBUG-CRITICAL] ID:', appointment.id);
    console.log('[DEBUG-CRITICAL] Cliente:', appointment.clientName);
    console.log('[DEBUG-CRITICAL] Status atual:', appointment.status);
    console.log('[DEBUG-CRITICAL] Data/Hora:', appointment.dateTime);
    console.log('[DEBUG-CRITICAL] Detalhes completos:', appointment);

    // Verificar se o agendamento está na lista atual
    const inCurrentList = this.appointments.some(a => a.id === appointment.id);
    console.log('[DEBUG-CRITICAL] Presente na lista atual:', inCurrentList);

    // Tentar cancelar diretamente pelo serviço para diagnóstico
    this.forceCancelAppointment(appointment);
  }

  /**
   * Tenta forçar o cancelamento usando abordagem alternativa direta
   * Agora excluindo o documento completamente
   */
  forceCancelAppointment(appointment: Appointment): void {
    console.log('[DEBUG-CRITICAL] Tentando EXCLUIR agendamento usando método alternativo...');

    // Forçar carregamento total antes
    this.loading = true;
    this.cdr.detectChanges();

    // Remover localmente (independente do sucesso do Firebase)
    this.appointments = this.appointments.filter(a => a.id !== appointment.id);
    this._appointmentsByTimeAndPodologa.clear();
    this.cdr.detectChanges();

    // Usar o serviço para excluir
    this.appointmentService.cancelAppointment(appointment).subscribe({
      next: result => {
        console.log('[DEBUG-CRITICAL] Exclusão alternativa - Resultado:', result);
        this.snackBar.open('Agendamento excluído com sucesso (método alternativo)', 'Fechar', {
          duration: 3000,
          panelClass: ['info-snackbar'],
        });

        // Forçar recarga total
        this.forceReloadAgendamentos();
      },
      error: err => {
        console.error('[DEBUG-CRITICAL] Falha na exclusão alternativa:', err);

        // Tentar uma última abordagem manual usando Firebase diretamente
        console.log('[DEBUG-CRITICAL] Tentando apagar documento manualmente...');
        try {
          // Este código seria adicionado aqui, mas como não temos acesso ao Firestore diretamente neste componente,
          // dependeremos do serviço

          this.snackBar.open('Falha na exclusão. Atualizando a visualização.', 'Fechar', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        } catch (error) {
          console.error('[DEBUG-CRITICAL] Falha em todas as abordagens:', error);
        }

        // Forçar recarga total de qualquer forma
        this.forceReloadAgendamentos();
      },
    });
  }

  /**
   * Cancela um agendamento após confirmação do usuário
   * Agora com exclusão completa do documento no Firebase
   */
  cancelAppointment(appointment: Appointment, event: MouseEvent): void {
    // Impedir que o clique propague para o elemento pai
    event.stopPropagation();

    console.log('[DEBUG-CRITICAL] ======= INÍCIO DO PROCESSO DE CANCELAMENTO/EXCLUSÃO =======');
    console.log(
      '[DEBUG-CRITICAL] Iniciando processo para excluir agendamento, ID:',
      appointment.id
    );

    // Exibir mensagem de confirmação usando o snackbar
    const snackBarRef = this.snackBar.open(
      `Deseja cancelar o agendamento de ${appointment.clientName || 'Cliente'}? O registro será completamente removido.`,
      'Confirmar',
      {
        duration: 5000,
        panelClass: ['warning-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      }
    );

    snackBarRef.onAction().subscribe(() => {
      // Mostrar indicador de carregamento
      this.loading = true;
      console.log('[DEBUG-CRITICAL] Confirmação de exclusão aceita pelo usuário');

      // Atualizar o status localmente imediatamente por feedback visual
      const index = this.appointments.findIndex(a => a.id === appointment.id);
      if (index !== -1) {
        // Remover o agendamento completamente da UI imediatamente
        this.appointments = this.appointments.filter(a => a.id !== appointment.id);

        // Limpar o cache para forçar recálculo na UI
        this._appointmentsByTimeAndPodologa.clear();
        this.cdr.detectChanges();
        console.log('[DEBUG-CRITICAL] Agendamento removido da UI local');
      }

      // Excluir o agendamento no Firebase
      console.log(
        '[DEBUG-CRITICAL] Chamando AppointmentService.cancelAppointment (que agora exclui)...'
      );
      this.appointmentService.cancelAppointment(appointment).subscribe({
        next: result => {
          console.log('[DEBUG-CRITICAL] Exclusão bem-sucedida!', result);
          this.snackBar.open('Agendamento cancelado e removido com sucesso', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });

          // Forçar limpeza completa do cache
          this.appointmentsCache.clear();
          this._appointmentsByTimeAndPodologa.clear();

          // Recarregar os agendamentos para garantir sincronização com o servidor
          console.log('[DEBUG-CRITICAL] Forçando recarga completa dos agendamentos...');
          this.forceReloadAgendamentos();

          // Desativar indicador de carregamento
          this.loading = false;
        },
        error: error => {
          console.error('[DEBUG-CRITICAL] Erro ao excluir agendamento:', error);
          this.snackBar.open(
            'Erro ao cancelar agendamento. Tentando método alternativo...',
            'Fechar',
            {
              duration: 5000,
              panelClass: ['error-snackbar'],
            }
          );

          // Tentar restaurar o agendamento na UI se a exclusão falhar
          if (index !== -1 && this.appointments.findIndex(a => a.id === appointment.id) === -1) {
            this.appointments = [...this.appointments, appointment];
            this._appointmentsByTimeAndPodologa.clear();
            this.cdr.detectChanges();
          }

          // Se o método normal falhar, tente o método alternativo
          this.forceCancelAppointment(appointment);
        },
      });
    });
  }

  /**
   * Marca um agendamento como pago e registra no caixa
   */
  markAsPaid(appointment: Appointment, event: MouseEvent): void {
    // Impedir que o clique propague para o elemento pai
    event.stopPropagation();

    // Obter valor sugerido do procedimento
    const valorProcedimento =
      appointment.valorTotal || this.getValorProcedimento(appointment.procedureNames?.[0]);

    // Criar um diálogo personalizado para seleção do método de pagamento
    const dialogRef = this.dialog.open(PaymentMethodDialogComponent, {
      width: '350px',
      data: {
        valor: valorProcedimento,
        clientName: appointment.clientName || 'Cliente',
      },
      panelClass: 'payment-dialog',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Processar o pagamento com o método selecionado
        this.processPayment(appointment, result);
      }
    });
  }

  /**
   * Processa o pagamento com o método selecionado
   */
  private processPayment(
    appointment: Appointment,
    paymentMethod: 'dinheiro' | 'pix' | 'cartao'
  ): void {
    // Fechar qualquer snackbar aberto
    this.snackBar.dismiss();

    // Mostrar indicador de carregamento
    this.loading = true;

    // Atualizar o status localmente primeiro, para impedir cliques múltiplos
    const index = this.appointments.findIndex(a => a.id === appointment.id);
    if (index !== -1) {
      const updatedAppointment = {
        ...this.appointments[index],
        status: 'finalizado' as const,
        paymentMethod: paymentMethod,
      };
      this.appointments[index] = updatedAppointment;

      // Limpar o cache para forçar recálculo na UI
      this._appointmentsByTimeAndPodologa.clear();
      this.cdr.detectChanges();
    }

    // Finalizar o agendamento, passando o método de pagamento
    this.appointmentService.completeAppointment(appointment, paymentMethod).subscribe({
      next: updatedAppointment => {
        // Registrar pagamento no caixa
        this.cashierService
          .registerAppointmentPayment(
            updatedAppointment,
            paymentMethod,
            appointment.clientName || 'Cliente sem nome'
          )
          .subscribe({
            next: () => {
              const methodLabel =
                paymentMethod === 'dinheiro'
                  ? 'Dinheiro'
                  : paymentMethod === 'pix'
                    ? 'PIX'
                    : 'Cartão';

              this.snackBar.open(`Pagamento com ${methodLabel} registrado com sucesso`, 'Fechar', {
                duration: 3000,
                panelClass: ['success-snackbar'],
              });

              // Recarregar os agendamentos e o relatório diário
              this.loadAppointments();
              this.loadDailyReport();
              this.loading = false;
            },
            error: error => {
              console.error('Erro ao registrar pagamento no caixa:', error);
              this.snackBar.open(
                'Erro ao registrar pagamento no caixa. Tente novamente.',
                'Fechar',
                {
                  duration: 5000,
                  panelClass: ['error-snackbar'],
                }
              );
              this.loading = false;

              // Em caso de erro, reverter o status local
              if (index !== -1) {
                this.appointments[index] = appointment;
                this._appointmentsByTimeAndPodologa.clear();
                this.cdr.detectChanges();
              }
            },
          });
      },
      error: error => {
        console.error('Erro ao finalizar agendamento:', error);
        this.snackBar.open('Erro ao finalizar agendamento. Tente novamente.', 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        this.loading = false;

        // Em caso de erro, reverter o status local
        if (index !== -1) {
          this.appointments[index] = appointment;
          this._appointmentsByTimeAndPodologa.clear();
          this.cdr.detectChanges();
        }
      },
    });
  }

  /**
   * Retorna um valor sugerido para um procedimento
   */
  private getValorProcedimento(procedureName?: string): number {
    if (!procedureName) return 80; // Valor padrão

    // Mapeamento de valores comuns
    const valoresProcedimentos: Record<string, number> = {
      'Podologia Básica': 80,
      'Podologia Geral': 100,
      'Podologia Clínica': 120,
      Onicocriptose: 100,
      Retorno: 50,
      Consulta: 80,
    };

    return valoresProcedimentos[procedureName] || 80;
  }

  previousDay(): void {
    const newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    this.selectedDate = newDate;
    this.onDateChange();
  }

  nextDay(): void {
    const newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    this.selectedDate = newDate;
    this.onDateChange();
  }

  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = domingo, 6 = sábado
  }

  isHoliday(date: Date): boolean {
    return this.appointmentService.isHoliday(date);
  }

  // Mostrar mensagem quando tentar agendar em horário ocupado
  showOccupiedMessage(time: string): void {
    this.snackBar.open(
      `Horário ${time} já está ocupado. Por favor, escolha outro horário.`,
      'Fechar',
      {
        duration: 5000,
        panelClass: ['error-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      }
    );
  }

  // Carregar relatório diário
  loadDailyReport(): void {
    const formattedDate = DateUtils.formatDateToYYYYMMDD(this.selectedDate);
    this.cashierService.getTransactionsByDate(formattedDate).subscribe({
      next: report => {
        this.dailyReport = report;
      },
      error: error => {
        console.error('Erro ao carregar relatório diário:', error);
        this.notificationService.error('Erro ao carregar despesas do dia.');
      },
    });
  }

  // Obter label de categoria
  getCategoryLabel(category?: ExpenseCategory): string {
    if (!category) return 'Outros';

    switch (category) {
      case ExpenseCategory.MATERIAL_CONSUMO:
        return 'Material de Consumo';
      case ExpenseCategory.MATERIAL_ESCRITORIO:
        return 'Material de Escritório';
      case ExpenseCategory.EQUIPAMENTOS:
        return 'Equipamentos';
      case ExpenseCategory.MANUTENCAO:
        return 'Manutenção';
      case ExpenseCategory.SERVICOS:
        return 'Serviços';
      default:
        return 'Outros';
    }
  }

  /**
   * Carrega agendamentos usando o novo sistema em tempo real
   */
  loadAppointments(): void {
    this.logger.info('Usando sistema de tempo real para carregar agendamentos');

    // Mostrar indicador de carregamento
    this.loading = true;
    this.cdr.detectChanges();

    // Formatar a data para a consulta
    const formattedDate = this.formatDateForQuery(this.selectedDate);

    // Configurar listener em tempo real
    this.appointmentService.reloadAppointmentsRealtime(formattedDate);

    // Após um pequeno atraso, remover o indicador de carregamento
    setTimeout(() => {
      this.loading = false;
      this.cdr.detectChanges();
    }, 500);
  }

  /**
   * Força o recarregamento dos agendamentos limpo o cache
   */
  forceReloadAgendamentos(): void {
    // Limpar o cache
    const formattedDate = this.formatDateForQuery(this.selectedDate);
    this.appointmentsCache.clear(); // Limpar todo o cache em vez de apenas uma entrada
    this._appointmentsByTimeAndPodologa.clear();

    // Limpar cache localStorage
    try {
      localStorage.removeItem(`agenda_appointments_${formattedDate}`);
    } catch (error) {
      this.logger.error('Erro ao limpar cache local:', error);
    }

    // Limpar o cache no serviço de consultas
    this.appointmentService.invalidateCache(this.selectedDate);

    this.logger.info('Cache limpo, configurando listener em tempo real');

    // Mostrar indicador de carregamento
    this.loading = true;
    this.cdr.detectChanges();

    // Configurar listener em tempo real (que já usa o método mais eficiente)
    this.appointmentService.reloadAppointmentsRealtime(formattedDate);

    // Limpar indicador de carregamento após um tempo
    setTimeout(() => {
      this.loading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  /**
   * Formata a data para a query
   */
  private formatDateForQuery(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Extrai o horário formatado da propriedade dateTime do agendamento
   */
  private getAppointmentTimeFromDateTime(appointment: Appointment): string {
    if (!appointment.dateTime) return '';

    try {
      const date = new Date(appointment.dateTime);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      this.logger.error('Erro ao extrair horário do agendamento', error);
      return '';
    }
  }

  /**
   * Filtra agendamentos para a data atualmente selecionada
   * Como agendamentos cancelados agora são excluídos, não precisamos filtrá-los
   */
  private filterAppointmentsForCurrentDate(appointments: Appointment[]): Appointment[] {
    console.log('[DEBUG] Filtrando agendamentos para a data atual:', this.selectedDate);
    const result = appointments.filter(apt => {
      if (!apt.dateTime) {
        console.log('[DEBUG] Agendamento sem dateTime:', apt.id);
        return false;
      }

      try {
        const aptDate = new Date(apt.dateTime);

        // Verificar se é do mesmo dia
        const sameDay =
          aptDate.getFullYear() === this.selectedDate.getFullYear() &&
          aptDate.getMonth() === this.selectedDate.getMonth() &&
          aptDate.getDate() === this.selectedDate.getDate();

        // Não precisamos verificar o status, já que agendamentos cancelados
        // são completamente excluídos do banco de dados
        return sameDay;
      } catch (error) {
        this.logger.error('Erro ao processar data do agendamento:', error);
        return false;
      }
    });

    console.log(
      `[DEBUG] Total de agendamentos filtrados: ${result.length} de ${appointments.length}`
    );
    return result;
  }
}
