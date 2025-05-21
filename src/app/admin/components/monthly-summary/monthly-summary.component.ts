import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';

import {
  CashTransaction,
  MonthlyReport,
  PodologistMonthlyStat,
} from '../../../models/cashier.model';
import { CashierService } from '../../../services/cashier.service';
import { NotificationService } from '../../../services/notification.service';

// Interface para mapeamento de procedimentos para abreviações
interface ProcedureAbbreviation {
  [key: string]: string;
}

@Component({
  selector: 'app-monthly-summary',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule, MatIconModule, MatButtonModule],
  providers: [DatePipe],
  templateUrl: './monthly-summary.component.html',
  styleUrls: ['./monthly-summary.component.scss'],
})
export class MonthlySummaryComponent implements OnInit {
  monthlyReport: MonthlyReport | null = null;
  isLoading = false;
  year: number | null = null;
  month: number | null = null;
  monthYearDisplay: string = '';

  // Mapeamento de procedimentos para abreviações
  procedureAbbreviations: ProcedureAbbreviation = {
    'Limpeza Simples': 'LP',
    'Limpeza Profunda': 'LPF',
    'Tratamento de Onicomicose': 'ONI',
    'Correção com Órtese': 'ORT',
    'Remoção de Calosidade': 'CAL',
    'Unha Encravada': 'UE',
    Reflexologia: 'REF',
    'Pedicure Completa': 'PED',
    Podoprofilaxia: 'PP',
    'Avaliação Podológica': 'AP',
    // Adicione outros procedimentos conforme necessário
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cashierService: CashierService,
    private notificationService: NotificationService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const yearParam = params['year'];
      const monthParam = params['month'];

      if (yearParam && monthParam) {
        this.year = +yearParam;
        this.month = +monthParam;
        this.monthYearDisplay = this.formatMonthYear(this.year, this.month);
        this.loadMonthlyTransactions();
      } else {
        this.notificationService.error('Ano ou mês inválido na URL.');
        this.router.navigate(['/admin/cashier']);
      }
    });
  }

  loadMonthlyTransactions(): void {
    if (!this.year || !this.month) return;

    this.isLoading = true;
    this.monthlyReport = null;

    this.cashierService.getTransactionsForMonth(this.year, this.month).subscribe({
      next: (transactions: CashTransaction[]) => {
        this.calculateMonthlyReport(transactions);
        this.isLoading = false;
      },
      error: (err: Error) => {
        console.error('Erro ao buscar transações do mês:', err);
        this.notificationService.error(
          'Erro ao buscar dados para o resumo mensal. Tente novamente.'
        );
        this.isLoading = false;
      },
    });
  }

  private calculateMonthlyReport(transactions: CashTransaction[]): void {
    if (!this.year || !this.month) return;

    let totalAppointmentIncome = 0;
    const podologistStatsMap = new Map<
      string,
      {
        podoId: string;
        name: string;
        count: number;
        revenue: number;
        procedures: Map<string, number>;
      }
    >();

    transactions.forEach(transaction => {
      if (transaction.type === 'income' && transaction.appointmentId) {
        totalAppointmentIncome += transaction.amount;

        if (transaction.podologaId && transaction.podologaNome) {
          const stats = podologistStatsMap.get(transaction.podologaId) || {
            podoId: transaction.podologaId,
            name: transaction.podologaNome,
            count: 0,
            revenue: 0,
            procedures: new Map<string, number>(),
          };
          stats.count += 1;
          stats.revenue += transaction.amount;

          // Contar procedimentos
          if (transaction.procedureNames && transaction.procedureNames.length > 0) {
            transaction.procedureNames.forEach(procName => {
              const currentCount = stats.procedures.get(procName) || 0;
              stats.procedures.set(procName, currentCount + 1);
            });
          }

          podologistStatsMap.set(transaction.podologaId, stats);
        }
      }
    });

    const podologistStatsResult: PodologistMonthlyStat[] = Array.from(
      podologistStatsMap.values()
    ).map(stat => {
      // Converter Map de procedimentos para array
      const proceduresArray = Array.from(stat.procedures.entries()).map(([name, count]) => ({
        name,
        count,
        abbreviation: this.getAbbreviation(name),
      }));

      // Ordenar por quantidade (decrescente)
      proceduresArray.sort((a, b) => b.count - a.count);

      return {
        podologistId: stat.podoId,
        name: stat.name,
        appointmentCount: stat.count,
        totalRevenue: stat.revenue,
        procedures: proceduresArray,
      };
    });

    this.monthlyReport = {
      month: this.month,
      year: this.year,
      totalAppointmentIncome: totalAppointmentIncome,
      podologistStats: podologistStatsResult,
    };
  }

  // Retorna a abreviação para um procedimento ou o nome se não tiver abreviação
  private getAbbreviation(procedureName: string): string {
    return this.procedureAbbreviations[procedureName] || procedureName;
  }

  private formatMonthYear(year: number, month: number): string {
    const date = new Date(year, month - 1, 1);
    return this.datePipe.transform(date, 'MM/yyyy') || `${month}/${year}`;
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
