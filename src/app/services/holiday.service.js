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
exports.HolidayService = void 0;
var core_1 = require("@angular/core");
var date_utils_1 = require("../shared/utils/date-utils");
var HolidayService = function () {
    var _classDecorators = [(0, core_1.Injectable)({
            providedIn: 'root',
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var HolidayService = _classThis = /** @class */ (function () {
        function HolidayService_1() {
            // Lista de feriados nacionais para 2024 e 2025
            this.holidays = [
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
        }
        /**
         * Verifica se uma data é um feriado
         */
        HolidayService_1.prototype.isHoliday = function (date) {
            return this.holidays.some(function (holiday) { return date_utils_1.DateUtils.isSameDay(holiday, date); });
        };
        /**
         * Adiciona um novo feriado à lista
         */
        HolidayService_1.prototype.addHoliday = function (date, description) {
            // Normaliza a data para evitar problemas com horário
            var normalizedDate = date_utils_1.DateUtils.normalizeDate(date);
            // Verifica se o feriado já existe
            var exists = this.holidays.some(function (holiday) { return date_utils_1.DateUtils.isSameDay(holiday, normalizedDate); });
            if (!exists) {
                this.holidays.push(normalizedDate);
                console.log("Feriado adicionado: ".concat(date_utils_1.DateUtils.toDisplayDateString(normalizedDate), " ").concat(description || ''));
            }
        };
        /**
         * Retorna a lista de feriados
         */
        HolidayService_1.prototype.getHolidays = function () {
            return __spreadArray([], this.holidays, true);
        };
        /**
         * Remove um feriado da lista
         */
        HolidayService_1.prototype.removeHoliday = function (date) {
            var initialLength = this.holidays.length;
            this.holidays = this.holidays.filter(function (holiday) { return !date_utils_1.DateUtils.isSameDay(holiday, date); });
            return this.holidays.length < initialLength;
        };
        return HolidayService_1;
    }());
    __setFunctionName(_classThis, "HolidayService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        HolidayService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return HolidayService = _classThis;
}();
exports.HolidayService = HolidayService;
