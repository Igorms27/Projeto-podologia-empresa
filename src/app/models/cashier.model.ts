export interface CashTransaction {
  id?: string;

  // Data da transação (ISO string)
  date: string;

  // Tipo da transação (receita ou despesa)
  type: 'income' | 'expense';

  // Descrição da transação
  description: string;

  // Valor da transação
  amount: number;

  // Método de pagamento (opcional)
  paymentMethod?: 'dinheiro' | 'pix' | 'cartao';

  // Categoria da despesa (opcional)
  expenseCategory?: ExpenseCategory;

  // Detalhes para transações de atendimento
  appointmentId?: string;
  clientName?: string;
  podologaId?: string;
  podologaNome?: string;
  procedureNames?: string[];

  // Metadados
  createdAt: string;
  createdBy: string;
}

// Enum para categorias de despesas
export enum ExpenseCategory {
  MATERIAL_CONSUMO = 'material',
  MATERIAL_ESCRITORIO = 'escritorio',
  EQUIPAMENTOS = 'equipamento',
  MANUTENCAO = 'manutencao',
  SERVICOS = 'servicos',
  OUTROS = 'outros',
}

export interface DailyCashReport {
  date: string;
  incomes: CashTransaction[];
  expenses: CashTransaction[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
  cashTotal: number; // Total em dinheiro
  pixTotal: number; // Total em PIX
  cardTotal: number; // Total em cartão
  podologistStats: Array<{
    id: string;
    nome: string;
    total: number;
    count: number;
    cashTotal: number;
    pixTotal: number;
    cardTotal: number;
  }>;
}

// Novas interfaces para o resumo mensal
export interface PodologistMonthlyStat {
  podologistId: string; // Ou o tipo correto do ID
  name: string;
  appointmentCount: number;
  totalRevenue: number;
  procedures: Array<{
    name: string;
    count: number;
    abbreviation: string;
  }>;
}

export interface MonthlyReport {
  month: number;
  year: number;
  totalAppointmentIncome: number;
  podologistStats: PodologistMonthlyStat[];
}
