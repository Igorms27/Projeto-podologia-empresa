import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';

import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

import { User } from '../../../../models/user.model';
import { NotificationService } from '../../../../services/notification.service';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-client-register-dialog',
  templateUrl: './client-register-dialog.component.html',
  styleUrls: ['./client-register-dialog.component.scss'],
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
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxMaskDirective,
  ],
  providers: [provideNgxMask()],
})
export class ClientRegisterDialogComponent {
  personalInfoForm: FormGroup;
  medicalInfoForm: FormGroup;
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<ClientRegisterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Record<string, unknown>,
    private fb: FormBuilder,
    private userService: UserService,
    private notificationService: NotificationService,
    private firestore: Firestore
  ) {
    // Inicializar o formulário de informações pessoais
    this.personalInfoForm = this.fb.group({
      name: ['', Validators.required],
      cpf: ['', Validators.required],
      email: ['', [Validators.email]],
      phone: ['', Validators.required],
      birthDate: [null],
      address: [''],
      zipCode: [''],
    });

    // Inicializar o formulário de informações médicas
    this.medicalInfoForm = this.fb.group({
      diabetes: [false],
      hypertension: [false],
      vascularDisease: [false],
      renalInsufficiency: [false],
      hematologicDisorders: [false],
      chemicalAllergies: [false],
      allergiesDescription: [''],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.personalInfoForm.invalid) {
      this.notificationService.warning('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    this.loading = true;

    // Obter os valores dos formulários
    const personalInfo = this.personalInfoForm.value;
    const medicalInfo = this.medicalInfoForm.value;

    // Criar o objeto de usuário
    const newUser: Omit<User, 'id'> = {
      name: personalInfo.name,
      cpf: personalInfo.cpf.replace(/\D/g, ''), // Remove caracteres não numéricos
      email: personalInfo.email || '',
      phone: personalInfo.phone || '',
      address: personalInfo.address || '',
      zipCode: personalInfo.zipCode || '',
      birthDate: personalInfo.birthDate
        ? new Date(personalInfo.birthDate).toISOString().split('T')[0]
        : undefined,
      registrationDate: new Date().toISOString(),
      role: 'client',
      medicalInfo: {
        diabetes: medicalInfo.diabetes || false,
        vascularDisease: medicalInfo.vascularDisease || false,
        hypertension: medicalInfo.hypertension || false,
        renalInsufficiency: medicalInfo.renalInsufficiency || false,
        hematologicDisorders: medicalInfo.hematologicDisorders || false,
        chemicalAllergies: medicalInfo.chemicalAllergies || false,
        allergiesDescription: medicalInfo.allergiesDescription || '',
      },
    };

    // Cadastrar o novo usuário usando o UserService
    this.userService.createUser(newUser).subscribe({
      next: userId => {
        this.loading = false;
        this.notificationService.success('Cliente cadastrado com sucesso!');
        this.dialogRef.close({ success: true, userId });
      },
      error: error => {
        this.loading = false;
        console.error('Erro ao cadastrar cliente:', error);
        this.notificationService.error('Erro ao cadastrar cliente: ' + error.message);
      },
    });
  }
}
