export interface BlockedTime {
  id: string;
  date: string; // Formato 'yyyy-MM-dd'
  podologistId?: string; // Opcional - se não for fornecido, é um bloqueio global
  allDay: boolean; // Se é um bloqueio para o dia inteiro
  timeSlots?: string[]; // Lista de horários bloqueados (apenas se allDay = false)
  reason?: string; // Motivo do bloqueio
  createdAt: number; // Timestamp de criação
  createdBy: string; // ID do usuário que criou o bloqueio
}
