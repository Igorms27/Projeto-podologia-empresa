import { Injectable } from '@angular/core';

import { DateUtils } from '../shared/utils/date-utils';

@Injectable({
  providedIn: 'root',
})
export class HolidayService {
  // Lista de feriados nacionais para 2024 e 2025
  private holidays: Date[] = [
    // 2024
    new Date(2024, 0, 1), // Ano Novo
    new Date(2024, 1, 12), // Carnaval
    new Date(2024, 1, 13), // Carnaval
    new Date(2024, 2, 29), // Sexta-feira Santa
    new Date(2024, 3, 21), // Tiradentes
    new Date(2024, 4, 1), // Dia do Trabalho
    new Date(2024, 4, 30), // Corpus Christi
    new Date(2024, 8, 7), // Independência
    new Date(2024, 9, 12), // Nossa Senhora Aparecida
    new Date(2024, 10, 2), // Finados
    new Date(2024, 10, 15), // Proclamação da República
    new Date(2024, 11, 25), // Natal

    // 2025
    new Date(2025, 0, 1), // Ano Novo
    new Date(2025, 2, 3), // Carnaval
    new Date(2025, 2, 4), // Carnaval
    new Date(2025, 3, 18), // Sexta-feira Santa
    new Date(2025, 3, 21), // Tiradentes
    new Date(2025, 4, 1), // Dia do Trabalho
    new Date(2025, 5, 19), // Corpus Christi
    new Date(2025, 8, 7), // Independência
    new Date(2025, 9, 12), // Nossa Senhora Aparecida
    new Date(2025, 10, 2), // Finados
    new Date(2025, 10, 15), // Proclamação da República
    new Date(2025, 11, 25), // Natal
  ];

  constructor() {}

  /**
   * Verifica se uma data é um feriado
   */
  isHoliday(date: Date): boolean {
    return this.holidays.some(holiday => DateUtils.isSameDay(holiday, date));
  }

  /**
   * Adiciona um novo feriado à lista
   */
  addHoliday(date: Date, description?: string): void {
    // Normaliza a data para evitar problemas com horário
    const normalizedDate = DateUtils.normalizeDate(date);

    // Verifica se o feriado já existe
    const exists = this.holidays.some(holiday => DateUtils.isSameDay(holiday, normalizedDate));

    if (!exists) {
      this.holidays.push(normalizedDate);
      console.log(
        `Feriado adicionado: ${DateUtils.toDisplayDateString(normalizedDate)} ${description || ''}`
      );
    }
  }

  /**
   * Retorna a lista de feriados
   */
  getHolidays(): Date[] {
    return [...this.holidays];
  }

  /**
   * Remove um feriado da lista
   */
  removeHoliday(date: Date): boolean {
    const initialLength = this.holidays.length;
    this.holidays = this.holidays.filter(holiday => !DateUtils.isSameDay(holiday, date));
    return this.holidays.length < initialLength;
  }
}
