import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { delay, map } from 'rxjs/operators';

import { Appointment } from '../models/appointment.model';
import { AuditLog } from '../models/audit-log.model';
import { User } from '../models/user.model';
import { DateUtils } from '../shared/utils/date-utils';

/**
 * Interface para dados exportados de cliente
 */
interface ClientExportData {
  profile: User | null;
  appointments: Appointment[];
  auditLogs: AuditLog[];
  exportDate: string;
}

/**
 * Interface para relatórios administrativos
 */
interface AdminReportData {
  totalClients: number;
  clientsWithDiabetes: number;
  clientsWithHypertension: number;
  appointmentsTotal: number;
  appointmentsThisMonth: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor() {}

  /**
   * Obtém todos os clientes cadastrados na plataforma
   */
  getAllClients(): Observable<User[]> {
    console.log('Usando dados mockados para clientes');
    return of(this.getMockClients()).pipe(
      delay(300), // Simula o delay de rede
      map(clients => this.enhanceClientData(clients))
    );
  }

  /**
   * Gera dados mockados para teste e desenvolvimento
   */
  private getMockClients(): User[] {
    return [
      {
        id: 1,
        name: 'Ana Silva',
        cpf: '12345678900',
        email: 'ana.silva@example.com',
        phone: '11987654321',
        address: 'Rua das Flores, 123',
        birthDate: '1985-03-15',
        registrationDate: '2022-05-10',
        lastModified: '2023-11-28',
        role: 'client' as const,
        medicalInfo: {
          diabetes: true,
          vascularDisease: false,
          hypertension: true,
          renalInsufficiency: false,
          hematologicDisorders: false,
          chemicalAllergies: true,
          allergiesDescription: 'Alergia a látex e álcool isopropílico',
        },
      },
      {
        id: 2,
        name: 'Carlos Oliveira',
        cpf: '98765432100',
        email: 'carlos.oliveira@example.com',
        phone: '11912345678',
        address: 'Av. Principal, 456',
        birthDate: '1972-09-22',
        registrationDate: '2022-06-05',
        role: 'client' as const,
        medicalInfo: {
          diabetes: false,
          vascularDisease: true,
          hypertension: true,
          renalInsufficiency: false,
          hematologicDisorders: false,
          chemicalAllergies: false,
          allergiesDescription: '',
        },
      },
      {
        id: 3,
        name: 'Mariana Costa',
        cpf: '56789012345',
        email: 'mariana.costa@example.com',
        phone: '11998765432',
        address: 'Rua do Comércio, 789',
        birthDate: '1990-12-03',
        registrationDate: '2023-01-15',
        lastModified: DateUtils.toISOString(new Date()),
        role: 'client' as const,
        medicalInfo: {
          diabetes: false,
          vascularDisease: false,
          hypertension: false,
          renalInsufficiency: true,
          hematologicDisorders: true,
          chemicalAllergies: false,
          allergiesDescription: '',
        },
      },
      {
        id: 4,
        name: 'João Santos',
        cpf: '45678901234',
        email: 'joao.santos@example.com',
        phone: '11987651234',
        address: 'Praça Central, 50',
        birthDate: '1965-05-18',
        registrationDate: '2023-02-28',
        role: 'client' as const,
        medicalInfo: {
          diabetes: true,
          vascularDisease: true,
          hypertension: true,
          renalInsufficiency: false,
          hematologicDisorders: false,
          chemicalAllergies: false,
          allergiesDescription: '',
        },
      },
      {
        id: 5,
        name: 'Patrícia Lima',
        cpf: '78901234567',
        email: 'patricia.lima@example.com',
        phone: '11945678912',
        address: 'Rua das Árvores, 321',
        birthDate: '1988-08-30',
        registrationDate: '2023-03-10',
        lastModified: '2023-12-01',
        role: 'client' as const,
        medicalInfo: {
          diabetes: false,
          vascularDisease: false,
          hypertension: false,
          renalInsufficiency: false,
          hematologicDisorders: false,
          chemicalAllergies: true,
          allergiesDescription: 'Produtos com amônia',
        },
      },
      {
        id: 6,
        name: 'Roberto Almeida',
        cpf: '89012345678',
        email: 'roberto.almeida@example.com',
        phone: '11923456789',
        address: 'Alameda das Rosas, 100',
        birthDate: '1979-04-12',
        registrationDate: '2023-04-05',
        role: 'client' as const,
        medicalInfo: {
          diabetes: false,
          vascularDisease: false,
          hypertension: true,
          renalInsufficiency: false,
          hematologicDisorders: false,
          chemicalAllergies: false,
          allergiesDescription: '',
        },
      },
    ];
  }

  /**
   * Enriquece os dados dos clientes com informações adicionais como
   * agendamentos ativos, modificações recentes, etc.
   */
  private enhanceClientData(clients: User[]): User[] {
    return clients.map(client => {
      return {
        ...client,
        // Adiciona flag se o cliente tem agendamentos ativos (simulação)
        hasActiveAppointments: Math.random() > 0.7,
        // Adiciona data do último agendamento (simulação)
        lastAppointment: DateUtils.toISOString(this.getRandomPastDate(60)),
      };
    });
  }

  /**
   * Gera uma data aleatória entre hoje e X dias atrás
   */
  private getRandomPastDate(maxDaysAgo: number): Date {
    const today = new Date();
    const daysAgo = Math.floor(Math.random() * maxDaysAgo);
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - daysAgo);
    return pastDate;
  }

  /**
   * Obtém detalhes de um cliente específico pelo ID
   */
  getClientById(clientId: string): Observable<User | null> {
    const mockClients = this.getMockClients();
    const client = mockClients.find(c => c.id.toString() === clientId);
    return of(client || null).pipe(delay(300));
  }

  /**
   * Obtém os agendamentos de um cliente específico
   * @param clientId ID do cliente
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getClientAppointments(clientId: string): Observable<Appointment[]> {
    // Retorna lista vazia por enquanto - dados mockados seriam adicionados aqui
    return of([]).pipe(delay(300));
  }

  /**
   * Obtém o histórico de alterações de um cliente
   * @param clientId ID do cliente
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getClientAuditLogs(clientId: string): Observable<AuditLog[]> {
    // Retorna lista vazia por enquanto - dados mockados seriam adicionados aqui
    return of([]).pipe(delay(300));
  }

  /**
   * Exporta os dados completos de um cliente (perfil + agendamentos + logs)
   */
  getClientData(clientId: string): Observable<ClientExportData> {
    const client = this.getClientById(clientId);
    return client.pipe(
      map(clientData => ({
        profile: clientData,
        appointments: [],
        auditLogs: [],
        exportDate: DateUtils.toISOString(new Date()),
      }))
    );
  }

  /**
   * Obtém dados para relatórios e estatísticas
   */
  getAdminReports(): Observable<AdminReportData> {
    const clients = this.getMockClients();
    return of({
      totalClients: clients.length,
      clientsWithDiabetes: clients.filter(c => c.medicalInfo?.diabetes).length,
      clientsWithHypertension: clients.filter(c => c.medicalInfo?.hypertension).length,
      appointmentsTotal: 0,
      appointmentsThisMonth: 0,
    }).pipe(delay(300));
  }

  /**
   * Verifica se o usuário logado tem permissões de administrador
   */
  isAdmin(): Observable<boolean> {
    // Para desenvolvimento, sempre retorna true
    return of(true).pipe(delay(300));
  }
}
