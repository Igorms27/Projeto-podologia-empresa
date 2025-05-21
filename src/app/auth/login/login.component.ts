import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm!: FormGroup; // Adicionando o operador ! para indicar que será inicializado
  isLoading = false;
  errorMessage = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/)]],
      password: ['', [Validators.required]],
    });
  }

  formatCpf(value: string): string {
    const digits = value.replace(/\D/g, '');

    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.substring(0, 3)}.${digits.substring(3)}`;
    } else if (digits.length <= 9) {
      return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6)}`;
    } else {
      return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6, 9)}-${digits.substring(9, 11)}`;
    }
  }

  onCpfInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const formattedValue = this.formatCpf(value);

    if (value !== formattedValue) {
      input.value = formattedValue;
      this.loginForm.get('cpf')?.setValue(formattedValue, { emitEvent: false });
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { cpf, password } = this.loginForm.value;
      const cpfNumbers = cpf.replace(/\D/g, '');

      console.log(`Tentando login com CPF: ${cpfNumbers}`);

      this.authService.login(cpfNumbers, password).subscribe({
        next: response => {
          if (!response || !response.success) {
            this.isLoading = false;
            this.errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';
            this.notificationService.error(this.errorMessage);
            return;
          }

          this.isLoading = false;
          // Mensagem personalizada com base no tipo de usuário
          const welcomeMessage =
            response.data?.role === 'admin'
              ? 'Login realizado com sucesso. Bem-vindo, Administrador!'
              : 'Login realizado com sucesso. Bem-vindo, Funcionário!';

          this.notificationService.success(welcomeMessage);
          this.router.navigate(['/admin/dashboard']);
        },
        error: error => {
          this.isLoading = false;
          console.error('Erro no login:', error);

          // Mensagens de erro mais específicas
          if (error.message === 'Senha de administrador incorreta') {
            this.errorMessage = 'Senha de administrador incorreta.';
          } else if (error.message === 'Senha de funcionário incorreta') {
            this.errorMessage = 'Senha de funcionário incorreta.';
          } else if (error.message === 'Usuário não autorizado') {
            this.errorMessage =
              'CPF não reconhecido. Acesso restrito a administradores e funcionários.';
          } else {
            this.errorMessage =
              error.message ||
              error.error?.message ||
              'Erro ao fazer login. Verifique suas credenciais.';
          }

          this.notificationService.error(this.errorMessage);
        },
      });
    }
  }
}
