import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface PaymentMethodDialogData {
  valor: number;
  clientName: string;
}

@Component({
  selector: 'app-payment-method-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Método de Pagamento</h2>
    <mat-dialog-content>
      <div class="payment-info">
        <p class="cliente">Cliente: {{ data.clientName || 'Cliente' }}</p>
        <p class="valor">Valor: R$ {{ data.valor.toFixed(2) }}</p>
      </div>
      <div class="payment-methods">
        <button
          mat-raised-button
          class="payment-btn dinheiro-btn"
          (click)="selectMethod('dinheiro')"
        >
          <mat-icon>money</mat-icon>
          <span>Dinheiro</span>
        </button>
        <button mat-raised-button class="payment-btn pix-btn" (click)="selectMethod('pix')">
          <mat-icon>phone_iphone</mat-icon>
          <span>PIX</span>
        </button>
        <button mat-raised-button class="payment-btn cartao-btn" (click)="selectMethod('cartao')">
          <mat-icon>credit_card</mat-icon>
          <span>Cartão</span>
        </button>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .payment-info {
        margin-bottom: 20px;
        padding: 15px;
        background-color: #f5f5f5;
        border-radius: 4px;
      }

      .cliente {
        font-weight: bold;
        margin-bottom: 5px;
      }

      .valor {
        font-size: 18px;
        color: #1976d2;
        font-weight: bold;
      }

      .payment-methods {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .payment-btn {
        display: flex;
        align-items: center;
        padding: 15px;
        justify-content: flex-start;
      }

      .payment-btn mat-icon {
        margin-right: 10px;
      }

      .dinheiro-btn {
        background-color: #4caf50; /* Verde */
        color: white;
      }

      .pix-btn {
        background-color: #1976d2; /* Azul */
        color: white;
      }

      .cartao-btn {
        background-color: #ffc107; /* Amarelo */
        color: black;
      }
    `,
  ],
})
export class PaymentMethodDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PaymentMethodDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentMethodDialogData
  ) {}

  selectMethod(method: 'dinheiro' | 'pix' | 'cartao'): void {
    this.dialogRef.close(method);
  }
}
