import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phone',
  standalone: true,
})
export class PhonePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }

    // Remove non-numeric characters
    const phone = value.replace(/\D/g, '');

    // Format based on length
    if (phone.length === 11) {
      // Mobile: (XX) XXXXX-XXXX
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 10) {
      // Landline: (XX) XXXX-XXXX
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    // Return as is if it doesn't match expected formats
    return value;
  }
}
