import { Appointment } from '../../../../models/appointment.model';

/**
 * Interface adaptadora para o histórico de clientes
 * Resolve a incompatibilidade entre o modelo de Appointment e as propriedades usadas no template HTML
 */
export interface AppointmentDisplay {
  id?: string;
  dateTime: string;
  time?: string;
  horario?: string;
  status: string;
  procedure?: { name: string };
  procedimento?: string;
  podologa?: { name: string };
  podologo?: string;
  valor?: number;
  observations?: string;
  observacoes?: string;
  cancelReason?: string;
  motivoCancelamento?: string;
}

/**
 * Converte um Appointment para o formato de exibição no histórico
 * Com tratamento de dados nulos ou inválidos
 */
export function mapAppointmentToDisplay(appointment: Appointment): AppointmentDisplay {
  if (!appointment) {
    console.error('Tentativa de mapear appointment nulo');
    return {
      dateTime: new Date().toISOString(),
      time: '--:--',
      horario: '--:--',
      status: 'desconhecido',
      procedure: { name: 'Procedimento não especificado' },
      procedimento: 'Procedimento não especificado',
      podologa: { name: 'Não especificado' },
      podologo: 'Não especificado',
      valor: 0,
      observations: '',
      observacoes: '',
      cancelReason: '',
      motivoCancelamento: '',
    };
  }

  try {
    const dateObj = appointment.dateTime ? new Date(appointment.dateTime) : new Date();
    const formattedTime = isNaN(dateObj.getTime())
      ? '--:--'
      : dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return {
      id: appointment.id || '',
      dateTime: appointment.dateTime || new Date().toISOString(),
      time: formattedTime,
      horario: formattedTime,
      status: appointment.status || 'desconhecido',
      procedure: {
        name: appointment.procedureNames?.length
          ? appointment.procedureNames[0]
          : 'Não especificado',
      },
      procedimento: appointment.procedureNames?.length
        ? appointment.procedureNames.join(', ')
        : 'Não especificado',
      podologa: {
        name: appointment.podologaNome || 'Não especificado',
      },
      podologo: appointment.podologaNome || 'Não especificado',
      valor: typeof appointment.valorTotal === 'number' ? appointment.valorTotal : 0,
      observations: '',
      observacoes: '',
      cancelReason: '',
      motivoCancelamento: '',
    };
  } catch (error) {
    console.error('Erro ao converter appointment para exibição:', error);
    return {
      id: appointment.id || '',
      dateTime: new Date().toISOString(),
      time: '--:--',
      horario: '--:--',
      status: 'erro',
      procedure: { name: 'Erro no processamento' },
      procedimento: 'Erro no processamento',
      podologa: { name: 'Erro' },
      podologo: 'Erro',
      valor: 0,
      observations: 'Erro ao processar dados do agendamento',
      observacoes: 'Erro ao processar dados do agendamento',
      cancelReason: '',
      motivoCancelamento: '',
    };
  }
}
