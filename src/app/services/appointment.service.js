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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.AppointmentService = void 0;
var core_1 = require("@angular/core");
var firestore_1 = require("@angular/fire/firestore");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var date_utils_1 = require("../shared/utils/date-utils");
var AppointmentService = function () {
    var _classDecorators = [(0, core_1.Injectable)({
            providedIn: 'root',
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AppointmentService = _classThis = /** @class */ (function () {
        function AppointmentService_1(firestore, notificationService, authService, errorHandler, availabilityService, queryService, statusService, holidayService, logging, zone) {
            this.firestore = firestore;
            this.notificationService = notificationService;
            this.authService = authService;
            this.errorHandler = errorHandler;
            this.availabilityService = availabilityService;
            this.queryService = queryService;
            this.statusService = statusService;
            this.holidayService = holidayService;
            this.logging = logging;
            this.zone = zone;
            this.appointmentsSubject = new rxjs_1.BehaviorSubject([]);
            this.appointments$ = this.appointmentsSubject.asObservable();
            // Coleção do Firestore
            this.appointmentsCollection = 'appointments';
            // Horários disponíveis para agendamento (intervalos de 30 minutos, das 9h30 às 17h30)
            this.availableTimeSlots = [
                '09:30',
                '10:00',
                '10:30',
                '11:00',
                '11:30',
                '12:00',
                '12:30',
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
            // Adicionando propriedade para o cache de agendamentos
            this.appointmentsCache = new Map();
            this.unsubscribeRealtime = null;
            // Iniciar o listener em tempo real imediatamente
            this.setupRealtimeUpdates();
        }
        /**
         * Configura um listener em tempo real para atualizações de agendamentos
         * Esta função substitui o loadAppointments antigo por uma versão em tempo real
         * @param startDate Data inicial (opcional)
         * @param endDate Data final (opcional)
         */
        AppointmentService_1.prototype.setupRealtimeUpdates = function (startDate, endDate) {
            var _this = this;
            try {
                // Cancelar qualquer listener existente
                if (this.unsubscribeRealtime) {
                    this.unsubscribeRealtime();
                }
                var appointmentsRef = (0, firestore_1.collection)(this.firestore, this.appointmentsCollection);
                var q = void 0;
                // Se temos um intervalo de datas, fazer a query específica
                if (startDate && endDate) {
                    // Query para o intervalo de datas
                    q = (0, firestore_1.query)(appointmentsRef, (0, firestore_1.where)('dateTime', '>=', startDate.toISOString()), (0, firestore_1.where)('dateTime', '<=', endDate.toISOString()));
                    this.logging.info("Iniciando listener em tempo real: ".concat(startDate.toLocaleDateString(), " a ").concat(endDate.toLocaleDateString()));
                }
                else {
                    // Query para ordenar por data/hora (caso geral)
                    q = (0, firestore_1.query)(appointmentsRef, (0, firestore_1.orderBy)('dateTime', 'desc'));
                    this.logging.info('Listener em tempo real para agendamentos configurado');
                }
                // Configurar um listener em tempo real
                this.unsubscribeRealtime = (0, firestore_1.onSnapshot)(q, function (snapshot) {
                    _this.zone.run(function () {
                        var appointments = [];
                        snapshot.forEach(function (doc) {
                            appointments.push(__assign({ id: doc.id }, doc.data()));
                        });
                        if (startDate && endDate) {
                            var dateKey = _this.formatDateForQuery(startDate);
                            _this.logging.info("\uD83D\uDD34 Atualiza\u00E7\u00E3o em tempo real para ".concat(dateKey, ": ").concat(appointments.length, " agendamentos"));
                            // Atualizar o cache
                            _this.appointmentsCache.set(dateKey, appointments);
                        }
                        else {
                            _this.logging.info("\uD83D\uDD34 Atualiza\u00E7\u00E3o em tempo real: ".concat(appointments.length, " agendamentos"));
                        }
                        // Se houve mudanças desde a última consulta
                        if (snapshot.docChanges().length > 0) {
                            // Registrar detalhes das mudanças
                            snapshot.docChanges().forEach(function (change) {
                                if (change.type === 'added') {
                                    _this.logging.info("Agendamento ADICIONADO: ".concat(change.doc.id));
                                }
                                if (change.type === 'modified') {
                                    _this.logging.info("Agendamento MODIFICADO: ".concat(change.doc.id));
                                }
                                if (change.type === 'removed') {
                                    _this.logging.info("Agendamento REMOVIDO: ".concat(change.doc.id));
                                }
                            });
                        }
                        // Atualizar o subject com os novos dados
                        _this.appointmentsSubject.next(appointments);
                    });
                }, function (error) {
                    _this.zone.run(function () {
                        _this.logging.error('Erro no listener em tempo real:', error);
                        // Tentar reconectar após um erro
                        setTimeout(function () {
                            _this.setupRealtimeUpdates(startDate, endDate);
                        }, 5000);
                    });
                });
            }
            catch (error) {
                this.logging.error('Erro ao configurar listener em tempo real:', error);
            }
        };
        /**
         * Recarrega agendamentos em tempo real para uma data específica
         * @param formattedDate Data formatada para consulta (YYYY-MM-DD)
         */
        AppointmentService_1.prototype.reloadAppointmentsRealtime = function (formattedDate) {
            this.logging.info("Configurando listener em tempo real para data: ".concat(formattedDate));
            // Invalidar o cache para esta data
            this.invalidateCache(new Date(formattedDate));
            // Configurar atualização em tempo real para a data específica
            var _a = formattedDate.split('-').map(function (part) { return parseInt(part, 10); }), year = _a[0], month = _a[1], day = _a[2];
            var startDate = new Date(year, month - 1, day, 0, 0, 0);
            var endDate = new Date(year, month - 1, day, 23, 59, 59);
            this.setupRealtimeUpdates(startDate, endDate);
        };
        /**
         * Invalida o cache para uma data específica
         * @param date Data para invalidar no cache
         */
        AppointmentService_1.prototype.invalidateCache = function (date) {
            var formattedDate = this.formatDateForQuery(date);
            this.logging.info("Invalidando cache para data: ".concat(formattedDate));
            // Atualizar o cache se existir
            if (this.appointmentsCache.has(formattedDate)) {
                this.appointmentsCache.delete(formattedDate);
                this.logging.info("Cache para ".concat(formattedDate, " removido com sucesso"));
            }
        };
        /**
         * Formata uma data para consulta no formato YYYY-MM-DD
         * @param date Data para formatar
         * @returns String formatada
         */
        AppointmentService_1.prototype.formatDateForQuery = function (date) {
            var year = date.getFullYear();
            var month = String(date.getMonth() + 1).padStart(2, '0');
            var day = String(date.getDate()).padStart(2, '0');
            return "".concat(year, "-").concat(month, "-").concat(day);
        };
        /**
         * Retorna todos os agendamentos
         */
        AppointmentService_1.prototype.getAppointments = function () {
            var appointmentsRef = (0, firestore_1.collection)(this.firestore, this.appointmentsCollection);
            return (0, firestore_1.collectionData)(appointmentsRef, { idField: 'id' }).pipe((0, operators_1.map)(function (data) { return data; }), this.errorHandler.handleObservableError('AppointmentService.getAppointments'));
        };
        /**
         * Verifica se o usuário atual tem permissão para criar agendamentos
         * @returns true se o usuário pode criar agendamentos
         */
        AppointmentService_1.prototype.canCreateAppointment = function () {
            var isAdmin = this.authService.isAdmin();
            var isFuncionario = this.authService.isFuncionario();
            var currentUser = this.authService.getCurrentUser();
            console.log('DEBUG - Verificando permissão para criar agendamento:');
            console.log("- Usu\u00E1rio atual: ".concat(currentUser === null || currentUser === void 0 ? void 0 : currentUser.name, " (").concat(currentUser === null || currentUser === void 0 ? void 0 : currentUser.role, ")"));
            console.log("- isAdmin: ".concat(isAdmin));
            console.log("- isFuncionario: ".concat(isFuncionario));
            return isAdmin || isFuncionario;
        };
        /**
         * Verifica se o usuário atual tem permissão para manipular agendamentos
         * @returns true se o usuário pode manipular agendamentos
         */
        AppointmentService_1.prototype.canManageAppointment = function () {
            var isAdmin = this.authService.isAdmin();
            var isFuncionario = this.authService.isFuncionario();
            var currentUser = this.authService.getCurrentUser();
            console.log('DEBUG - Verificando permissão para manipular agendamento:');
            console.log("- Usu\u00E1rio atual: ".concat(currentUser === null || currentUser === void 0 ? void 0 : currentUser.name, " (").concat(currentUser === null || currentUser === void 0 ? void 0 : currentUser.role, ")"));
            console.log("- isAdmin: ".concat(isAdmin));
            console.log("- isFuncionario: ".concat(isFuncionario));
            return isAdmin || isFuncionario;
        };
        /**
         * Cria um novo agendamento com verificação RIGOROSA de disponibilidade
         */
        AppointmentService_1.prototype.createAppointment = function (appointment) {
            var _this = this;
            // Verificar se o usuário atual tem permissão para criar agendamentos
            if (!this.canCreateAppointment()) {
                console.error('Usuário sem permissão para criar agendamentos');
                return (0, rxjs_1.throwError)(function () { return new Error('Você não tem permissão para criar agendamentos.'); });
            }
            var appointmentsRef = (0, firestore_1.collection)(this.firestore, this.appointmentsCollection);
            // Extrair detalhes da data/hora
            var appointmentDate = new Date(appointment.dateTime);
            var formattedTime = date_utils_1.DateUtils.toTimeString(appointmentDate);
            console.log("INICIANDO CRIA\u00C7\u00C3O DE AGENDAMENTO: ".concat(date_utils_1.DateUtils.toDisplayDateTimeString(appointmentDate)));
            console.log("Procedimentos: ".concat(appointment.procedureNames.join(', ')));
            // VERIFICAÇÃO FINAL DE DISPONIBILIDADE - Modificado para verificar apenas para esta podóloga
            return this.availabilityService
                .isTimeSlotAvailable(appointmentDate.toISOString(), appointment.podologaId)
                .pipe((0, rxjs_1.switchMap)(function (isAvailable) {
                if (!isAvailable) {
                    console.error("\u274C HOR\u00C1RIO ".concat(formattedTime, " OCUPADO - Cria\u00E7\u00E3o de agendamento rejeitada"));
                    return (0, rxjs_1.throwError)(function () {
                        return new Error("O hor\u00E1rio ".concat(formattedTime, " j\u00E1 est\u00E1 ocupado por outro agendamento. Por favor, escolha outro hor\u00E1rio."));
                    });
                }
                console.log("\u2705 Hor\u00E1rio ".concat(formattedTime, " confirmado como DISPON\u00CDVEL"));
                // Adicionar campos importantes para facilitar consultas
                var timeSlot = "".concat(appointmentDate.getHours().toString().padStart(2, '0'), ":").concat(appointmentDate.getMinutes().toString().padStart(2, '0'));
                // Preparar o agendamento (status inicial = 'agendado')
                var appointmentData = __assign(__assign({}, appointment), { status: 'agendado', createdAt: date_utils_1.DateUtils.toISOString(new Date()), 
                    // Adicionar campos essenciais para consultas
                    timeSlot: timeSlot, timestamp: appointmentDate.getTime() });
                // Remover id se presente (para o Firestore gerar um novo)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                var id = appointmentData.id, newAppointmentData = __rest(appointmentData, ["id"]);
                console.log("Salvando agendamento com timestamp: ".concat(appointmentDate.getTime()));
                // Adicionar ao Firestore
                return (0, rxjs_1.from)((0, firestore_1.addDoc)(appointmentsRef, newAppointmentData)).pipe((0, operators_1.map)(function (docRef) {
                    console.log("\u2705 AGENDAMENTO CRIADO COM SUCESSO - ID: ".concat(docRef.id));
                    // Criar objeto do novo agendamento com ID
                    var newAppointment = __assign(__assign({}, appointmentData), { id: docRef.id });
                    // Atualizar a lista local de agendamentos
                    var currentAppointments = _this.appointmentsSubject.getValue();
                    _this.appointmentsSubject.next(__spreadArray(__spreadArray([], currentAppointments, true), [newAppointment], false));
                    // Invalidar cache para forçar recarga dos dados
                    _this.invalidateCache(appointmentDate);
                    // Notificar o usuário
                    _this.notificationService.success('Agendamento criado com sucesso!');
                    return newAppointment;
                }));
            }), 
            // Substituir o catchError por nosso handler centralizado
            this.errorHandler.handleObservableError('AppointmentService.createAppointment'));
        };
        /**
         * Verifica se uma data é um feriado
         */
        AppointmentService_1.prototype.isHoliday = function (date) {
            return this.holidayService.isHoliday(date);
        };
        /**
         * Verifica se uma data é dia útil (não é final de semana nem feriado)
         */
        AppointmentService_1.prototype.isBusinessDay = function (date) {
            return this.availabilityService.isBusinessDay(date);
        };
        /**
         * Verifica se um horário está disponível GLOBALMENTE (todas as podólogas)
         * @param dateTime Data e hora a serem verificados
         * @returns Observable que emite true se o horário estiver globalmente disponível
         */
        AppointmentService_1.prototype.isGlobalTimeSlotAvailable = function (dateTime) {
            return this.availabilityService.isGlobalTimeSlotAvailable(dateTime);
        };
        /**
         * Verifica se um horário está disponível para uma podóloga específica
         * @param dateTime Data e hora a serem verificados
         * @param podologaId ID da podóloga
         * @returns Observable que emite true se o horário estiver disponível
         */
        AppointmentService_1.prototype.isTimeSlotAvailable = function (dateTime, podologaId) {
            return this.availabilityService.isTimeSlotAvailable(dateTime.toISOString(), podologaId);
        };
        /**
         * Permite verificar ignorando um agendamento específico (útil para edições)
         * @param dateTime Nova data/hora
         * @param podologaId ID da podóloga
         */
        AppointmentService_1.prototype.isTimeSlotAvailableForUpdate = function (dateTime, podologaId) {
            return this.availabilityService.isTimeSlotAvailableForUpdate(dateTime, podologaId);
        };
        /**
         * Retorna os horários disponíveis para um dia específico
         * Usando lógica simplificada e corrigida para garantir precisão
         */
        AppointmentService_1.prototype.getAvailableTimeSlots = function (date, podologaId) {
            return this.availabilityService.getAvailableTimeSlots(date, podologaId);
        };
        /**
         * Retorna os agendamentos de um cliente específico
         */
        AppointmentService_1.prototype.getAppointmentsByClient = function (clientId) {
            return this.queryService.getAppointmentsByClient(clientId.toString());
        };
        /**
         * Retorna os agendamentos em um intervalo de datas específico
         * @param startDate Data de início no formato yyyy-MM-dd
         * @param endDate Data de fim no formato yyyy-MM-dd
         */
        AppointmentService_1.prototype.getAppointmentsByDateRange = function (startDate, endDate) {
            // Converter strings para Date
            var startDateObj = new Date(startDate);
            var endDateObj = new Date(endDate);
            return this.queryService.getAppointmentsByDateRange(startDateObj, endDateObj);
        };
        /**
         * Método alternativo para recuperar agendamentos por intervalo de datas
         * Usa um intervalo completo do dia para pegar todos os agendamentos
         */
        AppointmentService_1.prototype.getAllAppointmentsForRange = function (startDate, endDate) {
            return this.queryService.getAllAppointmentsForRange(startDate, endDate);
        };
        /**
         * Cancela um agendamento
         */
        AppointmentService_1.prototype.cancelAppointment = function (appointment) {
            var _this = this;
            console.log('[DEBUG-CRITICAL] AppointmentService.cancelAppointment - iniciando cancelamento');
            // Se for uma string (ID), criar objeto mínimo
            var appointmentObj = typeof appointment === 'string' ? { id: appointment } : appointment;
            console.log('[DEBUG-CRITICAL] Agendamento a ser cancelado:', appointmentObj);
            if (!appointmentObj || !appointmentObj.id) {
                console.error('[DEBUG-CRITICAL] Agendamento sem ID válido!');
                return (0, rxjs_1.throwError)(function () { return new Error('ID de agendamento inválido'); });
            }
            // Usar o serviço de status diretamente
            return this.statusService.cancelAppointment(appointmentObj).pipe((0, operators_1.tap)(function (result) {
                console.log('[DEBUG-CRITICAL] Resultado do cancelamento:', result);
                // Invalidar explicitamente o cache para este dia
                if (appointmentObj.dateTime) {
                    var appointmentDate = new Date(appointmentObj.dateTime);
                    console.log('[DEBUG-CRITICAL] Invalidando cache para a data:', appointmentDate);
                    _this.invalidateCache(appointmentDate);
                }
                // Recarregar os dados em tempo real após cancelamento
                console.log('[DEBUG-CRITICAL] Forçando recarga em tempo real após cancelamento');
                if (appointmentObj.dateTime) {
                    var date = new Date(appointmentObj.dateTime);
                    var formattedDate = _this.formatDateForQuery(date);
                    _this.reloadAppointmentsRealtime(formattedDate);
                }
                else {
                    // Se não temos data do agendamento, recarregar tudo
                    _this.setupRealtimeUpdates();
                }
            }), (0, operators_1.catchError)(function (error) {
                console.error('[DEBUG-CRITICAL] Erro no cancelamento:', error);
                // Tentar relatar informações adicionais para debug
                if (error && error.code) {
                    console.error("[DEBUG-CRITICAL] C\u00F3digo de erro: ".concat(error.code));
                }
                return (0, rxjs_1.throwError)(function () { return error; });
            }));
        };
        /**
         * Confirma um agendamento
         */
        AppointmentService_1.prototype.confirmAppointment = function (appointment) {
            var _this = this;
            // Verificar se o usuário atual tem permissão para manipular agendamentos
            if (!this.canManageAppointment()) {
                console.error('Usuário sem permissão para confirmar agendamentos');
                return (0, rxjs_1.throwError)(function () { return new Error('Você não tem permissão para confirmar agendamentos.'); });
            }
            return this.statusService
                .confirmAppointment(appointment)
                .pipe((0, operators_1.tap)(function () { return _this.setupRealtimeUpdates(); }));
        };
        /**
         * Finaliza um agendamento e o marca como completo
         */
        AppointmentService_1.prototype.completeAppointment = function (appointment, paymentMethod) {
            var _this = this;
            // Verificar se o usuário atual tem permissão para manipular agendamentos
            if (!this.canManageAppointment()) {
                console.error('Usuário sem permissão para finalizar agendamentos');
                return (0, rxjs_1.throwError)(function () { return new Error('Você não tem permissão para finalizar agendamentos.'); });
            }
            return this.statusService
                .completeAppointment(appointment, paymentMethod)
                .pipe((0, operators_1.tap)(function () { return _this.setupRealtimeUpdates(); }));
        };
        /**
         * Adiciona um novo feriado à lista
         */
        AppointmentService_1.prototype.addHoliday = function (date, description) {
            this.holidayService.addHoliday(date, description);
        };
        /**
         * Retorna a lista de feriados
         */
        AppointmentService_1.prototype.getHolidays = function () {
            return this.holidayService.getHolidays();
        };
        /**
         * Debugging: Retorna todos os agendamentos para uma data e profissional específicos
         * independente do status, para ajudar a diagnosticar problemas de disponibilidade
         */
        AppointmentService_1.prototype.debugAppointmentsForDateAndPodologa = function (date, podologaId) {
            return this.queryService.getAppointmentsByPodologaAndDate(podologaId, date).pipe((0, operators_1.map)(function (appointments) {
                return appointments.map(function (apt) {
                    var aptDate = new Date(apt.dateTime);
                    return __assign(__assign({ id: apt.id }, apt), { dateTimeFormatted: date_utils_1.DateUtils.toDisplayDateTimeString(aptDate) });
                });
            }));
        };
        /**
         * Função de manutenção: Limpa agendamentos cancelados antigos
         * para resolver problemas de disponibilidade de horários
         */
        AppointmentService_1.prototype.cleanupCanceledAppointments = function () {
            console.log('Iniciando limpeza de agendamentos cancelados antigos...');
            var appointmentsRef = (0, firestore_1.collection)(this.firestore, this.appointmentsCollection);
            // Buscar agendamentos cancelados
            var q = (0, firestore_1.query)(appointmentsRef, (0, firestore_1.where)('status', '==', 'cancelado'));
            return (0, rxjs_1.from)((0, firestore_1.getDocs)(q)).pipe((0, operators_1.map)(function (snapshot) {
                console.log("Total de agendamentos cancelados: ".concat(snapshot.size));
                var threshold = new Date();
                threshold.setDate(threshold.getDate() - 30); // 30 dias atrás
                var deletedIds = [];
                snapshot.forEach(function (docSnapshot) {
                    var data = docSnapshot.data();
                    var appointmentDate = new Date(data.dateTime);
                    // Se o agendamento for de mais de 30 dias atrás
                    if (appointmentDate < threshold) {
                        console.log("Apagando agendamento cancelado de ".concat(appointmentDate.toLocaleDateString()));
                        // Armazenar ID para retornar
                        deletedIds.push(docSnapshot.id);
                    }
                });
                console.log("".concat(deletedIds.length, " agendamentos cancelados antigos processados"));
                return deletedIds;
            }), (0, operators_1.catchError)(function (error) {
                console.error('Erro ao limpar agendamentos cancelados:', error);
                return (0, rxjs_1.of)([]);
            }));
        };
        /**
         * Obtém o nome de um cliente pelo ID
         */
        AppointmentService_1.prototype.getClientName = function (clientId) {
            return this.queryService.getClientName(clientId);
        };
        /**
         * DEBUG: Método para recuperar todos os agendamentos diretamente do banco
         * Usado apenas para diagnóstico
         */
        AppointmentService_1.prototype.debugGetAllAppointments = function () {
            return this.queryService.debugGetAllAppointments();
        };
        return AppointmentService_1;
    }());
    __setFunctionName(_classThis, "AppointmentService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AppointmentService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AppointmentService = _classThis;
}();
exports.AppointmentService = AppointmentService;
