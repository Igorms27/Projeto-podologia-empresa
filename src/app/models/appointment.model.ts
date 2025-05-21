export interface Procedure {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category?: string; // Categoria do procedimento: Procedimentos, Tratamentos, Correção De Unhas
}

export interface ProcedureCategory {
  id: string;
  name: string;
  description?: string;
  procedures: Procedure[];
}

export interface Podologa {
  id: string;
  nome: string;
  especialidade: string;
  especialidades?: string[];
  foto?: string;
  rating: number;
}

export interface Appointment {
  id?: string;
  userId: string | number;
  procedures: string[];
  procedureNames: string[];
  podologaId: string;
  podologaNome: string;
  dateTime: string;
  timeSlot?: string; // Horário no formato HH:MM (para facilitar filtros)
  timestamp?: number; // Timestamp para facilitar ordenação e filtros
  status: 'agendado' | 'confirmado' | 'cancelado' | 'finalizado' | 'no-show';
  valorTotal: number;
  duracaoTotal: number;
  clientName?: string; // Nome do cliente
  createdAt?: string; // Data de criação do agendamento
  paymentMethod?: 'dinheiro' | 'pix' | 'cartao'; // Método de pagamento utilizado
}

export interface Notification {
  id: string;
  userId: string | number;
  title: string;
  message: string;
  dateTime: string;
  read: boolean;
}
