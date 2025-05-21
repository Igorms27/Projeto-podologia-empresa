"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUtils = void 0;
/**
 * Utilitários para manipulação de datas no sistema
 * Centraliza todas as operações relacionadas a datas para manter consistência
 */
var DateUtils = /** @class */ (function () {
    function DateUtils() {
    }
    /**
     * Normaliza uma data removendo o componente de tempo (hora, minutos, segundos)
     * Útil para comparar apenas datas sem considerar o horário
     * @param date Data a ser normalizada
     * @returns Nova instância de Date com o tempo zerado (00:00:00.000)
     */
    DateUtils.normalizeDate = function (date) {
        var normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
    };
    /**
     * Normaliza uma data e hora para garantir consistência nas comparações e armazenamento
     * @param date Data e hora a ser normalizada
     * @returns Nova instância de Date com segundos e milisegundos zerados
     */
    DateUtils.normalizeDateTime = function (date) {
        var normalized = new Date(date);
        normalized.setSeconds(0, 0); // Zerar segundos e milisegundos
        return normalized;
    };
    /**
     * Converte uma data para string no formato ISO (YYYY-MM-DD)
     * Padrão para armazenamento de datas (sem hora) no sistema
     * @param date Data a ser convertida
     * @returns String no formato YYYY-MM-DD
     */
    DateUtils.toISODateString = function (date) {
        var d = this.normalizeDate(date);
        return d.toISOString().split('T')[0];
    };
    /**
     * Converte uma data para string no formato ISO completo
     * Padrão para armazenamento de data e hora no sistema
     * @param date Data e hora a ser convertida
     * @returns String no formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
     */
    DateUtils.toISOString = function (date) {
        return date.toISOString();
    };
    /**
     * Converte uma data para string no formato de exibição (DD/MM/YYYY)
     * @param date Data a ser convertida
     * @returns String no formato DD/MM/YYYY
     */
    DateUtils.toDisplayDateString = function (date) {
        var day = date.getDate().toString().padStart(2, '0');
        var month = (date.getMonth() + 1).toString().padStart(2, '0');
        var year = date.getFullYear();
        return "".concat(day, "/").concat(month, "/").concat(year);
    };
    /**
     * Converte um horário para string no formato de exibição (HH:MM)
     * @param date Data e hora
     * @returns Apenas o horário no formato HH:MM
     */
    DateUtils.toTimeString = function (date) {
        var hours = date.getHours().toString().padStart(2, '0');
        var minutes = date.getMinutes().toString().padStart(2, '0');
        return "".concat(hours, ":").concat(minutes);
    };
    /**
     * Alias para toTimeString para manter consistência na nomenclatura
     * Converte um horário para string no formato de exibição (HH:MM)
     * @param date Data e hora
     * @returns Apenas o horário no formato HH:MM
     */
    DateUtils.toDisplayTimeString = function (date) {
        return this.toTimeString(date);
    };
    /**
     * Converte data e hora para string no formato de exibição (DD/MM/YYYY HH:MM)
     * @param date Data e hora
     * @returns String no formato DD/MM/YYYY HH:MM
     */
    DateUtils.toDisplayDateTimeString = function (date) {
        return "".concat(this.toDisplayDateString(date), " ").concat(this.toTimeString(date));
    };
    /**
     * Compara duas datas para verificar se são o mesmo dia (ignorando o horário)
     * @param date1 Primeira data
     * @param date2 Segunda data
     * @returns true se as datas representam o mesmo dia
     */
    DateUtils.isSameDay = function (date1, date2) {
        return (date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear());
    };
    /**
     * Compara se duas datas representam o mesmo momento (data e hora)
     * Considera apenas hora e minuto, ignorando segundos e milisegundos
     * @param date1 Primeira data e hora
     * @param date2 Segunda data e hora
     * @returns true se representam o mesmo momento
     */
    DateUtils.isSameDateTime = function (date1, date2) {
        return (this.isSameDay(date1, date2) &&
            date1.getHours() === date2.getHours() &&
            date1.getMinutes() === date2.getMinutes());
    };
    /**
     * Cria uma data a partir de componentes individuais
     * @param year Ano (ex: 2024)
     * @param month Mês (1-12)
     * @param day Dia (1-31)
     * @param hours Horas (0-23), opcional
     * @param minutes Minutos (0-59), opcional
     * @returns Nova instância de Date
     */
    DateUtils.createDate = function (year, month, day, hours, minutes) {
        if (hours === void 0) { hours = 0; }
        if (minutes === void 0) { minutes = 0; }
        // Ajustar mês (JavaScript usa 0-11 para meses)
        return new Date(year, month - 1, day, hours, minutes, 0, 0);
    };
    /**
     * Cria uma data a partir de uma string ISO
     * @param isoString String no formato ISO
     * @returns Nova instância de Date ou null se inválida
     */
    DateUtils.fromISOString = function (isoString) {
        try {
            var date = new Date(isoString);
            // Verificar se a data é válida
            if (isNaN(date.getTime())) {
                return null;
            }
            return date;
        }
        catch (error) {
            console.error('Erro ao converter string ISO para data:', error);
            return null;
        }
    };
    /**
     * Adiciona dias a uma data
     * @param date Data base
     * @param days Número de dias a adicionar (pode ser negativo)
     * @returns Nova data com os dias adicionados
     */
    DateUtils.addDays = function (date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };
    /**
     * Verifica se uma data é posterior a outra
     * @param date Data a verificar
     * @param compareWith Data de referência
     * @returns true se date é posterior a compareWith
     */
    DateUtils.isAfter = function (date, compareWith) {
        return date.getTime() > compareWith.getTime();
    };
    /**
     * Verifica se uma data é anterior a outra
     * @param date Data a verificar
     * @param compareWith Data de referência
     * @returns true se date é anterior a compareWith
     */
    DateUtils.isBefore = function (date, compareWith) {
        return date.getTime() < compareWith.getTime();
    };
    /**
     * Cria uma string de chave para cache ou identificação única baseada na data
     * @param date Data
     * @param includeTime Se verdadeiro, inclui hora e minuto na chave
     * @returns String formatada como YYYY-MM-DD ou YYYY-MM-DD_HH-MM
     */
    DateUtils.createDateKey = function (date, includeTime) {
        if (includeTime === void 0) { includeTime = false; }
        var datePart = "".concat(date.getFullYear(), "-").concat((date.getMonth() + 1).toString().padStart(2, '0'), "-").concat(date.getDate().toString().padStart(2, '0'));
        if (!includeTime) {
            return datePart;
        }
        var timePart = "".concat(date.getHours().toString().padStart(2, '0'), "-").concat(date.getMinutes().toString().padStart(2, '0'));
        return "".concat(datePart, "_").concat(timePart);
    };
    /**
     * Verifica se um horário já passou (somente hoje)
     * @param timeString Horário no formato HH:MM
     * @returns true se o horário já passou (considerando o dia atual)
     */
    DateUtils.hasTimePassed = function (timeString) {
        var now = new Date();
        var _a = timeString.split(':').map(Number), hours = _a[0], minutes = _a[1];
        if (now.getHours() > hours || (now.getHours() === hours && now.getMinutes() >= minutes)) {
            return true;
        }
        return false;
    };
    /**
     * Obtém a idade baseada na data de nascimento
     * @param birthDate Data de nascimento
     * @returns Idade em anos
     */
    DateUtils.getAge = function (birthDate) {
        var today = new Date();
        var age = today.getFullYear() - birthDate.getFullYear();
        var monthDiff = today.getMonth() - birthDate.getMonth();
        // Ajustar idade se ainda não fez aniversário no ano atual
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };
    /**
     * Formata uma data para o formato YYYY-MM-DD (útil para filtros)
     * @param date Data a ser formatada
     * @returns String no formato YYYY-MM-DD
     */
    DateUtils.formatDateToYYYYMMDD = function (date) {
        var year = date.getFullYear();
        var month = (date.getMonth() + 1).toString().padStart(2, '0');
        var day = date.getDate().toString().padStart(2, '0');
        return "".concat(year, "-").concat(month, "-").concat(day);
    };
    /**
     * FORMATOS DE DATA
     * Constantes que definem os formatos padrão usados no sistema
     */
    DateUtils.ISO_DATE_FORMAT = 'YYYY-MM-DD';
    DateUtils.ISO_DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss.sssZ';
    DateUtils.DISPLAY_DATE_FORMAT = 'DD/MM/YYYY';
    DateUtils.DISPLAY_TIME_FORMAT = 'HH:mm';
    DateUtils.DISPLAY_DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';
    return DateUtils;
}());
exports.DateUtils = DateUtils;
