"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingService = exports.LogLevel = void 0;
var core_1 = require("@angular/core");
var environment_1 = require("../../environments/environment");
/**
 * Níveis de log disponíveis na aplicação
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Serviço de logging centralizado para toda a aplicação.
 * Permite controlar logs por nível e configurar comportamento em produção.
 * Implementa níveis de log configuráveis baseados no ambiente atual.
 */
var LoggingService = function () {
    var _classDecorators = [(0, core_1.Injectable)({
            providedIn: 'root',
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var LoggingService = _classThis = /** @class */ (function () {
        function LoggingService_1() {
            this.production = environment_1.environment.production;
            // Definir o nível mínimo de log baseado na configuração do ambiente
            this.minLevel = this.getLogLevelFromString(environment_1.environment.logLevel || 'DEBUG');
            // Log inicial para confirmar a configuração (apenas em não-produção)
            if (!this.production) {
                // Usar console diretamente aqui porque o serviço ainda está sendo inicializado
                console.log("\uD83D\uDD27 Sistema de log inicializado: ".concat(LogLevel[this.minLevel], ", Produ\u00E7\u00E3o: ").concat(this.production));
            }
        }
        /**
         * Converte nível de log de string para enum
         */
        LoggingService_1.prototype.getLogLevelFromString = function (level) {
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
        };
        /**
         * Log de depuração - detalhes técnicos
         * Apenas visível em desenvolvimento e se nível configurado for DEBUG
         */
        LoggingService_1.prototype.debug = function (message) {
            var data = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                data[_i - 1] = arguments[_i];
            }
            if (this.minLevel <= LogLevel.DEBUG) {
                console.debug.apply(console, __spreadArray(["\uD83D\uDD0D DEBUG: ".concat(message)], data, false));
            }
        };
        /**
         * Log de informação - eventos normais da aplicação
         * Apenas visível se nível configurado for INFO ou menor
         */
        LoggingService_1.prototype.info = function (message) {
            var data = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                data[_i - 1] = arguments[_i];
            }
            if (this.minLevel <= LogLevel.INFO) {
                console.log.apply(console, __spreadArray(["\uD83D\uDCD8 INFO: ".concat(message)], data, false));
            }
        };
        /**
         * Log de aviso - problemas potenciais que não impedem funcionamento
         * Apenas visível se nível configurado for WARN ou menor
         */
        LoggingService_1.prototype.warn = function (message) {
            var data = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                data[_i - 1] = arguments[_i];
            }
            if (this.minLevel <= LogLevel.WARN) {
                console.warn.apply(console, __spreadArray(["\u26A0\uFE0F WARN: ".concat(message)], data, false));
            }
        };
        /**
         * Log de erro - problemas críticos que afetam funcionamento
         * Sempre visível, independente do nível configurado
         * Em produção, poderia enviar para serviço de monitoramento como Firebase Crashlytics ou Sentry
         */
        LoggingService_1.prototype.error = function (message) {
            var data = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                data[_i - 1] = arguments[_i];
            }
            // Erros são sempre logados, independente do nível
            console.error.apply(console, __spreadArray(["\u274C ERROR: ".concat(message)], data, false));
            // Em implementação real para produção:
            // this.reportErrorToMonitoringService(message, data);
        };
        /**
         * Método para enviar erros para serviço de monitoramento (exemplo)
         * Implementação real dependeria do serviço escolhido
         */
        LoggingService_1.prototype.reportErrorToMonitoringService = function (_message, _data) {
            // Implementação para enviar o erro para Firebase Crashlytics, Sentry, etc.
            // Exemplo:
            // if (this.production) {
            //   Sentry.captureException(new Error(_message), { extra: { _data } });
            // }
        };
        return LoggingService_1;
    }());
    __setFunctionName(_classThis, "LoggingService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        LoggingService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return LoggingService = _classThis;
}();
exports.LoggingService = LoggingService;
