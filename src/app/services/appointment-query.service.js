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
exports.AppointmentQueryService = void 0;
var core_1 = require("@angular/core");
var firestore_1 = require("@angular/fire/firestore");
var rxjs_1 = require("rxjs");
var AppointmentQueryService = function () {
    var _classDecorators = [(0, core_1.Injectable)({
            providedIn: 'root',
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AppointmentQueryService = _classThis = /** @class */ (function () {
        function AppointmentQueryService_1(firestore, notificationService, logger) {
            this.firestore = firestore;
            this.notificationService = notificationService;
            this.logger = logger;
            this.CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutos
            this.cache = new Map();
            this.activeQueries = new Map();
        }
        /**
         * Limpa o cache de agendamentos
         */
        AppointmentQueryService_1.prototype.clearCache = function () {
            this.cache.clear();
            this.logger.info('Cache de agendamentos limpo');
        };
        /**
         * Gera uma chave para o cache baseada nos parâmetros
         */
        AppointmentQueryService_1.prototype.generateCacheKey = function (type, params) {
            return "".concat(type, ":").concat(JSON.stringify(params));
        };
        /**
         * Obtém dados do cache se disponíveis e válidos
         */
        AppointmentQueryService_1.prototype.getFromCache = function (key) {
            var cached = this.cache.get(key);
            if (!cached)
                return null;
            var now = Date.now();
            if (now - cached.timestamp > this.CACHE_EXPIRY_MS) {
                this.cache.delete(key);
                return null;
            }
            return cached.data;
        };
        /**
         * Salva dados no cache
         */
        AppointmentQueryService_1.prototype.saveToCache = function (key, data) {
            this.cache.set(key, {
                data: data,
                timestamp: Date.now(),
                key: key,
            });
        };
        /**
         * Obtém agendamentos por cliente
         * @param clientId ID do cliente
         * @returns Observable com lista de agendamentos
         */
        AppointmentQueryService_1.prototype.getAppointmentsByClient = function (clientId) {
            var _this = this;
            console.log("Buscando hist\u00F3rico para cliente ID: ".concat(clientId));
            var appointmentsRef = (0, firestore_1.collection)(this.firestore, 'appointments');
            var q = (0, firestore_1.query)(appointmentsRef, (0, firestore_1.where)('userId', '==', clientId), (0, firestore_1.orderBy)('dateTime', 'desc'));
            return (0, firestore_1.collectionData)(q, { idField: 'id' }).pipe((0, rxjs_1.map)(function (docs) {
                console.log("Agendamentos encontrados: ".concat(docs.length));
                return docs;
            }), (0, rxjs_1.catchError)(function (error) {
                console.error('Erro ao buscar histórico do cliente:', error);
                _this.notificationService.error('Não foi possível carregar o histórico do cliente');
                return (0, rxjs_1.of)([]);
            }));
        };
        /**
         * Obtém agendamentos por intervalo de datas com cache
         * @param startDate Data inicial
         * @param endDate Data final
         * @returns Observable com lista de agendamentos
         */
        AppointmentQueryService_1.prototype.getAppointmentsByDateRange = function (startDate, endDate) {
            var _this = this;
            // Ajustar endDate para incluir todo o dia final
            var adjustedEndDate = new Date(endDate);
            adjustedEndDate.setHours(23, 59, 59, 999);
            // Criar chave de cache
            var params = { start: startDate.toISOString(), end: adjustedEndDate.toISOString() };
            var cacheKey = this.generateCacheKey('dateRange', params);
            // Verificar se já existe uma consulta em andamento
            var activeQuery = this.activeQueries.get(cacheKey);
            if (activeQuery) {
                this.logger.info("Reusing existing query for date range: ".concat(startDate.toLocaleDateString(), " - ").concat(endDate.toLocaleDateString()));
                return activeQuery;
            }
            // Verificar cache
            var cachedData = this.getFromCache(cacheKey);
            if (cachedData) {
                this.logger.info("Using cached data for date range: ".concat(startDate.toLocaleDateString(), " - ").concat(endDate.toLocaleDateString()));
                return (0, rxjs_1.of)(cachedData);
            }
            // Converter para timestamp para comparação
            var startTimestamp = startDate.getTime();
            var endTimestamp = adjustedEndDate.getTime();
            this.logger.debug("Buscando agendamentos entre: ".concat(startDate.toLocaleDateString(), " e ").concat(endDate.toLocaleDateString()));
            // Tentar abordagem alternativa que não depende de timestamp
            this.logger.info("Experimentando consulta alternativa para a data ".concat(startDate.toLocaleDateString()));
            // Alternativa 1: Consulta sem filtros de timestamp para depuração
            var appointmentsRef = (0, firestore_1.collection)(this.firestore, 'appointments');
            var q = (0, firestore_1.query)(appointmentsRef);
            // Executar a consulta
            var queryObservable = (0, rxjs_1.from)((0, firestore_1.getDocs)(q)).pipe((0, rxjs_1.map)(function (querySnapshot) {
                var allAppointments = [];
                querySnapshot.forEach(function (doc) {
                    var data = doc.data();
                    allAppointments.push(__assign(__assign({}, data), { id: doc.id }));
                });
                _this.logger.debug("Recuperados ".concat(allAppointments.length, " agendamentos no total"));
                // Filtrar manualmente por data para garantir
                var filteredAppointments = allAppointments.filter(function (appointment) {
                    try {
                        if (!appointment.dateTime)
                            return false;
                        var appointmentDate = new Date(appointment.dateTime);
                        var appointmentTimestamp = appointmentDate.getTime();
                        var isInRange = appointmentTimestamp >= startTimestamp && appointmentTimestamp <= endTimestamp;
                        if (isInRange) {
                            _this.logger.debug("Encontrado agendamento para ".concat(appointmentDate.toLocaleDateString(), ": ").concat(appointment.clientName));
                        }
                        return isInRange;
                    }
                    catch (error) {
                        _this.logger.error("Erro ao processar data do agendamento ".concat(appointment.id), error);
                        return false;
                    }
                });
                _this.logger.debug("Encontrados ".concat(filteredAppointments.length, " agendamentos no per\u00EDodo ap\u00F3s filtro manual"));
                // Salva no cache
                _this.saveToCache(cacheKey, filteredAppointments);
                return filteredAppointments;
            }), (0, rxjs_1.catchError)(function (error) {
                _this.logger.error('Erro ao obter agendamentos por intervalo de data:', error);
                _this.notificationService.error('Não foi possível carregar os agendamentos para este período');
                return (0, rxjs_1.of)([]);
            }), 
            // Compartilhar a mesma resposta para várias assinaturas
            (0, rxjs_1.shareReplay)(1), (0, rxjs_1.tap)(function () {
                // Remover a consulta ativa após conclusão
                setTimeout(function () {
                    _this.activeQueries.delete(cacheKey);
                }, 100);
            }));
            // Armazenar a consulta ativa
            this.activeQueries.set(cacheKey, queryObservable);
            return queryObservable;
        };
        /**
         * Obtém agendamentos por data com cache eficiente
         * @param date Data dos agendamentos
         * @returns Observable com lista de agendamentos
         */
        AppointmentQueryService_1.prototype.getAppointmentsByDate = function (date) {
            // Define o início do dia (00:00:00)
            var startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            // Define o fim do dia (23:59:59.999)
            var endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            return this.getAppointmentsByDateRange(startOfDay, endOfDay);
        };
        /**
         * Obtém agendamentos por data
         * @param date Data dos agendamentos
         * @returns Observable com lista de agendamentos
         */
        AppointmentQueryService_1.prototype.getAppointmentsByDateRangeOld = function (date) {
            var _this = this;
            // Define o início do dia (00:00:00)
            var startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            // Define o fim do dia (23:59:59.999)
            var endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            var appointmentsRef = (0, firestore_1.collection)(this.firestore, 'appointments');
            var q = (0, firestore_1.query)(appointmentsRef, (0, firestore_1.where)('timestamp', '>=', startOfDay.getTime()), (0, firestore_1.where)('timestamp', '<=', endOfDay.getTime()), (0, firestore_1.orderBy)('timestamp', 'asc'));
            return (0, firestore_1.collectionData)(q, { idField: 'id' }).pipe((0, rxjs_1.map)(function (docs) { return docs; }), (0, rxjs_1.catchError)(function (error) {
                console.error('Erro ao obter agendamentos para a data:', error);
                _this.notificationService.error('Não foi possível carregar os agendamentos para esta data');
                return (0, rxjs_1.of)([]);
            }));
        };
        /**
         * Obtém todos os agendamentos (geralmente usado apenas para depuração)
         * @returns Observable com lista de agendamentos
         */
        AppointmentQueryService_1.prototype.getAllAppointments = function () {
            var _this = this;
            var appointmentsRef = (0, firestore_1.collection)(this.firestore, 'appointments');
            return (0, firestore_1.collectionData)(appointmentsRef, { idField: 'id' }).pipe((0, rxjs_1.map)(function (docs) { return docs; }), (0, rxjs_1.catchError)(function (error) {
                console.error('Erro ao obter todos os agendamentos:', error);
                _this.notificationService.error('Não foi possível carregar os agendamentos');
                return (0, rxjs_1.of)([]);
            }));
        };
        /**
         * Obtém um agendamento específico por ID
         * @param appointmentId ID do agendamento
         * @returns Observable com o agendamento
         */
        AppointmentQueryService_1.prototype.getAppointmentById = function (appointmentId) {
            var _this = this;
            var appointmentRef = (0, firestore_1.doc)(this.firestore, "appointments/".concat(appointmentId));
            return (0, rxjs_1.from)((0, firestore_1.getDoc)(appointmentRef)).pipe((0, rxjs_1.map)(function (docSnap) {
                if (!docSnap.exists()) {
                    return null;
                }
                return __assign({ id: docSnap.id }, docSnap.data());
            }), (0, rxjs_1.catchError)(function (error) {
                console.error('Erro ao obter agendamento por ID:', error);
                _this.notificationService.error('Não foi possível carregar os detalhes do agendamento');
                return (0, rxjs_1.of)(null);
            }));
        };
        /**
         * Obtém agendamentos por podóloga e data com cache
         * @param podologaId ID da podóloga
         * @param date Data dos agendamentos
         * @returns Observable com lista de agendamentos
         */
        AppointmentQueryService_1.prototype.getAppointmentsByPodologaAndDate = function (podologaId, date) {
            var _this = this;
            // Criar chave de cache
            var params = { podologaId: podologaId, date: date.toISOString() };
            var cacheKey = this.generateCacheKey('podologaDate', params);
            // Verificar se já existe uma consulta em andamento
            var activeQuery = this.activeQueries.get(cacheKey);
            if (activeQuery) {
                return activeQuery;
            }
            // Verificar cache
            var cachedData = this.getFromCache(cacheKey);
            if (cachedData) {
                return (0, rxjs_1.of)(cachedData);
            }
            // Define o início do dia (00:00:00)
            var startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            // Define o fim do dia (23:59:59.999)
            var endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            var appointmentsRef = (0, firestore_1.collection)(this.firestore, 'appointments');
            var q = (0, firestore_1.query)(appointmentsRef, (0, firestore_1.where)('podologaId', '==', podologaId), (0, firestore_1.where)('timestamp', '>=', startOfDay.getTime()), (0, firestore_1.where)('timestamp', '<=', endOfDay.getTime()), (0, firestore_1.orderBy)('timestamp', 'asc'));
            var queryObservable = (0, firestore_1.collectionData)(q, { idField: 'id' }).pipe((0, rxjs_1.map)(function (docs) {
                var appointments = docs;
                _this.saveToCache(cacheKey, appointments);
                return appointments;
            }), (0, rxjs_1.catchError)(function (error) {
                _this.logger.error('Erro ao obter agendamentos por podóloga e data:', error);
                _this.notificationService.error('Não foi possível carregar os agendamentos para esta podóloga');
                return (0, rxjs_1.of)([]);
            }), (0, rxjs_1.shareReplay)(1), (0, rxjs_1.tap)(function () {
                setTimeout(function () {
                    _this.activeQueries.delete(cacheKey);
                }, 100);
            }));
            this.activeQueries.set(cacheKey, queryObservable);
            return queryObservable;
        };
        /**
         * Obtém o nome de um cliente pelo ID
         * @param clientId ID do cliente
         * @returns Observable com o nome do cliente
         */
        AppointmentQueryService_1.prototype.getClientName = function (clientId) {
            var clientRef = (0, firestore_1.doc)(this.firestore, "users/".concat(clientId.toString()));
            return (0, rxjs_1.from)((0, firestore_1.getDoc)(clientRef)).pipe((0, rxjs_1.map)(function (docSnap) {
                if (!docSnap.exists()) {
                    return 'Cliente não encontrado';
                }
                var userData = docSnap.data();
                return userData['name'] || 'Cliente sem nome';
            }), (0, rxjs_1.catchError)(function (error) {
                console.error('Erro ao obter nome do cliente:', error);
                return (0, rxjs_1.of)('Erro ao carregar cliente');
            }));
        };
        /**
         * Obtém todos os agendamentos para um intervalo de datas completo
         * @param startDate Data inicial
         * @param endDate Data final
         * @returns Observable com lista de agendamentos
         */
        AppointmentQueryService_1.prototype.getAllAppointmentsForRange = function (startDate, endDate) {
            return this.getAppointmentsByDateRange(startDate, endDate);
        };
        /**
         * DEBUG: Método para recuperar todos os agendamentos diretamente do banco
         * Usado apenas para diagnóstico
         */
        AppointmentQueryService_1.prototype.debugGetAllAppointments = function () {
            return this.getAllAppointments();
        };
        /**
         * Invalida o cache para uma data específica
         * @param date Data para invalidar no cache
         */
        AppointmentQueryService_1.prototype.invalidateCacheForDate = function (date) {
            var dateStr = date.toISOString().split('T')[0];
            // Percorrer todas as entradas do cache e remover as relacionadas a esta data
            for (var _i = 0, _a = this.cache.entries(); _i < _a.length; _i++) {
                var key = _a[_i][0];
                if (key.includes(dateStr)) {
                    this.cache.delete(key);
                }
            }
            this.logger.info("Cache invalidado para a data: ".concat(date.toLocaleDateString()));
        };
        return AppointmentQueryService_1;
    }());
    __setFunctionName(_classThis, "AppointmentQueryService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AppointmentQueryService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AppointmentQueryService = _classThis;
}();
exports.AppointmentQueryService = AppointmentQueryService;
