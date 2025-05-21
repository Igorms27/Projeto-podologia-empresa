import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Appointment, Procedure } from '../../../../models/appointment.model';
import { User } from '../../../../models/user.model';
import { AppointmentService } from '../../../../services/appointment.service';
import { UserService } from '../../../../services/user.service';

interface DialogData {
  date: Date;
  podologaId: string;
  podologaNome: string;
}

@Component({
  selector: 'app-novo-agendamento-admin',
  templateUrl: './novo-agendamento-admin.component.html',
  styleUrls: ['./novo-agendamento-admin.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
  ],
})
export class NovoAgendamentoAdminComponent implements OnInit {
  clientName: string = '';
  selectedProcedure: Procedure | null = null;
  customPrice: number | null = null;

  // Propriedades para lidar com a seleção de clientes
  filteredClients: User[] = [];
  selectedClient: User | null = null;
  loadingClients: boolean = false;
  allClients: User[] = []; // Armazena todos os clientes

  loading = false;
  errorMessage = '';

  procedures: Procedure[] = [
    {
      id: 'proc1',
      name: 'Limpeza Simples',
      description: 'Limpeza básica dos pés',
      duration: 30,
      price: 80,
      category: 'Procedimentos',
    },
    {
      id: 'proc2',
      name: 'Limpeza Profunda',
      description: 'Limpeza completa com esfoliação',
      duration: 45,
      price: 100,
      category: 'Procedimentos',
    },
    {
      id: 'proc3',
      name: 'Tratamento de Onicomicose',
      description: 'Tratamento para micose nas unhas',
      duration: 30,
      price: 120,
      category: 'Tratamentos',
    },
    {
      id: 'proc4',
      name: 'Correção com Órtese',
      description: 'Aplicação de órtese para correção',
      duration: 60,
      price: 150,
      category: 'Correção De Unhas',
    },
    {
      id: 'proc5',
      name: 'Remoção de Calosidade',
      description: 'Remoção de calosidades nos pés',
      duration: 40,
      price: 90,
      category: 'Procedimentos',
    },
    {
      id: 'proc6',
      name: 'Unha Encravada',
      description: 'Tratamento para unha encravada',
      duration: 45,
      price: 130,
      category: 'Tratamentos',
    },
  ];

  constructor(
    public dialogRef: MatDialogRef<NovoAgendamentoAdminComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private userService: UserService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    // Carregar lista de clientes
    this.loadClients();
  }

  /**
   * Carrega a lista de clientes do sistema
   */
  loadClients(): void {
    this.loadingClients = true;
    this.userService.getClients().subscribe({
      next: clients => {
        this.allClients = clients;
        this.filteredClients = [];
        this.loadingClients = false;
      },
      error: error => {
        console.error('Erro ao carregar clientes:', error);
        this.loadingClients = false;
      },
    });
  }

  /**
   * Filtra a lista de clientes com base no texto digitado
   */
  filterClients(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.clientName = (event.target as HTMLInputElement).value;

    if (this.selectedClient) {
      // Se já tem cliente selecionado e o texto mudou, limpa a seleção
      if (this.selectedClient.name.toLowerCase() !== filterValue) {
        this.clearClientSelection();
      }
      return;
    }

    if (!filterValue.trim()) {
      this.filteredClients = [];
      return;
    }

    // Filtra até 5 clientes que correspondam ao texto
    this.filteredClients = this.allClients
      .filter(
        client =>
          client.name.toLowerCase().includes(filterValue) ||
          (client.cpf && client.cpf.includes(filterValue)) ||
          (client.phone && client.phone.includes(filterValue))
      )
      .slice(0, 5); // Limita para mostrar apenas 5 resultados
  }

  /**
   * Seleciona um cliente da lista
   */
  selectClient(client: User): void {
    this.selectedClient = client;
    this.clientName = client.name;
    this.filteredClients = [];
  }

  /**
   * Limpa a seleção de cliente
   */
  clearClientSelection(): void {
    this.selectedClient = null;
  }

  /**
   * Método chamado quando o procedimento é alterado
   * Preenche o valor padrão do procedimento, mas permite alteração
   */
  onProcedureChange(): void {
    if (this.selectedProcedure) {
      this.customPrice = this.selectedProcedure.price;
    } else {
      this.customPrice = null;
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    this.loading = true;

    // Criar objeto de agendamento usando diretamente os dados da podóloga do data
    const appointment: Appointment = {
      userId: this.selectedClient ? this.selectedClient.id : 'guest', // ID do cliente se selecionado, ou 'guest' se não
      procedures: [this.selectedProcedure!.id],
      procedureNames: [this.selectedProcedure!.name],
      podologaId: this.data.podologaId,
      podologaNome: this.data.podologaNome,
      dateTime: this.data.date.toISOString(),
      status: 'agendado',
      valorTotal: this.customPrice!,
      duracaoTotal: this.selectedProcedure!.duration,
      clientName: this.clientName,
      createdAt: new Date().toISOString(),
    };

    this.dialogRef.close(appointment);
  }

  isFormValid(): boolean {
    // Verificar se é um dia útil
    if (!this.appointmentService.isBusinessDay(new Date(this.data.date))) {
      this.errorMessage =
        'Não é possível agendar em dias não úteis (finais de semana ou feriados).';
      return false;
    }

    return (
      !!this.clientName && !!this.selectedProcedure && !!this.customPrice && this.customPrice > 0
    );
  }
}
