import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { lastValueFrom } from 'rxjs';

import { Holiday, HolidayService } from '../../../services/holiday.service';
import { DateUtils } from '../../../shared/utils/date-utils';

@Component({
  selector: 'app-holiday-management',
  templateUrl: './holiday-management.component.html',
  styleUrls: ['./holiday-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
})
export class HolidayManagementComponent implements OnInit {
  holidayForm: FormGroup;
  holidayDataSource = new MatTableDataSource<Holiday>([]);
  displayedColumns: string[] = ['date', 'description', 'actions'];
  holidays: Holiday[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private holidayService: HolidayService,
    private snackBar: MatSnackBar
  ) {
    this.holidayForm = this.fb.group({
      date: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadHolidays();
  }

  async loadHolidays(): Promise<void> {
    this.loading = true;

    try {
      const holidays = await lastValueFrom(this.holidayService.getHolidays());
      // Converter a lista de datas para o formato de Holiday
      this.holidays = holidays.map((date, index) => ({
        id: `local-${index}`, // IDs locais para feriados pré-definidos
        date: DateUtils.normalizeDate(date),
        description: this.getDefaultHolidayName(date),
      }));

      this.holidayDataSource.data = this.holidays;
    } catch (error) {
      console.error('Erro ao carregar feriados:', error);
      this.showMessage('Erro ao carregar feriados');
    } finally {
      this.loading = false;
    }
  }

  getDefaultHolidayName(date: Date): string {
    // Lista básica de feriados nacionais - poderia ser mais sofisticado
    const month = date.getMonth();
    const day = date.getDate();

    // Usando o DateUtils para obter valores consistentes
    const formattedDate = DateUtils.toDisplayDateString(date);

    if (month === 0 && day === 1) return 'Ano Novo';
    if (month === 2 && day === 29) return 'Sexta-feira Santa';
    if (month === 3 && day === 21) return 'Tiradentes';
    if (month === 4 && day === 1) return 'Dia do Trabalho';
    if (month === 8 && day === 7) return 'Independência do Brasil';
    if (month === 9 && day === 12) return 'Nossa Senhora Aparecida';
    if (month === 10 && day === 2) return 'Finados';
    if (month === 10 && day === 15) return 'Proclamação da República';
    if (month === 11 && day === 25) return 'Natal';

    // Feriados móveis (simplificados - idealmente usaria um algoritmo específico)
    // Carnaval e Corpus Christi precisam de cálculos específicos

    return `Feriado Nacional (${formattedDate})`;
  }

  /**
   * Formatar data para exibição
   */
  formatDate(date: Date | string): string {
    if (!date) {
      return '';
    }

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return DateUtils.toDisplayDateString(dateObj);
  }

  /**
   * Adicionar um novo feriado
   */
  addHoliday(): void {
    if (this.holidayForm.invalid) {
      return;
    }

    this.loading = true;

    const formValue = this.holidayForm.value;

    // Normalizar a data antes de enviar
    const normalizedDate = DateUtils.normalizeDate(formValue.date);

    const holiday: Holiday = {
      date: normalizedDate,
      description: formValue.description,
    };

    this.holidayService.addHoliday(holiday).subscribe({
      next: (success: boolean) => {
        if (success) {
          this.snackBar.open('Feriado adicionado com sucesso', 'Fechar', {
            duration: 3000,
          });
          this.holidayForm.reset();
          this.loadHolidays();
        }
        this.loading = false;
      },
      error: error => {
        console.error('Erro ao adicionar feriado:', error);
        this.snackBar.open('Erro ao adicionar feriado', 'Fechar', {
          duration: 3000,
        });
        this.loading = false;
      },
    });
  }

  async removeHoliday(holiday: Holiday): Promise<void> {
    if (!holiday.id || holiday.id.startsWith('local-')) {
      this.showMessage('Feriados pré-definidos não podem ser removidos');
      return;
    }

    const holidayDate = holiday.date instanceof Date ? holiday.date : new Date(holiday.date);

    const formattedDate = DateUtils.toDisplayDateString(holidayDate);
    const confirmMessage = `Deseja remover o feriado "${holiday.description}" (${formattedDate})?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    this.loading = true;

    try {
      await lastValueFrom(this.holidayService.removeHoliday(holiday.id));
      this.showMessage('Feriado removido com sucesso');
      this.loadHolidays();
    } catch (error) {
      console.error('Erro ao remover feriado:', error);
      this.showMessage('Erro ao remover feriado');
    } finally {
      this.loading = false;
    }
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
    });
  }
}
