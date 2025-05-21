import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

/**
 * Níveis de log disponíveis na aplicação
 */
export enum LogLevel {
  DEBUG = 0, // Detalhes técnicos, útil apenas para desenvolvimento
  INFO = 1, // Informações úteis sobre o estado da aplicação
  WARN = 2, // Avisos que não impedem funcionamento, mas podem indicar problemas
  ERROR = 3, // Erros que afetam o funcionamento da aplicação
}

/**
 * Tipo para dados de log que podem ser de diferentes tipos
 */
type LogData = unknown;

/**
 * Serviço de logging centralizado para toda a aplicação.
 * Permite controlar logs por nível e configurar comportamento em produção.
 * Implementa níveis de log configuráveis baseados no ambiente atual.
 */
@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  private production = environment.production;
  private minLevel: LogLevel;

  constructor() {
    // Definir o nível mínimo de log baseado na configuração do ambiente
    this.minLevel = this.getLogLevelFromString(environment.logLevel || 'DEBUG');

    // Log inicial para confirmar a configuração (apenas em não-produção)
    if (!this.production) {
      // Usar console diretamente aqui porque o serviço ainda está sendo inicializado
      console.log(
        `🔧 Sistema de log inicializado: ${LogLevel[this.minLevel]}, Produção: ${this.production}`
      );
    }
  }

  /**
   * Converte nível de log de string para enum
   */
  private getLogLevelFromString(level: string): LogLevel {
    switch (level.toUpperCase()) {
      case 'DEBUG':
        return LogLevel.DEBUG;
      case 'INFO':
        return LogLevel.INFO;
      case 'WARN':
        return LogLevel.WARN;
      case 'ERROR':
        return LogLevel.ERROR;
      default:
        return LogLevel.DEBUG;
    }
  }

  /**
   * Log de depuração - detalhes técnicos
   * Apenas visível em desenvolvimento e se nível configurado for DEBUG
   */
  debug(message: string, ...data: LogData[]): void {
    if (this.minLevel <= LogLevel.DEBUG) {
      console.debug(`🔍 DEBUG: ${message}`, ...data);
    }
  }

  /**
   * Log de informação - eventos normais da aplicação
   * Apenas visível se nível configurado for INFO ou menor
   */
  info(message: string, ...data: LogData[]): void {
    if (this.minLevel <= LogLevel.INFO) {
      console.log(`📘 INFO: ${message}`, ...data);
    }
  }

  /**
   * Log de aviso - problemas potenciais que não impedem funcionamento
   * Apenas visível se nível configurado for WARN ou menor
   */
  warn(message: string, ...data: LogData[]): void {
    if (this.minLevel <= LogLevel.WARN) {
      console.warn(`⚠️ WARN: ${message}`, ...data);
    }
  }

  /**
   * Log de erro - problemas críticos que afetam funcionamento
   * Sempre visível, independente do nível configurado
   * Em produção, poderia enviar para serviço de monitoramento como Firebase Crashlytics ou Sentry
   */
  error(message: string, ...data: LogData[]): void {
    // Erros são sempre logados, independente do nível
    console.error(`❌ ERROR: ${message}`, ...data);

    // Em implementação real para produção:
    // this.reportErrorToMonitoringService(message, data);
  }

  /**
   * Método para enviar erros para serviço de monitoramento (exemplo)
   * Implementação real dependeria do serviço escolhido
   */
  private reportErrorToMonitoringService(_message: string, _data: LogData[]): void {
    // Implementação para enviar o erro para Firebase Crashlytics, Sentry, etc.
    // Exemplo:
    // if (this.production) {
    //   Sentry.captureException(new Error(_message), { extra: { _data } });
    // }
  }
}
