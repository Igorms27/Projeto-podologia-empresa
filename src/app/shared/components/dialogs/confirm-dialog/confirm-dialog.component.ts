import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { Appointment, Podologa, Procedure } from '../../../../models/appointment.model';
import { AppointmentService } from '../../../../services/appointment.service';
import { PodologaService } from '../../../../services/podologa.service';

interface DialogData {
  appointment: Appointment;
  procedures: Procedure[];
}

@Component({
  selector: 'app-return-appointment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatSelectModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Agendar Retorno</h2>
    <div mat-dialog-content>
      <p>
        Agendando retorno para: <strong>{{ data.appointment.clientName || 'Cliente' }}</strong>
      </p>

      <div class="form-row">
        <mat-form-field appearance="outline">
          <mat-label>Selecione a data do retorno</mat-label>
          <input
            matInput
            [matDatepicker]="picker"
            [(ngModel)]="returnDate"
            [min]="minDate"
            [matDatepickerFilter]="dateFilter"
            (dateChange)="onDateSelected()"
          />
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>
      </div>

      <div class="form-row">
        <mat-form-field appearance="outline">
          <mat-label>Profissional</mat-label>
          <mat-select [(ngModel)]="selectedPodologa" (selectionChange)="onPodologaSelected()">
            <mat-option *ngFor="let podologa of podologas" [value]="podologa">
              {{ podologa.nome }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="form-row">
        <mat-form-field appearance="outline">
          <mat-label>Procedimento</mat-label>
          <input matInput value="Retorno" readonly />
        </mat-form-field>
      </div>

      <div class="form-row">
        <h3>Horários Disponíveis</h3>
        <div *ngIf="loading" class="loading-indicator">
          <mat-progress-spinner diameter="30" mode="indeterminate"></mat-progress-spinner>
          <span>Carregando horários...</span>
        </div>

        <div *ngIf="!loading && availableTimeSlots.length === 0" class="no-times">
          <p>Selecione outra data ou profissional.</p>
        </div>

        <div *ngIf="!loading && availableTimeSlots.length > 0" class="time-slots">
          <button
            *ngFor="let time of availableTimeSlots"
            (click)="selectTime(time)"
            [class.selected]="selectedTime === time"
            mat-stroked-button
          >
            {{ time }}
          </button>
        </div>
      </div>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="!isFormValid()"
        (click)="scheduleReturn()"
      >
        Agendar Retorno
      </button>
    </div>
  `,
  styles: [
    `
      .form-row {
        margin-bottom: 16px;
      }

      mat-form-field {
        width: 100%;
      }

      .time-slots {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 8px;
        margin-top: 16px;
      }

      .time-slots button {
        padding: 4px;
      }

      .selected {
        background-color: #e3f2fd;
        border-color: #2196f3;
      }

      .loading-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .no-times {
        color: #f44336;
        font-style: italic;
      }
    `,
  ],
})
export class ReturnAppointmentDialogComponent implements OnInit {
  returnDate: Date | null = null;
  selectedPodologa: Podologa | null = null;
  selectedProcedure: Procedure = {
    id: 'return',
    name: 'Retorno',
    description: 'Consulta de retorno',
    duration: 30,
    price: 50,
    category: 'Retorno',
  };
  selectedTime: string = '';
  availableTimeSlots: string[] = [];
  loading: boolean = false;
  minDate: Date = new Date();
  podologas: Podologa[] = [];

  // Filtro para desabilitar finais de semana e feriados
  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;

    // Verificar se é um dia útil (não é fim de semana nem feriado)
    return this.appointmentService.isBusinessDay(date);
  };

  constructor(
    public dialogRef: MatDialogRef<ReturnAppointmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private appointmentService: AppointmentService,
    private podologaService: PodologaService
  ) {
    // Configurar a data mínima como o dia seguinte
    this.minDate.setDate(this.minDate.getDate() + 1);
  }

  ngOnInit(): void {
    this.loadPodologas();
  }

  onDateSelected(): void {
    // Se já temos uma podóloga selecionada, carregar os horários
    if (this.selectedPodologa) {
      this.loadAvailableTimes();
    }
  }

  loadPodologas(): void {
    this.podologaService.getAllPodologas().subscribe({
      next: (podologas: Podologa[]) => {
        if (!podologas || podologas.length === 0) {
          // Usar dados mockados diretamente se não houver podólogas
          this.podologas = [
            {
              id: 'podologa1',
              nome: 'Valdenice',
              especialidade: 'Podologia Geral',
              rating: 5,
            },
            {
              id: 'podologa2',
              nome: 'Claudia',
              especialidade: 'Podologia Esportiva',
              rating: 4.8,
            },
            {
              id: 'podologa3',
              nome: 'Sonia',
              especialidade: 'Podologia Geriátrica',
              rating: 4.7,
            },
          ];
        } else {
          this.podologas = podologas;
        }

        // Pré-selecionar a podóloga que atendeu anteriormente, se disponível
        if (this.data.appointment.podologaId) {
          const prevPodologa = this.podologas.find(p => p.id === this.data.appointment.podologaId);

          if (prevPodologa) {
            this.selectedPodologa = prevPodologa;
          } else {
            // Se não encontrou a podóloga anterior, seleciona a primeira da lista
            if (this.podologas.length > 0) {
              this.selectedPodologa = this.podologas[0];
            }
          }
        } else if (this.podologas.length > 0) {
          // Se não havia podóloga anterior, selecionamos a primeira da lista
          this.selectedPodologa = this.podologas[0];
        }

        // Se já temos uma data selecionada, carregar os horários disponíveis
        if (this.returnDate && this.selectedPodologa) {
          this.loadAvailableTimes();
        }
      },
      error: (_error: unknown) => {
        // Em caso de erro, usar dados mockados como fallback
        this.podologas = [
          {
            id: 'podologa1',
            nome: 'Valdenice',
            especialidade: 'Podologia Geral',
            rating: 5,
          },
          {
            id: 'podologa2',
            nome: 'Claudia',
            especialidade: 'Podologia Esportiva',
            rating: 4.8,
          },
          {
            id: 'podologa3',
            nome: 'Sonia',
            especialidade: 'Podologia Geriátrica',
            rating: 4.7,
          },
        ];

        // Selecionar a primeira podóloga como padrão
        if (this.podologas.length > 0) {
          this.selectedPodologa = this.podologas[0];
        }
      },
    });
  }

  onPodologaSelected(): void {
    if (this.returnDate) {
      this.loadAvailableTimes();
    }
  }

  loadAvailableTimes(): void {
    if (!this.returnDate || !this.selectedPodologa) {
      this.availableTimeSlots = [];
      return;
    }

    this.loading = true;

    // Primeiro, vamos verificar todos os agendamentos para este dia (debug)
    this.checkAllAppointmentsForDate();

    // Combinar a data selecionada com os horários disponíveis
    this.appointmentService
      .getAvailableTimeSlots(this.returnDate, this.selectedPodologa.id)
      .subscribe({
        next: times => {
          this.availableTimeSlots = times;
          this.loading = false;

          // Resetar o horário selecionado se não estiver mais disponível
          if (this.selectedTime && !times.includes(this.selectedTime)) {
            this.selectedTime = '';
          }
        },
        error: _error => {
          this.availableTimeSlots = [];
          this.loading = false;
        },
      });
  }

  /**
   * Método de diagnóstico: verifica todos os agendamentos para a data e podóloga selecionadas
   */
  checkAllAppointmentsForDate(): void {
    if (!this.returnDate || !this.selectedPodologa) return;

    this.appointmentService
      .debugAppointmentsForDateAndPodologa(this.returnDate, this.selectedPodologa.id)
      .subscribe({
        next: () => {
          // Resultado processado silenciosamente
        },
        error: () => {
          // Erros tratados silenciosamente
        },
      });
  }

  selectTime(time: string): void {
    this.selectedTime = time;
  }

  isFormValid(): boolean {
    return !!this.returnDate && !!this.selectedPodologa && !!this.selectedTime;
  }

  scheduleReturn(): void {
    if (!this.isFormValid() || !this.returnDate) return;

    // Criar objeto de data/hora combinando a data selecionada com o horário
    const [hours, minutes] = this.selectedTime.split(':').map(Number);
    const dateTime = new Date(this.returnDate);
    dateTime.setHours(hours, minutes, 0, 0);

    // Criar o novo agendamento
    const appointment: Appointment = {
      userId: this.data.appointment.userId,
      procedures: [this.selectedProcedure.id],
      procedureNames: [this.selectedProcedure.name],
      podologaId: this.selectedPodologa!.id,
      podologaNome: this.selectedPodologa!.nome,
      dateTime: dateTime.toISOString(),
      status: 'agendado',
      valorTotal: this.selectedProcedure.price,
      duracaoTotal: this.selectedProcedure.duration,
    };

    this.dialogRef.close(appointment);
  }

  cleanupOldAppointments(): void {
    this.loading = true;

    this.appointmentService.cleanupCanceledAppointments().subscribe({
      next: idsRemovidos => {
        if (idsRemovidos.length > 0) {
          alert(
            `${idsRemovidos.length} agendamentos cancelados antigos foram removidos. Tente novamente.`
          );
          // Recarregar horários disponíveis
          this.loadAvailableTimes();
        } else {
          alert('Nenhum agendamento cancelado antigo foi encontrado.');
          this.loading = false;
        }
      },
      error: _error => {
        alert('Erro ao limpar agendamentos antigos. Verifique o console para mais detalhes.');
        this.loading = false;
      },
    });
  }
}
