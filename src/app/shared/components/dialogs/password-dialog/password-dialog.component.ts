import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

export interface PasswordDialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
      <mat-form-field appearance="outline" style="width: 100%">
        <mat-label>Senha</mat-label>
        <input
          matInput
          [type]="hidePassword ? 'password' : 'text'"
          [(ngModel)]="password"
          placeholder="Digite a senha de administrador"
        />
        <button
          mat-icon-button
          matSuffix
          (click)="hidePassword = !hidePassword"
          [attr.aria-label]="'Mostrar senha'"
          [attr.aria-pressed]="hidePassword"
        >
          <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="!password" (click)="verifyPassword()">
        Acessar
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        max-width: 400px;
      }
    `,
  ],
})
export class PasswordDialogComponent {
  password: string = '';
  hidePassword: boolean = true;

  // Esta é a senha que será verificada - em um ambiente real, isso deve ser verificado no servidor
  private adminPassword: string = 'admin123';

  constructor(
    public dialogRef: MatDialogRef<PasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PasswordDialogData
  ) {}

  verifyPassword(): void {
    if (this.password === this.adminPassword) {
      this.dialogRef.close(true);
    } else {
      this.password = '';
      // Você pode adicionar feedback de erro aqui se quiser
    }
  }
}
