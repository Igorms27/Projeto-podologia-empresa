import { Inject, Injectable, Optional } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import {
  LuxonDateAdapter,
  MAT_LUXON_DATE_ADAPTER_OPTIONS,
  MatLuxonDateAdapterOptions,
} from '@angular/material-luxon-adapter';

import { DateTime } from 'luxon';

@Injectable()
export class BrazilianDateAdapter extends LuxonDateAdapter {
  constructor(
    @Inject(MAT_DATE_LOCALE) dateLocale: string,
    @Optional() @Inject(MAT_LUXON_DATE_ADAPTER_OPTIONS) luxonOptions?: MatLuxonDateAdapterOptions
  ) {
    super(dateLocale, luxonOptions);
  }

  override format(date: DateTime, displayFormat: string): string {
    if (displayFormat === 'input') {
      const day = date.day;
      const month = date.month;
      const year = date.year;

      // Retorna data no formato DD/MM/AAAA
      return `${this.padNumber(day)}/${this.padNumber(month)}/${year}`;
    } else {
      return super.format(date, displayFormat);
    }
  }

  override parse(value: string): DateTime | null {
    if (!value) {
      return null;
    }

    // Tenta analisar a data considerando o formato DD/MM/AAAA
    const parts = value.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);

      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        try {
          return DateTime.fromObject({ year, month, day });
        } catch (
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          _error
        ) {
          return null;
        }
      }
    }

    return super.parse(value, 'dd/MM/yyyy');
  }

  private padNumber(n: number): string {
    if (n < 10) {
      return '0' + n;
    }
    return n.toString();
  }
}
