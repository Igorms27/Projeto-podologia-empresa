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
exports.NotificationService = void 0;
var core_1 = require("@angular/core");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var NotificationService = function () {
    var _classDecorators = [(0, core_1.Injectable)({
            providedIn: 'root',
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var NotificationService = _classThis = /** @class */ (function () {
        function NotificationService_1(snackBar) {
            this.snackBar = snackBar;
            // Para simulação local
            this.localNotifications = [];
            this.notificationsSubject = new rxjs_1.BehaviorSubject([]);
            this.loadNotifications();
        }
        /**
         * Carrega as notificações do localStorage
         */
        NotificationService_1.prototype.loadNotifications = function () {
            try {
                var storedData = localStorage.getItem('app_notifications');
                this.localNotifications = storedData ? JSON.parse(storedData) : [];
                this.notificationsSubject.next(this.localNotifications);
            }
            catch (error) {
                console.error('Erro ao carregar notificações:', error);
                this.localNotifications = [];
                this.notificationsSubject.next([]);
            }
        };
        /**
         * Salva as notificações no localStorage
         */
        NotificationService_1.prototype.saveNotifications = function () {
            try {
                localStorage.setItem('app_notifications', JSON.stringify(this.localNotifications));
                this.notificationsSubject.next(__spreadArray([], this.localNotifications, true));
            }
            catch (error) {
                console.error('Erro ao salvar notificações:', error);
            }
        };
        /**
         * Exibe uma mensagem de sucesso
         * @param message Mensagem a ser exibida
         * @param duration Duração em milissegundos (padrão: 3000ms)
         */
        NotificationService_1.prototype.success = function (message, duration) {
            if (duration === void 0) { duration = 3000; }
            this.snackBar.open(message, 'Fechar', {
                duration: duration,
                panelClass: ['success-notification'],
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
            });
        };
        /**
         * Exibe uma mensagem de erro
         * @param message Mensagem a ser exibida
         * @param duration Duração em milissegundos (padrão: 5000ms)
         */
        NotificationService_1.prototype.error = function (message, duration) {
            if (duration === void 0) { duration = 5000; }
            this.snackBar.open(message, 'Fechar', {
                duration: duration,
                panelClass: ['error-notification'],
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
            });
        };
        /**
         * Exibe uma mensagem de alerta
         * @param message Mensagem a ser exibida
         * @param duration Duração em milissegundos (padrão: 4000ms)
         */
        NotificationService_1.prototype.warning = function (message, duration) {
            if (duration === void 0) { duration = 4000; }
            this.snackBar.open(message, 'Fechar', {
                duration: duration,
                panelClass: ['warning-notification'],
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
            });
        };
        /**
         * Exibe uma mensagem informativa
         * @param message Mensagem a ser exibida
         * @param duration Duração em milissegundos (padrão: 3000ms)
         */
        NotificationService_1.prototype.info = function (message, duration) {
            if (duration === void 0) { duration = 3000; }
            this.snackBar.open(message, 'Fechar', {
                duration: duration,
                panelClass: ['info-notification'],
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
            });
        };
        /**
         * Cria uma nova notificação no sistema
         * @param notification Objeto com os dados da notificação
         * @returns Observable com a notificação criada
         */
        NotificationService_1.prototype.createNotification = function (notification) {
            var notificationWithId = __assign(__assign({}, notification), { id: notification.id || "notif-".concat(Date.now()) });
            this.localNotifications.push(notificationWithId);
            this.saveNotifications();
            return (0, rxjs_1.of)(notificationWithId).pipe((0, operators_1.delay)(300));
        };
        /**
         * Obtém todas as notificações de um usuário
         * @param userId ID do usuário
         * @returns Observable com array de notificações
         */
        NotificationService_1.prototype.getNotifications = function (userId) {
            return (0, rxjs_1.of)(this.localNotifications.filter(function (n) { return n.userId === userId; })).pipe((0, operators_1.delay)(300));
        };
        /**
         * Marca uma notificação como lida
         * @param notificationId ID da notificação
         * @returns Observable com a notificação atualizada
         */
        NotificationService_1.prototype.markAsRead = function (notificationId) {
            var index = this.localNotifications.findIndex(function (n) { return n.id === notificationId; });
            if (index === -1) {
                return (0, rxjs_1.of)(undefined).pipe((0, operators_1.delay)(300));
            }
            this.localNotifications[index] = __assign(__assign({}, this.localNotifications[index]), { read: true });
            this.saveNotifications();
            return (0, rxjs_1.of)(this.localNotifications[index]).pipe((0, operators_1.delay)(300));
        };
        return NotificationService_1;
    }());
    __setFunctionName(_classThis, "NotificationService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NotificationService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NotificationService = _classThis;
}();
exports.NotificationService = NotificationService;
