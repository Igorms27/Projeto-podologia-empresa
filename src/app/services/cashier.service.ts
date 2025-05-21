import { Injectable } from '@angular/core';
import {
  DocumentReference,
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  orderBy,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';

import { endOfMonth, formatISO, startOfMonth } from 'date-fns';
import { Observable, catchError, from, map, of } from 'rxjs';

import { AppointmentService } from './appointment.service';
import { AuthService } from './auth.service';
import { Appointment } from '../models/appointment.model';
import { CashTransaction, DailyCashReport, ExpenseCategory } from '../models/cashier.model';

@Injectable({
  providedIn: 'root',
})
export class CashierService {
  constructor(
    private firestore: Firestore,
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {}

  // Adicionar uma nova transação ao caixa
  addTransaction(transaction: CashTransaction): Observable<string> {
    const transactionsRef = collection(this.firestore, 'cashTransactions');
    return from(addDoc(transactionsRef, transaction)).pipe(
      map((docRef: DocumentReference) => docRef.id)
    );
  }

  // Obter transações por data
  getTransactionsByDate(dateString: string): Observable<DailyCashReport> {
    console.log(`Buscando transações para a data: ${dateString}`);

    // Formatar a data para YYYY-MM-DD para comparação
    const targetDateStr = dateString.substring(0, 10);
    console.log(`Data alvo para filtragem: ${targetDateStr}`);

    // Buscar todas as transações para debug
    return collectionData(collection(this.firestore, 'cashTransactions')).pipe(
      map(allTransactions => {
        // Converter para o tipo CashTransaction
        const typedTransactions = allTransactions as CashTransaction[];
        console.log(`Total de transações recuperadas: ${typedTransactions.length}`);

        // Filtrar transações pela data - usando uma abordagem mais robusta
        const transactions = typedTransactions.filter(trans => {
          if (!trans.date) return false;

          // Extrair apenas a parte YYYY-MM-DD da data da transação
          const transDateStr = trans.date.substring(0, 10);
          const match = transDateStr === targetDateStr;

          if (match) {
            console.log(
              `Transação encontrada para ${dateString}: ${trans.description}, valor: ${trans.amount}, data: ${trans.date}`
            );
          }

          return match;
        });

        console.log(`Transações filtradas para ${dateString}: ${transactions.length}`);

        // Separar receitas e despesas
        const incomes = transactions.filter(t => t.type === 'income');
        const expenses = transactions.filter(t => t.type === 'expense');

        console.log(`Receitas: ${incomes.length}, Despesas: ${expenses.length}`);

        // Log detalhado das receitas
        incomes.forEach(income => {
          console.log(
            `Receita: ${income.description}, Valor: ${income.amount}, Cliente: ${income.clientName || 'N/A'}, Método: ${income.paymentMethod || 'N/A'}`
          );
        });

        // Calcular totais
        const totalIncome = incomes.reduce((sum, t) => sum + Number(t.amount), 0);
        const totalExpense = expenses.reduce((sum, t) => sum + Number(t.amount), 0);

        // Calcular totais por método de pagamento (apenas para receitas)
        const cashTotal = incomes
          .filter(t => t.paymentMethod === 'dinheiro')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const pixTotal = incomes
          .filter(t => t.paymentMethod === 'pix')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const cardTotal = incomes
          .filter(t => t.paymentMethod === 'cartao')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        // Calcular estatísticas por podóloga
        const podologaMap = new Map<
          string,
          {
            id: string;
            nome: string;
            total: number;
            count: number;
            cashTotal: number;
            pixTotal: number;
            cardTotal: number;
          }
        >();

        incomes.forEach(income => {
          if (income.podologaId) {
            const existingStats = podologaMap.get(income.podologaId);
            if (existingStats) {
              // Update existing stats
              existingStats.total += Number(income.amount);
              existingStats.count += 1;

              // Atualizar totais por método de pagamento
              if (income.paymentMethod === 'dinheiro')
                existingStats.cashTotal += Number(income.amount);
              if (income.paymentMethod === 'pix') existingStats.pixTotal += Number(income.amount);
              if (income.paymentMethod === 'cartao')
                existingStats.cardTotal += Number(income.amount);
            } else {
              // Create new stats entry
              podologaMap.set(income.podologaId, {
                id: income.podologaId,
                nome: income.podologaNome || 'Sem nome',
                total: Number(income.amount),
                count: 1,
                cashTotal: income.paymentMethod === 'dinheiro' ? Number(income.amount) : 0,
                pixTotal: income.paymentMethod === 'pix' ? Number(income.amount) : 0,
                cardTotal: income.paymentMethod === 'cartao' ? Number(income.amount) : 0,
              });
            }
          }
        });

        return {
          date: dateString,
          incomes,
          expenses,
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
          cashTotal,
          pixTotal,
          cardTotal,
          podologistStats: Array.from(podologaMap.values()),
        };
      }),
      catchError(error => {
        console.error('Erro ao buscar transações para a data:', error);
        return of({
          date: dateString,
          incomes: [],
          expenses: [],
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
          cashTotal: 0,
          pixTotal: 0,
          cardTotal: 0,
          podologistStats: [],
        });
      })
    );
  }

  // Gerar relatório diário baseado em uma data específica
  generateDailyReport(date: string): Observable<DailyCashReport> {
    return this.getTransactionsByDate(date).pipe(
      map(transactions => {
        // Já está no formato correto com as novas propriedades, apenas retornar
        return transactions;
      })
    );
  }

  // NOVA FUNÇÃO: Obter transações por mês e ano
  getTransactionsForMonth(year: number, month: number): Observable<CashTransaction[]> {
    const startDate = startOfMonth(new Date(year, month - 1)); // month é 1-based, Date é 0-based
    const endDate = endOfMonth(new Date(year, month - 1));

    const startIso = formatISO(startDate);
    const endIso = formatISO(endDate);

    console.log(`Buscando transações de ${startIso} até ${endIso}`);

    const transactionsRef = collection(this.firestore, 'cashTransactions');
    // Criar a query para buscar transações dentro do intervalo do mês
    // e ordenar pela data (opcional, mas útil)
    const q = query(
      transactionsRef,
      where('date', '>=', startIso),
      where('date', '<=', endIso),
      orderBy('date', 'asc') // Ordenar por data
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map(transactions => transactions as CashTransaction[]), // Cast para o tipo correto
      catchError(error => {
        console.error(`Erro ao buscar transações para ${month}/${year}:`, error);
        // Retornar um array vazio em caso de erro
        return of([]);
      })
    );
  }

  // Atualizar uma transação existente
  updateTransaction(id: string, transaction: Partial<CashTransaction>): Observable<void> {
    const docRef = doc(this.firestore, 'cashTransactions', id);
    return from(updateDoc(docRef, transaction));
  }

  // Excluir uma transação
  deleteTransaction(id: string): Observable<void> {
    const docRef = doc(this.firestore, 'cashTransactions', id);
    return from(deleteDoc(docRef));
  }

  // Registrar pagamento para um agendamento
  registerAppointmentPayment(
    appointment: Appointment,
    paymentMethod: 'dinheiro' | 'pix' | 'cartao',
    clientName: string
  ): Observable<string> {
    const transaction: CashTransaction = {
      appointmentId: appointment.id,
      date: appointment.dateTime,
      type: 'income',
      description: `Atendimento de ${clientName}`,
      amount: appointment.valorTotal,
      paymentMethod,
      podologaId: appointment.podologaId,
      podologaNome: appointment.podologaNome,
      procedureNames: appointment.procedureNames,
      clientName,
      createdAt: new Date().toISOString(),
      createdBy: '',
    };

    return this.addTransaction(transaction);
  }

  // Registrar uma despesa
  registerExpense(
    description: string,
    amount: number,
    category?: ExpenseCategory
  ): Observable<string> {
    const transaction: CashTransaction = {
      date: new Date().toISOString(),
      type: 'expense',
      description,
      amount,
      expenseCategory: category,
      createdAt: new Date().toISOString(),
      createdBy: '',
    };

    return this.addTransaction(transaction);
  }

  // Obter transações de um intervalo de datas
  getTransactionsByDateRange(
    startDateStr: string,
    endDateStr: string
  ): Observable<DailyCashReport> {
    console.log(`Buscando transações de ${startDateStr} até ${endDateStr}`);

    const startDateOnly = startDateStr.substring(0, 10);
    const endDateOnly = endDateStr.substring(0, 10);

    // Update collectionData calls with proper type assertion
    return collectionData(collection(this.firestore, 'cashTransactions')).pipe(
      map(allTransactions => {
        // Add type assertion
        const typedTransactions = allTransactions as CashTransaction[];
        const transactions = typedTransactions.filter(trans => {
          if (!trans.date) return false;
          const transDateStr = trans.date.substring(0, 10);
          return transDateStr >= startDateOnly && transDateStr <= endDateOnly;
        });

        // Inicializar relatório
        const report: DailyCashReport = {
          date: `${startDateStr} a ${endDateStr}`,
          incomes: [],
          expenses: [],
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
          cashTotal: 0,
          pixTotal: 0,
          cardTotal: 0,
          podologistStats: [],
        };

        // Separar receitas/despesas
        const incomes = transactions.filter(t => t.type === 'income');
        const expenses = transactions.filter(t => t.type === 'expense');

        // Preencher relatório
        report.incomes = incomes;
        report.expenses = expenses;
        report.totalIncome = incomes.reduce((sum, t) => sum + Number(t.amount), 0);
        report.totalExpense = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
        report.balance = report.totalIncome - report.totalExpense;

        // Calcular métodos de pagamento
        report.cashTotal = incomes
          .filter(t => t.paymentMethod === 'dinheiro')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        report.pixTotal = incomes
          .filter(t => t.paymentMethod === 'pix')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        report.cardTotal = incomes
          .filter(t => t.paymentMethod === 'cartao')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        // Estatísticas de podólogas
        const podologaMap = new Map<
          string,
          {
            id: string;
            nome: string;
            total: number;
            count: number;
            cashTotal: number;
            pixTotal: number;
            cardTotal: number;
          }
        >();

        incomes.forEach(income => {
          if (income.podologaId) {
            const stats = podologaMap.get(income.podologaId) || {
              id: income.podologaId,
              nome: income.podologaNome || 'Sem nome',
              total: 0,
              count: 0,
              cashTotal: 0,
              pixTotal: 0,
              cardTotal: 0,
            };

            stats.total += Number(income.amount);
            stats.count += 1;

            if (income.paymentMethod === 'dinheiro') stats.cashTotal += Number(income.amount);
            if (income.paymentMethod === 'pix') stats.pixTotal += Number(income.amount);
            if (income.paymentMethod === 'cartao') stats.cardTotal += Number(income.amount);

            podologaMap.set(income.podologaId, stats);
          }
        });

        report.podologistStats = Array.from(podologaMap.values());
        return report;
      }),
      catchError(error => {
        console.error('Erro ao buscar transações por período:', error);
        return of({
          date: `${startDateStr} a ${endDateStr}`,
          incomes: [],
          expenses: [],
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
          cashTotal: 0,
          pixTotal: 0,
          cardTotal: 0,
          podologistStats: [],
        });
      })
    );
  }
}
