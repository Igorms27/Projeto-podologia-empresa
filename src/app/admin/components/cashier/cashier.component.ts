import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

import { DailyCashReport } from '../../../models/cashier.model';
import { CashierService } from '../../../services/cashier.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-cashier',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
  providers: [DatePipe],
  templateUrl: './cashier.component.html',
  styleUrls: ['./cashier.component.scss'],
})
export class CashierComponent implements OnInit {
  // Colunas das tabelas
  incomeColumns: string[] = [
    'time',
    'description',
    'client',
    'professional',
    'procedures',
    'paymentMethod',
    'amount',
  ];
  expenseColumns: string[] = ['time', 'description', 'amount'];

  // Dados do relatório
  selectedDate: Date = new Date();
  dailyReport: DailyCashReport | null = null;
  isLoading = false;

  constructor(
    private cashierService: CashierService,
    private notificationService: NotificationService,
    private datePipe: DatePipe,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDailyReport();
  }

  onDateChange(): void {
    this.loadDailyReport();
  }

  loadDailyReport(): void {
    if (!this.selectedDate) {
      this.notificationService.warning('Por favor, selecione uma data.');
      return;
    }
    this.isLoading = true;
    this.dailyReport = null;
    const formattedDate = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');

    if (formattedDate) {
      this.cashierService.generateDailyReport(formattedDate).subscribe({
        next: (report: DailyCashReport) => {
          this.dailyReport = report;
          this.isLoading = false;
        },
        error: (err: Error) => {
          console.error('Erro ao buscar relatório diário:', err);
          this.notificationService.error('Erro ao buscar relatório diário. Tente novamente.');
          this.isLoading = false;
        },
      });
    } else {
      this.notificationService.error('Data inválida.');
      this.isLoading = false;
    }
  }

  generateMonthlySummary(): void {
    if (!this.selectedDate) {
      this.notificationService.warning('Selecione uma data para definir o mês.');
      return;
    }
    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth() + 1;
    this.router.navigate(['/admin/monthly-summary', year, month]);
  }

  hasPodologaStats(): boolean {
    return this.dailyReport !== null && this.dailyReport.podologistStats.length > 0;
  }

  getPodologaStatsArray(): Array<{ id: string; nome: string; total: number; count: number }> {
    if (!this.dailyReport) return [];
    return this.dailyReport.podologistStats;
  }

  showAllTransactions(): void {
    this.notificationService.info('Função não implementada completamente.');
  }
}
