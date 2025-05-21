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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentStatusService = void 0;
var core_1 = require("@angular/core");
var firestore_1 = require("@angular/fire/firestore");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var AppointmentStatusService = function () {
    var _classDecorators = [(0, core_1.Injectable)({
            providedIn: 'root',
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AppointmentStatusService = _classThis = /** @class */ (function () {
        function AppointmentStatusService_1(firestore, notificationService, errorHandler) {
            this.firestore = firestore;
            this.notificationService = notificationService;
            this.errorHandler = errorHandler;
            // Coleção do Firestore
            this.appointmentsCollection = 'appointments';
        }
        /**
         * Método de diagnóstico para verificar a estrutura da coleção de agendamentos
         */
        AppointmentStatusService_1.prototype.debugAppointmentCollection = function () {
            console.log('[DEBUG-CRITICAL] Verificando estrutura da coleção de agendamentos...');
            var collectionRef = (0, firestore_1.collection)(this.firestore, this.appointmentsCollection);
            return (0, rxjs_1.from)((0, firestore_1.getDocs)(collectionRef)).pipe((0, operators_1.map)(function (snapshot) {
                console.log("[DEBUG-CRITICAL] Total de documentos na cole\u00E7\u00E3o: ".concat(snapshot.size));
                var docs = [];
                snapshot.forEach(function (docSnap) {
                    docs.push(__assign({ id: docSnap.id }, docSnap.data()));
                });
                return docs;
            }), (0, operators_1.catchError)(function (error) {
                console.error('[DEBUG-CRITICAL] Erro ao acessar coleção:', error);
                return (0, rxjs_1.of)([]);
            }));
        };
        /**
         * Cancela um agendamento (exclui completamente do Firebase)
         */
        AppointmentStatusService_1.prototype.cancelAppointment = function (appointment) {
            var _this = this;
            var id = typeof appointment === 'string' ? appointment : appointment.id;
            var originalAppointment = typeof appointment === 'string' ? null : appointment;
            if (!id) {
                console.error('[DEBUG-CRITICAL] Erro ao cancelar agendamento: ID não fornecido');
                return (0, rxjs_1.throwError)(function () { return new Error('ID de agendamento não fornecido'); });
            }
            console.log("[DEBUG-CRITICAL] ========= INICIANDO PROCESSO DE EXCLUS\u00C3O DE AGENDAMENTO =========");
            console.log("[DEBUG-CRITICAL] ID do agendamento: ".concat(id));
            if (originalAppointment) {
                console.log("[DEBUG-CRITICAL] Status atual do agendamento: ".concat(originalAppointment.status));
                console.log("[DEBUG-CRITICAL] Data/hora do agendamento: ".concat(originalAppointment.dateTime));
                console.log("[DEBUG-CRITICAL] Cliente: ".concat(originalAppointment.clientName));
            }
            // Obter referência ao documento
            var appointmentRef = (0, firestore_1.doc)(this.firestore, "".concat(this.appointmentsCollection, "/").concat(id));
            console.log("[DEBUG-CRITICAL] Caminho do documento: ".concat(this.appointmentsCollection, "/").concat(id));
            // Primeiro verificar se o documento existe
            return (0, rxjs_1.from)((0, firestore_1.getDoc)(appointmentRef)).pipe((0, operators_1.switchMap)(function (docSnap) {
                if (!docSnap.exists()) {
                    console.error("[DEBUG-CRITICAL] Documento do agendamento ".concat(id, " N\u00C3O ENCONTRADO!"));
                    return (0, rxjs_1.throwError)(function () { return new Error("Agendamento com ID ".concat(id, " n\u00E3o encontrado")); });
                }
                var data = docSnap.data();
                console.log("[DEBUG-CRITICAL] Documento encontrado no Firestore com dados:", data);
                // Salvar os dados do documento para retornar após a exclusão
                var appointmentData = __assign(__assign({ id: id }, data), { status: 'cancelado' });
                // Excluir o documento do Firebase
                console.log("[DEBUG-CRITICAL] Excluindo documento do agendamento ".concat(id, "..."));
                return (0, rxjs_1.from)((0, firestore_1.deleteDoc)(appointmentRef)).pipe((0, operators_1.map)(function () {
                    console.log("[DEBUG-CRITICAL] \u2705 Documento do agendamento ".concat(id, " exclu\u00EDdo com sucesso!"));
                    _this.notificationService.success('Agendamento cancelado e removido com sucesso!');
                    return appointmentData;
                }), (0, operators_1.catchError)(function (error) {
                    console.error("[DEBUG-CRITICAL] \u274C Erro ao excluir documento:", error);
                    _this.notificationService.error('Erro ao cancelar agendamento');
                    return (0, rxjs_1.throwError)(function () { return error; });
                }));
            }), (0, operators_1.catchError)(function (error) {
                console.error("[DEBUG-CRITICAL] \u274C Erro ao verificar documento:", error);
                _this.notificationService.error('Erro ao verificar documento do agendamento');
                return (0, rxjs_1.throwError)(function () { return error; });
            }));
        };
        /**
         * Confirma um agendamento
         */
        AppointmentStatusService_1.prototype.confirmAppointment = function (appointment) {
            var _this = this;
            var id = typeof appointment === 'string' ? appointment : appointment.id;
            if (!id) {
                console.error('Erro ao confirmar agendamento: ID não fornecido');
                return (0, rxjs_1.throwError)(function () { return new Error('ID de agendamento não fornecido'); });
            }
            var appointmentRef = (0, firestore_1.doc)(this.firestore, "".concat(this.appointmentsCollection, "/").concat(id));
            return (0, rxjs_1.from)((0, firestore_1.updateDoc)(appointmentRef, { status: 'confirmado' })).pipe((0, operators_1.map)(function () {
                _this.notificationService.success('Agendamento confirmado com sucesso!');
                if (typeof appointment === 'string') {
                    return { id: id, status: 'confirmado' };
                }
                else {
                    return __assign(__assign({}, appointment), { status: 'confirmado' });
                }
            }), (0, operators_1.catchError)(function (error) {
                console.error("Erro ao confirmar agendamento ".concat(id, ":"), error);
                _this.notificationService.error('Erro ao confirmar agendamento');
                return (0, rxjs_1.throwError)(function () { return error; });
            }));
        };
        /**
         * Finaliza um agendamento e o marca como completo
         */
        AppointmentStatusService_1.prototype.completeAppointment = function (appointment, paymentMethod) {
            var _this = this;
            var id = typeof appointment === 'string' ? appointment : appointment.id;
            if (!id) {
                console.error('Erro ao finalizar agendamento: ID não fornecido');
                return (0, rxjs_1.throwError)(function () { return new Error('ID de agendamento não fornecido'); });
            }
            var appointmentRef = (0, firestore_1.doc)(this.firestore, "".concat(this.appointmentsCollection, "/").concat(id));
            // Objeto a ser atualizado
            var updateData = {
                status: 'finalizado',
            };
            // Se o método de pagamento foi informado, incluí-lo na atualização
            if (paymentMethod) {
                updateData.paymentMethod = paymentMethod;
            }
            return (0, rxjs_1.from)((0, firestore_1.updateDoc)(appointmentRef, updateData)).pipe((0, operators_1.map)(function () {
                _this.notificationService.success('Agendamento finalizado com sucesso!');
                if (typeof appointment === 'string') {
                    return { id: id, status: 'finalizado', paymentMethod: paymentMethod };
                }
                else {
                    return __assign(__assign({}, appointment), { status: 'finalizado', paymentMethod: paymentMethod });
                }
            }), (0, operators_1.catchError)(function (error) {
                console.error("Erro ao finalizar agendamento ".concat(id, ":"), error);
                _this.notificationService.error('Erro ao finalizar agendamento');
                return (0, rxjs_1.throwError)(function () { return error; });
            }));
        };
        /**
         * Define um agendamento como "não compareceu" (no-show)
         */
        AppointmentStatusService_1.prototype.markAsNoShow = function (appointment) {
            var _this = this;
            var id = typeof appointment === 'string' ? appointment : appointment.id;
            if (!id) {
                console.error('Erro ao marcar como não compareceu: ID não fornecido');
                return (0, rxjs_1.throwError)(function () { return new Error('ID de agendamento não fornecido'); });
            }
            var appointmentRef = (0, firestore_1.doc)(this.firestore, "".concat(this.appointmentsCollection, "/").concat(id));
            return (0, rxjs_1.from)((0, firestore_1.updateDoc)(appointmentRef, { status: 'no-show' })).pipe((0, operators_1.map)(function () {
                _this.notificationService.success('Agendamento marcado como não compareceu!');
                if (typeof appointment === 'string') {
                    return { id: id, status: 'no-show' };
                }
                else {
                    return __assign(__assign({}, appointment), { status: 'no-show' });
                }
            }), (0, operators_1.catchError)(function (error) {
                console.error("Erro ao marcar agendamento ".concat(id, " como n\u00E3o compareceu:"), error);
                _this.notificationService.error('Erro ao atualizar status do agendamento');
                return (0, rxjs_1.throwError)(function () { return error; });
            }));
        };
        return AppointmentStatusService_1;
    }());
    __setFunctionName(_classThis, "AppointmentStatusService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AppointmentStatusService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AppointmentStatusService = _classThis;
}();
exports.AppointmentStatusService = AppointmentStatusService;
