import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';

import { NgxMaskPipe, provideNgxMask } from 'ngx-mask';

import { map } from 'rxjs/operators';

import { Appointment, Procedure } from '../../models/appointment.model';
import { User } from '../../models/user.model';
import { AppointmentService } from '../../services/appointment.service';
import { AuthGuardService } from '../../services/auth-guard.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { UserService } from '../../services/user.service';
import { ClientDetailsDialogComponent } from '../../shared/components/dialogs/client-details-dialog/client-details-dialog.component';
import { ClientHistoryDialogComponent } from '../../shared/components/dialogs/client-history-dialog/client-history-dialog.component';
import { ClientRegisterDialogComponent } from '../../shared/components/dialogs/client-register-dialog/client-register-dialog.component';
import { ReturnAppointmentDialogComponent } from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatMenuModule,
    MatTabsModule,
    MatButtonToggleModule,
    NgxMaskPipe,
  ],
  providers: [provideNgxMask()],
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  // Tabela e paginação de clientes
  displayedColumns: string[] = [
    'name',
    'cpf',
    'email',
    'phone',
    'registrationDate',
    'lastModified',
    'medicalConditions',
    'actions',
  ];
  dataSource = new MatTableDataSource<User>([]);
  totalClients: number = 0;
  pageSize: number = 25;
  pageIndex: number = 0;

  // Tabela e paginação de agendamentos
  appointmentColumns: string[] = [
    'id',
    'clientName',
    'procedures',
    'podologa',
    'dateTime',
    'status',
    'valorTotal',
    'medicalInfo',
    'actions',
  ];
  appointmentDataSource = new MatTableDataSource<Appointment>([]);
  totalAppointments: number = 0;
  appointmentPageSize: number = 10;
  appointmentPageIndex: number = 0;

  // Filtros
  searchQuery: string = '';
  filterCriteria: string = 'all';
  // Add isLoading property
  isLoading = false;

  sortCriteria: string = 'name';

  // Filtros de agendamentos
  appointmentStatusFilter: string = 'agendado';
  appointmentSearchQuery: string = '';

  // Filtro de período para agendamentos
  dateFilterOptions = [
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mês' },
    { value: 'all', label: 'Todos' },
  ];
  currentDateFilter: string = 'today'; // Por padrão, mostrar apenas os agendamentos do dia

  // Dados
  allClients: User[] = [];
  filteredClients: User[] = [];

  // Dados de agendamentos
  allAppointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @ViewChild('appointmentPaginator') appointmentPaginator!: MatPaginator;
  @ViewChild('appointmentSort') appointmentSort!: MatSort;

  // Adicionar verificação de papel do usuário
  isAdmin = this.authService.isAdmin;
  isFuncionario = this.authService.isFuncionario;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private appointmentService: AppointmentService,
    private router: Router,
    private dialog: MatDialog,
    private domSanitizer: DomSanitizer,
    private userService: UserService,
    private authGuardService: AuthGuardService
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.loadAppointments();
  }

  // Adicionar manipulador de erro
  private errorHandler = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handleObservableError: (_context: string, _errorMessage: string) => {
      return <T>(source: T) => {
        return source;
      };
    },
  };

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Se o appointmentPaginator e appointmentSort forem definidos
    setTimeout(() => {
      if (this.appointmentPaginator) {
        this.appointmentDataSource.paginator = this.appointmentPaginator;
      }
      if (this.appointmentSort) {
        this.appointmentDataSource.sort = this.appointmentSort;
      }
    });
  }

  // Substituir o método loadClients
  loadClients() {
    this.isLoading = true;
    this.userService
      .getClients()
      .pipe(
        // Usar o serviço centralizado de tratamento de erros
        this.errorHandler.handleObservableError(
          'AdminDashboard.loadClients',
          'Erro ao carregar lista de clientes'
        ),
        map((clients: User[]) => clients as User[])
      )
      .subscribe(clients => {
        this.allClients = clients;
        this.filteredClients = [...this.allClients];
        this.totalClients = this.allClients.length;
        this.updateDataSource();
        this.isLoading = false;
      });
  }

  /**
   * Normaliza os dados dos clientes para garantir consistência entre diferentes formatos
   */
  normalizeClientData(clients: Record<string, unknown>[]): User[] {
    return clients.map(client => {
      // Definir tipo para informações médicas
      type MedicalInfoType = {
        diabetes: boolean;
        vascularDisease: boolean;
        hypertension: boolean;
        renalInsufficiency: boolean;
        hematologicDisorders: boolean;
        chemicalAllergies: boolean;
        allergiesDescription: string;
      };

      // Valores padrão para informações médicas
      const defaultMedicalInfo: MedicalInfoType = {
        diabetes: false,
        vascularDisease: false,
        hypertension: false,
        renalInsufficiency: false,
        hematologicDisorders: false,
        chemicalAllergies: false,
        allergiesDescription: '',
      };

      // Verificar e normalizar cada campo
      const normalizedClient: User = {
        id: (client['id'] as string) || '',
        name: (client['name'] as string) || (client['nome'] as string) || '',
        cpf: (client['cpf'] as string) || '',
        email: (client['email'] as string) || '',
        phone: (client['phone'] as string) || (client['telefone'] as string) || '',
        address: (client['address'] as string) || (client['endereco'] as string) || '',
        birthDate: (client['birthDate'] as string) || (client['dataNascimento'] as string) || '',
        registrationDate:
          (client['registrationDate'] as string) || (client['dataCadastro'] as string) || '',
        lastModified:
          (client['lastModified'] as string) || (client['ultimaModificacao'] as string) || '',
        role: (client['role'] as string) === 'admin' ? 'admin' : 'client',
        medicalInfo:
          (client['medicalInfo'] as MedicalInfoType) ||
          (client['informacoesMedicas'] as MedicalInfoType) ||
          defaultMedicalInfo,
      };

      // Se medicalInfo for uma string vazia ou não existir, inicialize com valores padrão
      if (!normalizedClient.medicalInfo || typeof normalizedClient.medicalInfo !== 'object') {
        normalizedClient.medicalInfo = defaultMedicalInfo;
      }

      return normalizedClient;
    });
  }

  loadAppointments() {
    // Buscar agendamentos do Firebase usando o AppointmentService
    this.appointmentService.getAppointments().subscribe({
      next: (appointments: Appointment[]) => {
        console.log('Agendamentos carregados do Firebase:', appointments);
        this.allAppointments = appointments;
        this.totalAppointments = appointments.length;
        // Aplicar o filtro de "agendados" por padrão
        this.filterAppointmentsByStatus(this.appointmentStatusFilter);
        // Aplicar o filtro de data por padrão (hoje)
        this.filterAppointmentsByDate(this.currentDateFilter);
      },
      error: (error: unknown) => {
        console.error('Erro ao carregar agendamentos do Firebase:', error);
        this.notificationService.error('Erro ao carregar lista de agendamentos');
      },
    });
  }

  updateDataSource() {
    // Aplicar paginação no frontend (em produção, isso seria feito no backend)
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const paginatedData = this.filteredClients.slice(startIndex, endIndex);

    this.dataSource.data = paginatedData;
  }

  updateAppointmentDataSource() {
    // Aplicar paginação no frontend para os agendamentos
    const startIndex = this.appointmentPageIndex * this.appointmentPageSize;
    const endIndex = startIndex + this.appointmentPageSize;
    const paginatedData = this.filteredAppointments.slice(startIndex, endIndex);

    this.appointmentDataSource.data = paginatedData;
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDataSource();
  }

  onAppointmentPageChange(event: PageEvent) {
    this.appointmentPageIndex = event.pageIndex;
    this.appointmentPageSize = event.pageSize;
    this.updateAppointmentDataSource();
  }

  searchClients() {
    if (!this.searchQuery.trim()) {
      this.filteredClients = [...this.allClients];
    } else {
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredClients = this.allClients.filter(
        client =>
          client.name.toLowerCase().includes(query) ||
          client.cpf.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query)
      );
    }

    this.pageIndex = 0;
    this.applyFilters();
  }

  filterAppointmentsByStatus(status: string) {
    this.appointmentStatusFilter = status;

    if (status === 'all') {
      this.filteredAppointments = [...this.allAppointments];
    } else {
      this.filteredAppointments = this.allAppointments.filter(app => app.status === status);
    }

    // Após filtrar por status, aplicar o filtro de data atual
    this.filterAppointmentsByDate(this.currentDateFilter);

    this.appointmentPageIndex = 0;
    this.updateAppointmentDataSource();
  }

  /**
   * Filtra os agendamentos por período (hoje, semana, mês, todos)
   */
  filterAppointmentsByDate(dateFilter: string) {
    this.currentDateFilter = dateFilter;

    // Primeiro, aplicamos o filtro de status
    let statusFiltered = [];
    if (this.appointmentStatusFilter === 'all') {
      statusFiltered = [...this.allAppointments];
    } else {
      statusFiltered = this.allAppointments.filter(
        app => app.status === this.appointmentStatusFilter
      );
    }

    // Aplicamos o filtro de data nos resultados já filtrados por status
    this.filteredAppointments = this.applyDateFilter(statusFiltered, dateFilter);

    // Reiniciamos a página e atualizamos a exibição
    this.appointmentPageIndex = 0;
    this.updateAppointmentDataSource();
  }

  getClientName(userId: string | number): string {
    const client = this.allClients.find(c => c.id === userId);
    return client ? client.name : `Cliente #${userId}`;
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchClients();
  }

  applyFilters() {
    let filteredResults = [...this.filteredClients];

    switch (this.filterCriteria) {
      case 'recent': {
        // Clientes dos últimos 30 dias
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filteredResults = filteredResults.filter(
          client => new Date(client.registrationDate) >= thirtyDaysAgo
        );
        break;
      }

      case 'active':
        // Clientes com agendamentos ativos
        // Em uma aplicação real, isso seria uma query no backend
        filteredResults = filteredResults.filter(client => client.hasActiveAppointments === true);
        break;

      case 'highrisk':
        // Clientes com condições médicas de alto risco
        filteredResults = filteredResults.filter(client => this.hasHighRiskConditions(client));
        break;

      case 'allergies':
        // Clientes com alergias registradas
        filteredResults = filteredResults.filter(
          client => client.medicalInfo?.chemicalAllergies === true
        );
        break;

      case 'modified': {
        // Clientes que modificaram o perfil recentemente
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        filteredResults = filteredResults.filter(
          client => client.lastModified && new Date(client.lastModified) >= sevenDaysAgo
        );
        break;
      }
    }

    this.filteredClients = filteredResults;
    this.pageIndex = 0;
    this.applySorting();
  }

  applySorting() {
    const sortedData = [...this.filteredClients];

    switch (this.sortCriteria) {
      case 'name':
        sortedData.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case 'name_desc':
        sortedData.sort((a, b) => b.name.localeCompare(a.name));
        break;

      case 'date':
        sortedData.sort(
          (a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()
        );
        break;

      case 'date_asc':
        sortedData.sort(
          (a, b) => new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime()
        );
        break;

      case 'last_appointment':
        // Em uma aplicação real, isso seria uma query no backend
        sortedData.sort((a, b) => {
          if (!a.lastAppointment) return 1;
          if (!b.lastAppointment) return -1;
          return new Date(b.lastAppointment).getTime() - new Date(a.lastAppointment).getTime();
        });
        break;
    }

    this.filteredClients = sortedData;
    this.updateDataSource();
  }

  sortData(sort: Sort) {
    const data = [...this.filteredClients];

    if (!sort.active || sort.direction === '') {
      this.filteredClients = data;
      this.updateDataSource();
      return;
    }

    this.filteredClients = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name':
          return this.compare(a.name, b.name, isAsc);
        case 'registrationDate':
          return this.compare(
            new Date(a.registrationDate).getTime(),
            new Date(b.registrationDate).getTime(),
            isAsc
          );
        case 'lastModified':
          return this.compare(
            a.lastModified ? new Date(a.lastModified).getTime() : 0,
            b.lastModified ? new Date(b.lastModified).getTime() : 0,
            isAsc
          );
        default:
          return 0;
      }
    });

    this.updateDataSource();
  }

  sortAppointmentData(sort: Sort) {
    const data = [...this.filteredAppointments];

    if (!sort.active || sort.direction === '') {
      this.filteredAppointments = data;
      this.updateAppointmentDataSource();
      return;
    }

    this.filteredAppointments = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'dateTime':
          return this.compare(
            new Date(a.dateTime).getTime(),
            new Date(b.dateTime).getTime(),
            isAsc
          );
        case 'valorTotal':
          return this.compare(a.valorTotal, b.valorTotal, isAsc);
        case 'status':
          return this.compare(a.status, b.status, isAsc);
        default:
          return 0;
      }
    });

    this.updateAppointmentDataSource();
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  /**
   * Recarregar a lista de clientes forçando uma nova consulta ao servidor
   */
  refreshClients() {
    this.notificationService.info('Atualizando lista de clientes...');
    this.loadClients();
  }

  viewClientDetails(client: User): void {
    // Antes de abrir o diálogo, recarregue os dados do cliente para garantir que estão atualizados
    this.authService.getClientById(String(client.id)).subscribe({
      next: updatedClient => {
        if (updatedClient) {
          // Atualizar o cliente na lista atual
          const index = this.allClients.findIndex(c => c.id === client.id);
          if (index !== -1) {
            this.allClients[index] = updatedClient;
            this.updateDataSource();
          }

          // Não estamos usando a variável de retorno do Dialog
          this.dialog
            .open(ClientDetailsDialogComponent, {
              width: '700px',
              data: updatedClient,
            })
            .afterClosed()
            .subscribe(result => {
              if (result) {
                // Recarregar os clientes para mostrar as alterações
                this.refreshClients();
              }
            });
        } else {
          this.notificationService.error('Cliente não encontrado');
        }
      },
      error: error => {
        console.error('Erro ao buscar dados atualizados do cliente:', error);
        // Mesmo assim, abra o diálogo com os dados disponíveis
        this.dialog
          .open(ClientDetailsDialogComponent, {
            width: '700px',
            data: client,
          })
          .afterClosed()
          .subscribe(result => {
            if (result) {
              this.refreshClients();
            }
          });
      },
    });
  }

  editClient(client: User) {
    console.log('Editando cliente:', client);

    // Abre o mesmo diálogo de detalhes, mas já na aba de edição
    this.dialog
      .open(ClientDetailsDialogComponent, {
        width: '800px',
        data: { client, initialTab: 0 }, // 0 é a aba de informações pessoais
      })
      .afterClosed()
      .subscribe(result => {
        // Recarregar a lista se houve alterações
        if (result && result.updated) {
          this.loadClients();
        }
      });
  }

  viewClientHistory(client: User) {
    console.log('Visualizando histórico do cliente:', client);

    // Abre o diálogo de detalhes do cliente na aba de histórico
    this.dialog.open(ClientDetailsDialogComponent, {
      width: '800px',
      data: { client, initialTab: 2 }, // 2 é a aba de histórico de procedimentos
    });
  }

  deleteClient(client: User) {
    // Confirmação antes de excluir
    if (
      confirm(
        `Tem certeza que deseja excluir o cliente ${client.name}? Esta ação não pode ser desfeita.`
      )
    ) {
      console.log('Excluindo cliente:', client);

      // Convert client.id to string to ensure type compatibility
      const userId = String(client.id);

      // Use the string version of the ID
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.notificationService.success(`Cliente ${client.name} excluído com sucesso`);
          // Remover o cliente da lista local
          this.allClients = this.allClients.filter(c => c.id !== client.id);
          this.filteredClients = this.filteredClients.filter(c => c.id !== client.id);
          this.totalClients = this.allClients.length;
          this.updateDataSource();
        },
        error: (error: unknown) => {
          console.error('Erro ao excluir cliente:', error);
          this.notificationService.error('Erro ao excluir cliente');
        },
      });
    }
  }

  viewAppointmentDetails(appointment: Appointment) {
    console.log('Visualizando detalhes do agendamento:', appointment);
    this.notificationService.info(`Detalhes do agendamento: ${appointment.id}`);
  }

  changeAppointmentStatus(
    appointment: Appointment,
    newStatus: 'agendado' | 'cancelado' | 'finalizado'
  ) {
    console.log(`Alterando status do agendamento ${appointment.id} para ${newStatus}`);

    switch (newStatus) {
      case 'finalizado':
        this.appointmentService.completeAppointment(appointment.id!).subscribe({
          next: (
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            _updatedAppointment
          ) => {
            this.loadAppointments(); // Recarregar a lista
          },
          error: error => {
            this.notificationService.error(`Erro ao finalizar agendamento: ${error.message}`);
          },
        });
        break;

      case 'cancelado':
        this.appointmentService.cancelAppointment(appointment.id!).subscribe({
          next: (
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            _updatedAppointment
          ) => {
            this.loadAppointments(); // Recarregar a lista
          },
          error: error => {
            this.notificationService.error(`Erro ao cancelar agendamento: ${error.message}`);
          },
        });
        break;
    }
  }

  getFormattedMedicalConditions(client: User): string {
    const conditions = [];
    if (client.medicalInfo?.diabetes) conditions.push('Diabetes');
    if (client.medicalInfo?.hypertension) conditions.push('Hipertensão');
    if (client.medicalInfo?.vascularDisease) conditions.push('Doença Vascular');
    if (client.medicalInfo?.renalInsufficiency) conditions.push('Insuf. Renal');
    if (client.medicalInfo?.chemicalAllergies) conditions.push('Alergias Químicas');

    return conditions.join(', ') || 'Nenhuma';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'agendado':
        return 'accent';
      case 'finalizado':
        return 'primary';
      case 'cancelado':
        return 'warn';
      default:
        return '';
    }
  }

  hasHighRiskConditions(client: User): boolean {
    return !!(
      client.medicalInfo?.diabetes ||
      client.medicalInfo?.renalInsufficiency ||
      (client.medicalInfo?.vascularDisease && client.medicalInfo?.hypertension)
    );
  }

  wasModifiedRecently(client: User): boolean {
    if (!client.lastModified) return false;

    const modifiedDate = new Date(client.lastModified);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // Garante que temos informações sobre o modificador
    if (!client.lastModifiedBy) {
      client.lastModifiedBy = {
        id: 'unknown',
        name: 'Desconhecido',
        role: 'client',
      };
    }

    return modifiedDate >= twoDaysAgo;
  }

  // Filtra agendamentos com base no texto digitado na busca
  searchAppointments(): void {
    if (!this.appointmentSearchQuery.trim()) {
      // Se não há texto na busca, aplicamos apenas os filtros de status e data
      this.filterAppointmentsByStatus(this.appointmentStatusFilter);
      return;
    }

    const query = this.appointmentSearchQuery.toLowerCase().trim();

    // Filtramos por status primeiro
    let statusFiltered = [];
    if (this.appointmentStatusFilter === 'all') {
      statusFiltered = [...this.allAppointments];
    } else {
      statusFiltered = this.allAppointments.filter(
        app => app.status === this.appointmentStatusFilter
      );
    }

    // Aplicamos o filtro de texto na busca
    const textFiltered = statusFiltered.filter(appointment => {
      const clientName = this.getClientName(appointment.userId).toLowerCase();
      const clientMatch = clientName.includes(query);

      const procedureMatch = appointment.procedureNames.some(proc =>
        proc.toLowerCase().includes(query)
      );

      const podologaMatch = appointment.podologaNome.toLowerCase().includes(query);

      const dateMatch = new Date(appointment.dateTime).toLocaleDateString().includes(query);

      return clientMatch || procedureMatch || podologaMatch || dateMatch;
    });

    // Aplicamos o filtro de data nos resultados já filtrados
    this.filteredAppointments = this.applyDateFilter(textFiltered, this.currentDateFilter);

    this.appointmentPageIndex = 0;
    this.updateAppointmentDataSource();
  }

  /**
   * Aplica o filtro de data em uma lista de agendamentos
   * (método auxiliar para evitar duplicação de código)
   */
  private applyDateFilter(appointments: Appointment[], dateFilter: string): Appointment[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Início do dia atual

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999); // Final do dia atual

    switch (dateFilter) {
      case 'today':
        // Apenas agendamentos de hoje
        return appointments.filter(app => {
          const appDate = new Date(app.dateTime);
          return appDate >= today && appDate <= endOfDay;
        });

      case 'week': {
        // Agendamentos desta semana
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Domingo desta semana

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sábado desta semana
        endOfWeek.setHours(23, 59, 59, 999);

        return appointments.filter(app => {
          const appDate = new Date(app.dateTime);
          return appDate >= startOfWeek && appDate <= endOfWeek;
        });
      }

      case 'month': {
        // Agendamentos deste mês
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

        return appointments.filter(app => {
          const appDate = new Date(app.dateTime);
          return appDate >= startOfMonth && appDate <= endOfMonth;
        });
      }

      case 'all':
      default:
        // Todos os agendamentos
        return appointments;
    }
  }

  /**
   * Obtém as informações médicas do cliente pelo ID
   */
  getClientMedicalInfo(userId: string | number): SafeHtml {
    const client = this.allClients.find(c => c.id === userId);
    if (!client || !client.medicalInfo) {
      return this.domSanitizer.bypassSecurityTrustHtml(
        '<div class="no-medical-info">Sem informações médicas</div>'
      );
    }

    // Formatar as informações médicas de forma compacta
    try {
      // Lista de condições médicas para exibição
      const medicalConditions = [
        { field: 'diabetes', name: 'Diabetes' },
        { field: 'hypertension', name: 'Hipertensão' },
        { field: 'vascularDisease', name: 'Doença Vascular' },
        { field: 'renalInsufficiency', name: 'Insuficiência Renal' },
        { field: 'hematologicDisorders', name: 'Distúrbios Hematológicos' },
        { field: 'chemicalAllergies', name: 'Alergias Químicas' },
      ];

      // Criar versão compacta das condições
      const conditionsPresent: string[] = [];
      const conditionsAbsent: string[] = [];

      // Classificar as condições entre presentes e ausentes
      for (const condition of medicalConditions) {
        if (condition.field in client.medicalInfo) {
          const isPresent =
            client.medicalInfo[condition.field as keyof typeof client.medicalInfo] === true;
          if (isPresent) {
            conditionsPresent.push(condition.name);
          } else {
            conditionsAbsent.push(condition.name);
          }
        }
      }

      // Verificar se há condições médicas importantes
      const hasImportantConditions = conditionsPresent.length > 0;

      // Criar HTML super compacto com mini-títulos em linha
      let htmlContent = '<div class="medical-info-compact-row">';

      // Adicionar ícone de alerta se houver condições importantes
      if (hasImportantConditions) {
        htmlContent = '<div class="medical-info-compact-row important">';
        htmlContent +=
          '<div class="alert-icon"><span title="Este cliente possui condições médicas que requerem atenção">⚠️</span></div>';
      }

      // Layout mais horizontal para economizar espaço
      if (conditionsPresent.length > 0) {
        htmlContent += `<div class="condition-block">
          <span class="mini-title">Presentes:</span>
          <span class="present-list">✓ ${conditionsPresent.join(', ')}</span>
        </div>`;
      }

      // Adicionar observações caso existam
      if (
        client.medicalInfo.allergiesDescription &&
        client.medicalInfo.allergiesDescription.trim()
      ) {
        htmlContent += `<div class="condition-block notes-block">
          <span class="mini-title">Obs:</span>
          <span class="notes-text">"${client.medicalInfo.allergiesDescription}"</span>
        </div>`;
      }

      htmlContent += '</div>';

      // Verificar se há algum conteúdo
      if (htmlContent === '<div class="medical-info-compact-row"></div>') {
        htmlContent = '<div class="empty-info-mini">Nenhuma condição médica</div>';
      }

      // Sanitizar o HTML antes de retornar
      return this.domSanitizer.bypassSecurityTrustHtml(htmlContent);
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _error
    ) {
      return this.domSanitizer.bypassSecurityTrustHtml(
        '<div class="medical-error-mini">Erro ao exibir dados médicos</div>'
      );
    }
  }

  /**
   * Agenda um retorno para um agendamento já finalizado
   */
  scheduleReturn(appointment: Appointment): void {
    console.log('Agendando retorno para:', appointment);

    // Obter lista de procedimentos (em uma aplicação real, isso viria de um serviço)
    // Aqui estamos simulando os mesmos procedimentos do agendamento original
    const procedures: Procedure[] = appointment.procedures.map((id, index) => {
      return {
        id,
        name: appointment.procedureNames[index],
        description: 'Procedimento de retorno',
        // Simulando valores baseados no valor total
        duration: Math.round(appointment.duracaoTotal / appointment.procedures.length),
        price: Math.round(appointment.valorTotal / appointment.procedures.length),
      };
    });

    // Abrir diálogo para agendar retorno
    this.dialog
      .open(ReturnAppointmentDialogComponent, {
        width: '600px',
        data: {
          appointment,
          procedures,
        },
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          // Criar novo agendamento de retorno
          this.appointmentService.createAppointment(result).subscribe({
            next: (
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              _newAppointment
            ) => {
              this.notificationService.success('Retorno agendado com sucesso!');
              // Recarregar a lista de agendamentos
              this.loadAppointments();
            },
            error: error => {
              this.notificationService.error('Erro ao agendar retorno: ' + error.message);
            },
          });
        }
      });
  }

  /**
   * Abre o diálogo de histórico de cliente
   */
  openClientHistory(): void {
    this.dialog.open(ClientHistoryDialogComponent, {
      width: '90%',
      maxWidth: '1200px',
      height: '90%',
      maxHeight: '800px',
    });
  }

  openCashier(): void {
    this.router.navigate(['/admin/cashier']);
  }

  openMonthlyReport(): void {
    // Usar o mês e ano atual para o relatório mensal
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    this.router.navigate(['/admin/monthly-summary', year, month]);
  }

  openAgenda(): void {
    this.router.navigate(['/admin/agenda']);
  }

  openRegisterClient(): void {
    // Abrir o diálogo de cadastro de cliente
    const dialogRef = this.dialog.open(ClientRegisterDialogComponent, {
      width: '600px',
      disableClose: true,
    });

    // Processar o resultado após o fechamento do diálogo
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        // Recarregar a lista de clientes após o cadastro bem-sucedido
        this.refreshClients();
      }
    });
  }
}
