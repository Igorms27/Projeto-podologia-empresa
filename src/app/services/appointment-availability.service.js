"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.AppointmentAvailabilityService = void 0;
var common_1 = require("@angular/common");
var core_1 = require("@angular/core");
var firestore_1 = require("@angular/fire/firestore");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var AppointmentAvailabilityService = function () {
    var _classDecorators = [(0, core_1.Injectable)({
            providedIn: 'root',
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AppointmentAvailabilityService = _classThis = /** @class */ (function () {
        function AppointmentAvailabilityService_1(firestore, notificationService, holidayService) {
            this.firestore = firestore;
            this.notificationService = notificationService;
            this.holidayService = holidayService;
        }
        /**
         * Verifica se um horário específico está disponível
         * @param date Data e hora do agendamento
         * @param podologistId ID do podólogo (opcional)
         * @returns Observable com a disponibilidade (true = disponível)
         */
        AppointmentAvailabilityService_1.prototype.isTimeSlotAvailable = function (date, podologistId) {
            var _this = this;
            var dateFormatted = (0, common_1.formatDate)(date, 'yyyy-MM-dd', 'pt');
            // Busca primeiro por bloqueios de horário
            var blockedTimesRef = (0, firestore_1.collection)(this.firestore, 'blockedTimes');
            var blockedQuery = (0, firestore_1.query)(blockedTimesRef, (0, firestore_1.where)('date', '==', dateFormatted));
            if (podologistId) {
                blockedQuery = (0, firestore_1.query)(blockedQuery, (0, firestore_1.where)('podologistId', '==', podologistId));
            }
            return (0, rxjs_1.from)((0, firestore_1.getDocs)(blockedQuery)).pipe((0, operators_1.switchMap)(function (snapshot) {
                // Se encontrou bloqueios, verifica se afetam o horário específico
                if (!snapshot.empty) {
                    var blockedTimes = snapshot.docs.map(function (doc) { return doc.data(); });
                    for (var _i = 0, blockedTimes_1 = blockedTimes; _i < blockedTimes_1.length; _i++) {
                        var blockedTime = blockedTimes_1[_i];
                        // Se for bloqueio para o dia inteiro
                        if (blockedTime.allDay) {
                            return (0, rxjs_1.of)(false);
                        }
                        // Se for bloqueio para um horário específico
                        if (blockedTime.timeSlots &&
                            blockedTime.timeSlots.includes((0, common_1.formatDate)(date, 'HH:mm', 'pt'))) {
                            return (0, rxjs_1.of)(false);
                        }
                    }
                }
                // Sem bloqueios, então verifica agendamentos existentes
                return _this.checkExistingAppointments(date, podologistId);
            }), (0, operators_1.catchError)(function (error) {
                console.error('Erro ao verificar disponibilidade:', error);
                _this.notificationService.error('Não foi possível verificar a disponibilidade do horário');
                return (0, rxjs_1.of)(false);
            }));
        };
        /**
         * Verifica se já existem agendamentos para um horário específico
         * @param date Data e hora do agendamento
         * @param podologistId ID do podólogo (opcional)
         * @returns Observable com a disponibilidade (true = disponível)
         */
        AppointmentAvailabilityService_1.prototype.checkExistingAppointments = function (date, podologistId) {
            var formattedDate = (0, common_1.formatDate)(date, 'yyyy-MM-dd', 'pt');
            var timeSlot = (0, common_1.formatDate)(date, 'HH:mm', 'pt');
            var appointmentsRef = (0, firestore_1.collection)(this.firestore, 'appointments');
            var appointmentQuery = (0, firestore_1.query)(appointmentsRef, (0, firestore_1.where)('date', '==', formattedDate), (0, firestore_1.where)('timeSlot', '==', timeSlot), (0, firestore_1.where)('status', 'in', ['scheduled', 'confirmed']));
            if (podologistId) {
                appointmentQuery = (0, firestore_1.query)(appointmentQuery, (0, firestore_1.where)('podologistId', '==', podologistId));
            }
            return (0, rxjs_1.from)((0, firestore_1.getDocs)(appointmentQuery)).pipe((0, operators_1.map)(function (snapshot) { return snapshot.empty; }), (0, operators_1.catchError)(function (error) {
                console.error('Erro ao verificar agendamentos existentes:', error);
                return (0, rxjs_1.of)(false);
            }));
        };
        /**
         * Obtém horários disponíveis para uma data específica
         * @param date Data para verificar disponibilidade
         * @param podologistId ID do podólogo (opcional)
         * @returns Observable com lista de horários disponíveis
         */
        AppointmentAvailabilityService_1.prototype.getAvailableTimeSlots = function (date, podologistId) {
            var _this = this;
            // Converter para string se for um objeto Date
            var dateStr = date instanceof Date ? (0, common_1.formatDate)(date, 'yyyy-MM-dd', 'pt') : date;
            // Lista de horários padrões
            var defaultTimeSlots = [
                '08:00',
                '08:30',
                '09:00',
                '09:30',
                '10:00',
                '10:30',
                '11:00',
                '11:30',
                '13:00',
                '13:30',
                '14:00',
                '14:30',
                '15:00',
                '15:30',
                '16:00',
                '16:30',
                '17:00',
                '17:30',
            ];
            var formattedDate = (0, common_1.formatDate)(dateStr, 'yyyy-MM-dd', 'pt');
            // Busca por bloqueios de horário
            var blockedTimesRef = (0, firestore_1.collection)(this.firestore, 'blockedTimes');
            var blockedQuery = (0, firestore_1.query)(blockedTimesRef, (0, firestore_1.where)('date', '==', formattedDate));
            if (podologistId) {
                blockedQuery = (0, firestore_1.query)(blockedQuery, (0, firestore_1.where)('podologistId', '==', podologistId));
            }
            return (0, rxjs_1.from)((0, firestore_1.getDocs)(blockedQuery)).pipe((0, operators_1.switchMap)(function (snapshot) {
                var availableSlots = __spreadArray([], defaultTimeSlots, true);
                // Remove horários bloqueados
                if (!snapshot.empty) {
                    var blockedTimes = snapshot.docs.map(function (doc) { return doc.data(); });
                    var _loop_1 = function (blockedTime) {
                        if (blockedTime.allDay) {
                            return { value: (0, rxjs_1.of)([]) };
                        }
                        // Corrigido o possível undefined
                        if (blockedTime.timeSlots && blockedTime.timeSlots.length > 0) {
                            availableSlots = availableSlots.filter(function (slot) { var _a; return !((_a = blockedTime.timeSlots) === null || _a === void 0 ? void 0 : _a.includes(slot)); });
                        }
                    };
                    for (var _i = 0, blockedTimes_2 = blockedTimes; _i < blockedTimes_2.length; _i++) {
                        var blockedTime = blockedTimes_2[_i];
                        var state_1 = _loop_1(blockedTime);
                        if (typeof state_1 === "object")
                            return state_1.value;
                    }
                }
                // Busca agendamentos existentes para a data
                return _this.getBookedTimeSlots(formattedDate, podologistId).pipe((0, operators_1.map)(function (bookedSlots) {
                    return availableSlots.filter(function (slot) { return !bookedSlots.includes(slot); });
                }));
            }), (0, operators_1.catchError)(function (error) {
                console.error('Erro ao obter horários disponíveis:', error);
                _this.notificationService.error('Não foi possível obter os horários disponíveis');
                return (0, rxjs_1.of)([]);
            }));
        };
        /**
         * Obtém horários já agendados para uma data específica
         * @param date Data para verificar
         * @param podologistId ID do podólogo (opcional)
         * @returns Observable com lista de horários agendados
         */
        AppointmentAvailabilityService_1.prototype.getBookedTimeSlots = function (date, podologistId) {
            var appointmentsRef = (0, firestore_1.collection)(this.firestore, 'appointments');
            var appointmentQuery = (0, firestore_1.query)(appointmentsRef, (0, firestore_1.where)('date', '==', date), (0, firestore_1.where)('status', 'in', ['scheduled', 'confirmed']));
            if (podologistId) {
                appointmentQuery = (0, firestore_1.query)(appointmentQuery, (0, firestore_1.where)('podologistId', '==', podologistId));
            }
            return (0, rxjs_1.from)((0, firestore_1.getDocs)(appointmentQuery)).pipe((0, operators_1.map)(function (snapshot) {
                if (snapshot.empty) {
                    return [];
                }
                return snapshot.docs.map(function (doc) {
                    var data = doc.data();
                    return data.timeSlot;
                });
            }), (0, operators_1.catchError)(function (error) {
                console.error('Erro ao obter horários agendados:', error);
                return (0, rxjs_1.of)([]);
            }));
        };
        /**
         * Bloqueia um horário ou dia inteiro
         * @param blockedTime Dados do bloqueio
         * @returns Observable com o ID do bloqueio criado
         */
        AppointmentAvailabilityService_1.prototype.blockTime = function (blockedTime) {
            var _this = this;
            var blockedTimeId = "block-".concat(Date.now());
            var blockedTimeRef = (0, firestore_1.doc)(this.firestore, "blockedTimes/".concat(blockedTimeId));
            return (0, rxjs_1.from)((0, firestore_1.setDoc)(blockedTimeRef, blockedTime)).pipe((0, operators_1.map)(function () { return blockedTimeId; }), (0, operators_1.tap)(function (id) {
                console.log('Horário bloqueado com sucesso:', id);
                _this.notificationService.success('Horário bloqueado com sucesso');
            }), (0, operators_1.catchError)(function (error) {
                console.error('Erro ao bloquear horário:', error);
                _this.notificationService.error('Não foi possível bloquear o horário');
                return (0, rxjs_1.of)('');
            }));
        };
        /**
         * Remove um bloqueio de horário
         * @param id ID do bloqueio
         * @returns Observable indicando sucesso ou falha
         */
        AppointmentAvailabilityService_1.prototype.unblockTime = function (id) {
            var _this = this;
            var blockedTimeRef = (0, firestore_1.doc)(this.firestore, "blockedTimes/".concat(id));
            return (0, rxjs_1.from)((0, firestore_1.deleteDoc)(blockedTimeRef)).pipe((0, operators_1.map)(function () { return true; }), (0, operators_1.tap)(function () {
                console.log('Bloqueio removido com sucesso');
                _this.notificationService.success('Bloqueio de horário removido com sucesso');
            }), (0, operators_1.catchError)(function (error) {
                console.error('Erro ao remover bloqueio:', error);
                _this.notificationService.error('Não foi possível remover o bloqueio de horário');
                return (0, rxjs_1.of)(false);
            }));
        };
        /**
         * Obtém todos os bloqueios para uma determinada data
         * @param date Data para verificar
         * @param podologistId ID do podólogo (opcional)
         * @returns Observable com lista de bloqueios
         */
        AppointmentAvailabilityService_1.prototype.getBlockedTimes = function (date, podologistId) {
            var _this = this;
            var blockedTimesRef = (0, firestore_1.collection)(this.firestore, 'blockedTimes');
            var blockedQuery = (0, firestore_1.query)(blockedTimesRef, (0, firestore_1.where)('date', '==', date));
            if (podologistId) {
                blockedQuery = (0, firestore_1.query)(blockedQuery, (0, firestore_1.where)('podologistId', '==', podologistId));
            }
            return (0, rxjs_1.from)((0, firestore_1.getDocs)(blockedQuery)).pipe((0, operators_1.map)(function (snapshot) {
                return snapshot.docs.map(function (doc) {
                    return __assign({ id: doc.id }, doc.data());
                });
            }), (0, operators_1.catchError)(function (error) {
                console.error('Erro ao obter bloqueios de horário:', error);
                _this.notificationService.error('Não foi possível carregar os bloqueios de horário');
                return (0, rxjs_1.of)([]);
            }));
        };
        /**
         * Verifica se um dia é dia útil (não é final de semana)
         * @param date Data a verificar
         * @returns true se for dia útil
         */
        AppointmentAvailabilityService_1.prototype.isBusinessDay = function (date) {
            var day = date.getDay();
            // Verifica se não é final de semana (0 = Domingo, 6 = Sábado) e não é feriado
            return day !== 0 && day !== 6 && !this.holidayService.isHoliday(date);
        };
        /**
         * Verifica a disponibilidade de um horário em todos os profissionais
         * @param dateTime Data e hora para verificar
         * @returns Observable com resultado da disponibilidade
         */
        AppointmentAvailabilityService_1.prototype.isGlobalTimeSlotAvailable = function (dateTime) {
            return this.isTimeSlotAvailable(dateTime.toISOString());
        };
        /**
         * Verifica se um horário está disponível para atualização de um agendamento existente
         * (ignora o próprio agendamento na verificação)
         */
        AppointmentAvailabilityService_1.prototype.isTimeSlotAvailableForUpdate = function (dateTime, podologaId) {
            return this.isTimeSlotAvailable(dateTime.toISOString(), podologaId);
        };
        return AppointmentAvailabilityService_1;
    }());
    __setFunctionName(_classThis, "AppointmentAvailabilityService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AppointmentAvailabilityService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AppointmentAvailabilityService = _classThis;
}();
exports.AppointmentAvailabilityService = AppointmentAvailabilityService;
