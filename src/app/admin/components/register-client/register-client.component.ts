import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

import { LoggingService } from '../../../services/logging.service';
import { NotificationService } from '../../../services/notification.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-register-client',
  templateUrl: './register-client.component.html',
  styleUrls: ['./register-client.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCardModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatNativeDateModule,
    NgxMaskDirective,
  ],
  providers: [provideNgxMask()],
})
export class RegisterClientComponent {
  clientForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router,
    private logger: LoggingService
  ) {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      email: ['', [Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
      address: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      birthDate: ['', Validators.required],
      medicalInfo: this.fb.group({
        diabetes: [false],
        hypertension: [false],
        vascularDisease: [false],
        renalInsufficiency: [false],
        hematologicDisorders: [false],
        chemicalAllergies: [false],
        allergiesDescription: [''],
      }),
    });
  }

  onSubmit(): void {
    if (this.clientForm.valid) {
      this.isLoading = true;
      const formData = this.clientForm.value;

      // Formatar os dados do cliente de acordo com o modelo User
      const clientData = {
        name: formData.name,
        // Salvar CPF apenas com números
        cpf: String(formData.cpf).replace(/\D/g, ''),
        email: formData.email,
        // Salvar telefone apenas com números
        phone: String(formData.phone).replace(/\D/g, ''),
        address: formData.address,
        // Salvar CEP apenas com números (e garantir undefined se vazio)
        zipCode: formData.zipCode ? String(formData.zipCode).replace(/\D/g, '') : undefined,
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : undefined,
        registrationDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        role: 'client' as const,
        medicalInfo: {
          diabetes: formData.medicalInfo.diabetes || false,
          hypertension: formData.medicalInfo.hypertension || false,
          vascularDisease: formData.medicalInfo.vascularDisease || false,
          renalInsufficiency: formData.medicalInfo.renalInsufficiency || false,
          hematologicDisorders: formData.medicalInfo.hematologicDisorders || false,
          chemicalAllergies: formData.medicalInfo.chemicalAllergies || false,
          allergiesDescription: formData.medicalInfo.allergiesDescription || '',
        },
      };

      // Remover campos undefined antes de salvar
      const cleanedClientData = { ...clientData };
      // Iterar sobre as chaves do objeto real
      Object.keys(cleanedClientData).forEach(key => {
        // Usar um type assertion para garantir que a chave é válida para o objeto
        const keyTyped = key as keyof typeof cleanedClientData;
        if (cleanedClientData[keyTyped] === undefined) {
          delete cleanedClientData[keyTyped];
        }
      });

      this.userService.createUser(cleanedClientData).subscribe({
        next: () => {
          this.notificationService.success('Cliente cadastrado com sucesso!');
          this.router.navigate(['/admin/dashboard']);
        },
        error: (error: unknown) => {
          this.logger.error('Erro ao cadastrar cliente:', error);
          this.notificationService.error('Erro ao cadastrar cliente. Tente novamente.');
          this.isLoading = false;
        },
      });
    } else {
      this.notificationService.warning(
        'Por favor, preencha todos os campos obrigatórios corretamente.'
      );
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
