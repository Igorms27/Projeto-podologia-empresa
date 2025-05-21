import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cpf',
  standalone: true,
})
export class CpfPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }

    // Remove non-numeric characters
    const cpf = value.replace(/\D/g, '');

    // Format as XXX.XXX.XXX-XX
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}
