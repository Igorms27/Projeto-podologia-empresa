import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { Firestore, addDoc, collection, doc, setDoc } from '@angular/fire/firestore';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

import { User } from '../../../../models/user.model';
import { AdminService } from '../../../../services/admin.service';
import { AppointmentService } from '../../../../services/appointment.service';
import { AuthService } from '../../../../services/auth.service';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-client-details-dialog',
  templateUrl: './client-details-dialog.component.html',
  styleUrls: ['./client-details-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    NgxMaskDirective,
  ],
  providers: [provideNgxMask()],
})
export class ClientDetailsDialogComponent {
  client: User;
  personalInfoForm: FormGroup;
  medicalInfoForm: FormGroup;

  // Aba inicial a ser exibida (0 = Informações Pessoais, 1 = Informações Médicas)
  selectedTabIndex = 0;

  constructor(
    public dialogRef: MatDialogRef<ClientDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: unknown,
    private fb: FormBuilder,
    private adminService: AdminService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private firestore: Firestore,
    private appointmentService: AppointmentService
  ) {
    // Conversão segura do tipo unknown para o formato esperado
    const typedData = data as Record<string, unknown>;

    // Verificar se data é um objeto User diretamente ou se está dentro de uma propriedade 'client'
    if (typedData['client']) {
      this.client = { ...(typedData['client'] as User) };
    } else {
      // Se não tiver a propriedade client, assume que o próprio objeto é um User
      this.client = { ...(typedData as unknown as User) };
    }

    // Definir a aba inicial com base no parâmetro, se fornecido
    if (typedData['initialTab'] !== undefined) {
      this.selectedTabIndex = typedData['initialTab'] as number;
    }

    // Garantir que medicalInfo está inicializado para evitar erros
    if (!this.client.medicalInfo) {
      this.client.medicalInfo = {
        diabetes: false,
        vascularDisease: false,
        hypertension: false,
        renalInsufficiency: false,
        hematologicDisorders: false,
        chemicalAllergies: false,
        allergiesDescription: '',
      };
    }

    // Inicializar o formulário de informações pessoais
    this.personalInfoForm = this.fb.group({
      name: [this.client.name || '', Validators.required],
      cpf: [this.client.cpf || '', Validators.required],
      email: [this.client.email || '', [Validators.email]],
      phone: [this.client.phone || '', Validators.required],
      birthDate: [this.client.birthDate ? new Date(this.client.birthDate) : null],
      address: [this.client.address || ''],
      zipCode: [this.client.zipCode || ''],
    });

    // Inicializar o formulário de informações médicas
    this.medicalInfoForm = this.fb.group({
      diabetes: [this.client.medicalInfo.diabetes || false],
      hypertension: [this.client.medicalInfo.hypertension || false],
      vascularDisease: [this.client.medicalInfo.vascularDisease || false],
      renalInsufficiency: [this.client.medicalInfo.renalInsufficiency || false],
      hematologicDisorders: [this.client.medicalInfo.hematologicDisorders || false],
      chemicalAllergies: [this.client.medicalInfo.chemicalAllergies || false],
      clientNotes: [this.client.medicalInfo.allergiesDescription || ''],
    });
  }

  close(): void {
    // Retornar indicação se houve alterações
    const updated = this.personalInfoForm.dirty || this.medicalInfoForm.dirty;
    this.dialogRef.close({ updated });
  }

  savePersonalInfo(): void {
    // Adicionar uma classe temporária ao botão para feedback visual imediato
    const saveButton = document.querySelector(
      '.form-actions button[color="primary"]'
    ) as HTMLButtonElement;
    if (saveButton) {
      saveButton.classList.add('saving');
      // Remover a classe após 2 segundos, independente do resultado
      setTimeout(() => saveButton.classList.remove('saving'), 2000);
    }

    if (this.personalInfoForm.valid) {
      this.notificationService.info('Salvando informações...');

      // Obter os valores do formulário
      const updatedInfo = this.personalInfoForm.value;

      // Formatar a data de nascimento adequadamente
      if (updatedInfo.birthDate instanceof Date) {
        updatedInfo.birthDate = updatedInfo.birthDate.toISOString().split('T')[0];
      }
      // Obter o usuário atual (administrador)
      const currentUser: User | null = this.authService.getCurrentUser();

      // Atualizar o objeto do cliente
      this.client = {
        ...this.client,
        ...updatedInfo,
        lastModified: new Date().toISOString(),
        lastModifiedBy: {
          id: currentUser?.id || 'admin',
          name: currentUser?.name || 'Administrador',
          role: 'admin',
        },
      };

      // Remover campos undefined antes de salvar
      const cleanedClientData = { ...this.client };
      Object.keys(cleanedClientData).forEach(key => {
        if (cleanedClientData[key as keyof User] === undefined) {
          delete cleanedClientData[key as keyof User];
        }
      });

      // Verificar se o firestore está inicializado
      if (!this.firestore) {
        this.notificationService.error('Erro: Firestore não inicializado');
        return;
      }

      // Garantir que temos um ID válido
      if (!this.client.id) {
        this.notificationService.error('Erro: ID do cliente não definido');
        return;
      }

      // Salvar no Firestore
      try {
        const userDoc = doc(this.firestore, `users/${this.client.id}`);

        setDoc(userDoc, cleanedClientData, { merge: true })
          .then(() => {
            this.personalInfoForm.markAsPristine();
            this.notificationService.success('Informações pessoais atualizadas com sucesso');
          })
          .catch(error => {
            console.error('Erro ao atualizar cliente no Firestore:', error);
            this.notificationService.error(
              'Erro ao salvar as alterações: ' + (error as Error).message
            );
          });
      } catch (error: unknown) {
        console.error('Erro ao criar referência do documento:', error);
        this.notificationService.error(
          'Erro ao processar a solicitação: ' + (error as Error).message
        );
      }
    } else {
      this.notificationService.warning('Formulário contém erros. Por favor, verifique os campos.');
      // Marcar todos os campos inválidos como touched para mostrar os erros
      Object.keys(this.personalInfoForm.controls).forEach(field => {
        const control = this.personalInfoForm.get(field);
        control?.markAsTouched();
      });
    }
  }

  saveMedicalInfo(): void {
    // Adicionar uma classe temporária ao botão para feedback visual imediato
    const saveButton = document.querySelector(
      '.tab-content .form-actions button[color="primary"]'
    ) as HTMLButtonElement;
    if (saveButton) {
      saveButton.classList.add('saving');
      // Remover a classe após 2 segundos, independente do resultado
      setTimeout(() => saveButton.classList.remove('saving'), 2000);
    }

    if (this.medicalInfoForm.valid) {
      this.notificationService.info('Salvando informações médicas...');

      // Obter o usuário atual (administrador)
      const currentUser: User | null = this.authService.getCurrentUser();

      // Esta variável estava sendo usada em versões anteriores do código
      const medicalInfoData = this.medicalInfoForm.value;

      // Atualizando o objeto do cliente
      this.client = {
        ...this.client,
        medicalInfo: {
          ...this.client.medicalInfo,
          diabetes: medicalInfoData.diabetes,
          hypertension: medicalInfoData.hypertension,
          vascularDisease: medicalInfoData.vascularDisease,
          renalInsufficiency: medicalInfoData.renalInsufficiency,
          hematologicDisorders: medicalInfoData.hematologicDisorders,
          chemicalAllergies: medicalInfoData.chemicalAllergies,
          allergiesDescription: medicalInfoData.clientNotes,
        },
        lastModified: new Date().toISOString(),
        lastModifiedBy: {
          id: currentUser?.id || 'admin',
          name: currentUser?.name || 'Administrador',
          role: 'admin',
        },
      };

      // Remover campos undefined antes de salvar
      const cleanedClientData = { ...this.client };
      Object.keys(cleanedClientData).forEach(key => {
        if (cleanedClientData[key as keyof User] === undefined) {
          delete cleanedClientData[key as keyof User];
        }
      });

      // Verificar se o firestore está inicializado
      if (!this.firestore) {
        this.notificationService.error('Erro: Firestore não inicializado');
        return;
      }

      // Garantir que temos um ID válido
      if (!this.client.id) {
        this.notificationService.error('Erro: ID do cliente não definido');
        return;
      }

      // Salvar no Firestore
      try {
        const userDoc = doc(this.firestore, `users/${this.client.id}`);

        setDoc(userDoc, cleanedClientData, { merge: true })
          .then(() => {
            this.medicalInfoForm.markAsPristine();
            this.notificationService.success('Informações médicas atualizadas com sucesso');
          })
          .catch(error => {
            console.error('Erro ao atualizar informações médicas no Firestore:', error);
            this.notificationService.error(
              'Erro ao salvar informações médicas: ' + (error as Error).message
            );
          });
      } catch (error: unknown) {
        console.error('Erro ao criar referência do documento:', error);
        this.notificationService.error(
          'Erro ao processar a solicitação: ' + (error as Error).message
        );
      }
    } else {
      this.notificationService.warning('Formulário contém erros. Por favor, verifique os campos.');
      // Marcar todos os campos inválidos como touched para mostrar os erros
      Object.keys(this.medicalInfoForm.controls).forEach(field => {
        const control = this.medicalInfoForm.get(field);
        control?.markAsTouched();
      });
    }
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      agendado: 'Agendado',
      confirmado: 'Confirmado',
      cancelado: 'Cancelado',
      finalizado: 'Concluído',
      'no-show': 'Não Compareceu',
    };

    return statusMap[status] || status;
  }

  /**
   * Cria um log de teste usando dados reais para diagnóstico
   */
  createTestLogWithRealData(): void {
    // Coleção para salvar o log diretamente (sem passar pelo service)
    const auditCollection = collection(this.firestore, 'auditLogs');

    // Dados de exemplo para telefone
    const testPhoneLog = {
      userId: this.client.id,
      timestamp: new Date(),
      action: 'update',
      field: 'phone',
      oldValue: 'telefone-antigo',
      newValue: 'telefone-novo',
      userAgent: navigator.userAgent,
      adminId: 'admin_test',
    };

    // Dados de exemplo para email
    const testEmailLog = {
      userId: this.client.id,
      timestamp: new Date(),
      action: 'update',
      field: 'email',
      oldValue: 'email-antigo@teste.com',
      newValue: 'email-novo@teste.com',
      userAgent: navigator.userAgent,
      adminId: 'admin_test',
    };

    // Primeiro adicionar log de telefone
    addDoc(auditCollection, testPhoneLog)
      .then(docRef => {
        console.log('Log de teste (telefone) criado com sucesso, ID:', docRef.id);

        // Depois adicionar log de email
        addDoc(auditCollection, testEmailLog)
          .then(docRef2 => {
            console.log('Log de teste (email) criado com sucesso, ID:', docRef2.id);
            this.notificationService.success('Logs de teste criados!');
          })
          .catch(error => {
            console.error('Erro ao criar log de teste (email):', error);
          });
      })
      .catch(error => {
        console.error('Erro ao criar log de teste (telefone):', error);
        this.notificationService.error('Erro ao criar logs de teste');
      });
  }
}
