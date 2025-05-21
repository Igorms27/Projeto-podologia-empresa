import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

import { AppointmentDisplay, mapAppointmentToDisplay } from './client-history-dialog.model';
import { Appointment } from '../../../../models/appointment.model';
import { User } from '../../../../models/user.model';
import { AppointmentService } from '../../../../services/appointment.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-client-history-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
  ],
  templateUrl: './client-history-dialog.component.html',
  styleUrls: ['./client-history-dialog.component.scss'],
})
export class ClientHistoryDialogComponent implements OnInit {
  searchTerm: string = '';
  clients: User[] = [];
  selectedClient: User | null = null;
  appointments: Appointment[] = [];
  appointmentsDisplay: AppointmentDisplay[] = [];
  loading: boolean = false;
  loadingHistory: boolean = false;
  searchPerformed: boolean = false;
  searchControl = this.fb.control('');
  isSearching = false;
  isLoading = false;
  completedAppointments: AppointmentDisplay[] = [];
  cancelledAppointments: AppointmentDisplay[] = [];

  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentService,
    public dialogRef: MatDialogRef<ClientHistoryDialogComponent>,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter(value => !!value && value.length >= 3)
      )
      .subscribe(() => {
        this.searchClients();
      });
  }

  searchClients() {
    if (!this.searchControl.value || this.searchControl.value.length < 3) {
      return;
    }

    this.loading = true;
    this.isSearching = true;
    this.searchPerformed = true;
    this.clients = [];

    this.authService.searchUsers(this.searchControl.value).subscribe({
      next: users => {
        this.clients = users;
        this.loading = false;
        this.isSearching = false;
      },
      error: error => {
        console.error('Erro ao buscar clientes:', error);
        this.loading = false;
        this.isSearching = false;
      },
    });
  }

  selectClient(client: User) {
    this.selectedClient = client;
    if (client && client.id) {
      this.loadClientHistory(String(client.id));
    }
  }

  loadClientHistory(clientId: string) {
    this.loadingHistory = true;
    this.isLoading = true;
    this.appointments = [];
    this.appointmentsDisplay = [];
    this.completedAppointments = [];
    this.cancelledAppointments = [];

    console.log(`Iniciando busca de histórico para cliente: ${clientId}`);

    this.appointmentService.getAppointmentsByClient(clientId).subscribe({
      next: appointments => {
        console.log(`Histórico carregado: ${appointments.length} agendamentos encontrados`);
        this.appointments = appointments;

        // Verificar se temos agendamentos
        if (appointments.length === 0) {
          // Tentar buscar transações financeiras relacionadas a este cliente
          console.log('Sem agendamentos. Verificando transações financeiras...');
          // Aqui você poderia adicionar código para buscar no serviço de caixa, se necessário
        }

        // Mapear os appointments para o formato de exibição
        this.appointmentsDisplay = appointments.map(appointment =>
          mapAppointmentToDisplay(appointment)
        );

        // Filtrar por status
        this.completedAppointments = this.appointmentsDisplay.filter(
          a => a.status === 'finalizado'
        );

        this.cancelledAppointments = this.appointmentsDisplay.filter(a => a.status === 'cancelado');

        this.loadingHistory = false;
        this.isLoading = false;
      },
      error: error => {
        console.error('Erro ao carregar histórico:', error);
        this.snackBar.open(
          `Erro ao carregar histórico: ${error.message || 'Erro desconhecido'}`,
          'OK',
          {
            duration: 5000,
          }
        );
        this.loadingHistory = false;
        this.isLoading = false;
      },
    });
  }

  returnToSearch() {
    this.clearSelection();
  }

  clearSelection() {
    this.selectedClient = null;
    this.appointments = [];
    this.appointmentsDisplay = [];
    this.completedAppointments = [];
    this.cancelledAppointments = [];
  }

  getAppointments(): AppointmentDisplay[] {
    return this.appointmentsDisplay || [];
  }

  getCompletedAppointments(): AppointmentDisplay[] {
    return this.completedAppointments || [];
  }

  getCancelledAppointments(): AppointmentDisplay[] {
    return this.cancelledAppointments || [];
  }

  formatDate(date: string | Date): string {
    if (!date) return '';

    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR');
  }

  formatTime(time: string): string {
    return time || '';
  }
}
