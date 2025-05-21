/**
 * Utilitários para manipulação de datas no sistema
 * Centraliza todas as operações relacionadas a datas para manter consistência
 */
export class DateUtils {
  /**
   * FORMATOS DE DATA
   * Constantes que definem os formatos padrão usados no sistema
   */
  static readonly ISO_DATE_FORMAT = 'YYYY-MM-DD';
  static readonly ISO_DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss.sssZ';
  static readonly DISPLAY_DATE_FORMAT = 'DD/MM/YYYY';
  static readonly DISPLAY_TIME_FORMAT = 'HH:mm';
  static readonly DISPLAY_DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';

  /**
   * Normaliza uma data removendo o componente de tempo (hora, minutos, segundos)
   * Útil para comparar apenas datas sem considerar o horário
   * @param date Data a ser normalizada
   * @returns Nova instância de Date com o tempo zerado (00:00:00.000)
   */
  static normalizeDate(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  /**
   * Normaliza uma data e hora para garantir consistência nas comparações e armazenamento
   * @param date Data e hora a ser normalizada
   * @returns Nova instância de Date com segundos e milisegundos zerados
   */
  static normalizeDateTime(date: Date): Date {
    const normalized = new Date(date);
    normalized.setSeconds(0, 0); // Zerar segundos e milisegundos
    return normalized;
  }

  /**
   * Converte uma data para string no formato ISO (YYYY-MM-DD)
   * Padrão para armazenamento de datas (sem hora) no sistema
   * @param date Data a ser convertida
   * @returns String no formato YYYY-MM-DD
   */
  static toISODateString(date: Date): string {
    const d = this.normalizeDate(date);
    return d.toISOString().split('T')[0];
  }

  /**
   * Converte uma data para string no formato ISO completo
   * Padrão para armazenamento de data e hora no sistema
   * @param date Data e hora a ser convertida
   * @returns String no formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
   */
  static toISOString(date: Date): string {
    return date.toISOString();
  }

  /**
   * Converte uma data para string no formato de exibição (DD/MM/YYYY)
   * @param date Data a ser convertida
   * @returns String no formato DD/MM/YYYY
   */
  static toDisplayDateString(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Converte um horário para string no formato de exibição (HH:MM)
   * @param date Data e hora
   * @returns Apenas o horário no formato HH:MM
   */
  static toTimeString(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Alias para toTimeString para manter consistência na nomenclatura
   * Converte um horário para string no formato de exibição (HH:MM)
   * @param date Data e hora
   * @returns Apenas o horário no formato HH:MM
   */
  static toDisplayTimeString(date: Date): string {
    return this.toTimeString(date);
  }

  /**
   * Converte data e hora para string no formato de exibição (DD/MM/YYYY HH:MM)
   * @param date Data e hora
   * @returns String no formato DD/MM/YYYY HH:MM
   */
  static toDisplayDateTimeString(date: Date): string {
    return `${this.toDisplayDateString(date)} ${this.toTimeString(date)}`;
  }

  /**
   * Compara duas datas para verificar se são o mesmo dia (ignorando o horário)
   * @param date1 Primeira data
   * @param date2 Segunda data
   * @returns true se as datas representam o mesmo dia
   */
  static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  /**
   * Compara se duas datas representam o mesmo momento (data e hora)
   * Considera apenas hora e minuto, ignorando segundos e milisegundos
   * @param date1 Primeira data e hora
   * @param date2 Segunda data e hora
   * @returns true se representam o mesmo momento
   */
  static isSameDateTime(date1: Date, date2: Date): boolean {
    return (
      this.isSameDay(date1, date2) &&
      date1.getHours() === date2.getHours() &&
      date1.getMinutes() === date2.getMinutes()
    );
  }

  /**
   * Cria uma data a partir de componentes individuais
   * @param year Ano (ex: 2024)
   * @param month Mês (1-12)
   * @param day Dia (1-31)
   * @param hours Horas (0-23), opcional
   * @param minutes Minutos (0-59), opcional
   * @returns Nova instância de Date
   */
  static createDate(
    year: number,
    month: number,
    day: number,
    hours: number = 0,
    minutes: number = 0
  ): Date {
    // Ajustar mês (JavaScript usa 0-11 para meses)
    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  }

  /**
   * Cria uma data a partir de uma string ISO
   * @param isoString String no formato ISO
   * @returns Nova instância de Date ou null se inválida
   */
  static fromISOString(isoString: string): Date | null {
    try {
      const date = new Date(isoString);
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        return null;
      }
      return date;
    } catch (error) {
      console.error('Erro ao converter string ISO para data:', error);
      return null;
    }
  }

  /**
   * Adiciona dias a uma data
   * @param date Data base
   * @param days Número de dias a adicionar (pode ser negativo)
   * @returns Nova data com os dias adicionados
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Verifica se uma data é posterior a outra
   * @param date Data a verificar
   * @param compareWith Data de referência
   * @returns true se date é posterior a compareWith
   */
  static isAfter(date: Date, compareWith: Date): boolean {
    return date.getTime() > compareWith.getTime();
  }

  /**
   * Verifica se uma data é anterior a outra
   * @param date Data a verificar
   * @param compareWith Data de referência
   * @returns true se date é anterior a compareWith
   */
  static isBefore(date: Date, compareWith: Date): boolean {
    return date.getTime() < compareWith.getTime();
  }

  /**
   * Cria uma string de chave para cache ou identificação única baseada na data
   * @param date Data
   * @param includeTime Se verdadeiro, inclui hora e minuto na chave
   * @returns String formatada como YYYY-MM-DD ou YYYY-MM-DD_HH-MM
   */
  static createDateKey(date: Date, includeTime: boolean = false): string {
    const datePart = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

    if (!includeTime) {
      return datePart;
    }

    const timePart = `${date.getHours().toString().padStart(2, '0')}-${date.getMinutes().toString().padStart(2, '0')}`;
    return `${datePart}_${timePart}`;
  }

  /**
   * Verifica se um horário já passou (somente hoje)
   * @param timeString Horário no formato HH:MM
   * @returns true se o horário já passou (considerando o dia atual)
   */
  static hasTimePassed(timeString: string): boolean {
    const now = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);

    if (now.getHours() > hours || (now.getHours() === hours && now.getMinutes() >= minutes)) {
      return true;
    }

    return false;
  }

  /**
   * Obtém a idade baseada na data de nascimento
   * @param birthDate Data de nascimento
   * @returns Idade em anos
   */
  static getAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Ajustar idade se ainda não fez aniversário no ano atual
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Formata uma data para o formato YYYY-MM-DD (útil para filtros)
   * @param date Data a ser formatada
   * @returns String no formato YYYY-MM-DD
   */
  static formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
