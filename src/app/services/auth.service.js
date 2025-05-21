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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
// Importações externas
var core_1 = require("@angular/core");
var rxjs_interop_1 = require("@angular/core/rxjs-interop");
var auth_1 = require("@angular/fire/auth");
var firestore_1 = require("@angular/fire/firestore");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
/**
 * Serviço de autenticação e gestão de usuários
 */
var AuthService = function () {
    var _classDecorators = [(0, core_1.Injectable)({
            providedIn: 'root',
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AuthService = _classThis = /** @class */ (function () {
        function AuthService_1(router, auth, firestore, logger) {
            var _this = this;
            this.router = router;
            this.auth = auth;
            this.firestore = firestore;
            this.logger = logger;
            this.currentUser = (0, core_1.signal)(null);
            this.isAuthenticated = (0, core_1.computed)(function () { return _this.currentUser() !== null; });
            this.isAdmin = (0, core_1.computed)(function () { var _a; return ((_a = _this.currentUser()) === null || _a === void 0 ? void 0 : _a.role) === 'admin'; });
            this.isFuncionario = (0, core_1.computed)(function () { var _a; return ((_a = _this.currentUser()) === null || _a === void 0 ? void 0 : _a.role) === 'funcionario'; });
            this.currentUser$ = (0, rxjs_interop_1.toObservable)(this.currentUser);
            var savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                try {
                    var user = JSON.parse(savedUser);
                    this.currentUser.set(user);
                    this.logger.debug('Usuário carregado do localStorage:', user.name);
                }
                catch (e) {
                    this.logger.error('Erro ao carregar usuário do localStorage:', e);
                    localStorage.removeItem('currentUser');
                }
            }
        }
        /**
         * Realizar login do administrador ou funcionário
         */
        AuthService_1.prototype.login = function (cpf, password) {
            // Remover qualquer caractere não numérico do CPF
            var normalizedCpf = cpf.replace(/\D/g, '');
            this.logger.debug("Tentativa de login - CPF: ".concat(normalizedCpf, ", Senha: ").concat(password.substring(0, 1), "***"));
            // Verificar credenciais do admin (CPF: 12345678900, senha: admin)
            if (normalizedCpf === '12345678900') {
                this.logger.debug('CPF de administrador identificado');
                if (password === 'admin') {
                    this.logger.info('Login de administrador bem-sucedido');
                    var adminUser = {
                        id: 'admin',
                        name: 'Administrador',
                        cpf: '12345678900',
                        email: 'admin@institutodospes.com',
                        phone: '',
                        address: '',
                        registrationDate: new Date().toISOString(),
                        role: 'admin',
                        medicalInfo: {
                            diabetes: false,
                            vascularDisease: false,
                            hypertension: false,
                            renalInsufficiency: false,
                            hematologicDisorders: false,
                            chemicalAllergies: false,
                            allergiesDescription: '',
                        },
                    };
                    localStorage.setItem('currentUser', JSON.stringify(adminUser));
                    this.currentUser.set(adminUser);
                    return (0, rxjs_1.of)({ success: true, data: adminUser });
                }
                else {
                    this.logger.warn('Tentativa de login com senha de administrador incorreta');
                    return (0, rxjs_1.throwError)(function () { return new Error('Senha de administrador incorreta'); });
                }
            }
            // Verificar credenciais do funcionário (CPF: 98765432100, senha: funcionario)
            else if (normalizedCpf === '98765432100') {
                this.logger.debug('CPF de funcionário identificado');
                if (password === 'funcionario') {
                    this.logger.info('Login de funcionário bem-sucedido');
                    var funcionarioUser = {
                        id: 'funcionario',
                        name: 'Funcionário',
                        cpf: '98765432100',
                        email: 'funcionario@institutodospes.com',
                        phone: '',
                        address: '',
                        registrationDate: new Date().toISOString(),
                        role: 'funcionario',
                        medicalInfo: {
                            diabetes: false,
                            vascularDisease: false,
                            hypertension: false,
                            renalInsufficiency: false,
                            hematologicDisorders: false,
                            chemicalAllergies: false,
                            allergiesDescription: '',
                        },
                    };
                    localStorage.setItem('currentUser', JSON.stringify(funcionarioUser));
                    this.currentUser.set(funcionarioUser);
                    return (0, rxjs_1.of)({ success: true, data: funcionarioUser });
                }
                else {
                    this.logger.warn('Tentativa de login com senha de funcionário incorreta');
                    return (0, rxjs_1.throwError)(function () { return new Error('Senha de funcionário incorreta'); });
                }
            }
            this.logger.warn("Tentativa de login n\u00E3o autorizada. CPF n\u00E3o reconhecido: ".concat(normalizedCpf));
            return (0, rxjs_1.throwError)(function () { return new Error('Usuário não autorizado'); });
        };
        /**
         * Obter lista de clientes
         */
        AuthService_1.prototype.getClientsLegacy = function () {
            var _this = this;
            if (!this.firestore) {
                return (0, rxjs_1.throwError)(function () { return new Error('Firestore não inicializado'); });
            }
            var usersCollection = (0, firestore_1.collection)(this.firestore, 'users');
            var q = (0, firestore_1.query)(usersCollection, (0, firestore_1.where)('role', '==', 'client'));
            return (0, rxjs_1.from)((0, firestore_1.getDocs)(q)).pipe((0, operators_1.map)(function (querySnapshot) {
                var users = [];
                querySnapshot.forEach(function (doc) {
                    var userData = doc.data();
                    users.push({
                        id: doc.id,
                        name: userData['name'],
                        cpf: userData['cpf'],
                        email: userData['email'],
                        phone: userData['phone'],
                        address: userData['address'],
                        birthDate: userData['birthDate'],
                        registrationDate: userData['registrationDate'],
                        lastModified: userData['lastModified'],
                        lastModifiedBy: userData['lastModifiedBy'],
                        role: userData['role'],
                        hasActiveAppointments: userData['hasActiveAppointments'],
                        lastAppointment: userData['lastAppointment'],
                        medicalInfo: userData['medicalInfo'],
                    });
                });
                return users;
            }), (0, operators_1.catchError)(function (error) {
                _this.logger.error('Erro ao buscar clientes:', error);
                return (0, rxjs_1.throwError)(function () { return new Error('Erro ao buscar clientes: ' + error.message); });
            }));
        };
        /**
         * Buscar cliente por ID
         */
        AuthService_1.prototype.getClientById = function (id) {
            var _this = this;
            if (!this.firestore) {
                return (0, rxjs_1.throwError)(function () { return new Error('Firestore não inicializado'); });
            }
            var userDoc = (0, firestore_1.doc)(this.firestore, 'users', id);
            return (0, rxjs_1.from)((0, firestore_1.getDoc)(userDoc)).pipe((0, operators_1.map)(function (docSnapshot) {
                if (!docSnapshot.exists()) {
                    throw new Error('Cliente não encontrado');
                }
                var userData = docSnapshot.data();
                return {
                    id: docSnapshot.id,
                    name: userData['name'],
                    cpf: userData['cpf'],
                    email: userData['email'],
                    phone: userData['phone'],
                    address: userData['address'],
                    zipCode: userData['zipCode'],
                    birthDate: userData['birthDate'],
                    registrationDate: userData['registrationDate'],
                    lastModified: userData['lastModified'],
                    lastModifiedBy: userData['lastModifiedBy'],
                    role: userData['role'],
                    hasActiveAppointments: userData['hasActiveAppointments'],
                    lastAppointment: userData['lastAppointment'],
                    medicalInfo: userData['medicalInfo'],
                };
            }), (0, operators_1.catchError)(function (error) {
                _this.logger.error('Erro ao buscar cliente:', error);
                return (0, rxjs_1.throwError)(function () { return new Error('Erro ao buscar cliente: ' + error.message); });
            }));
        };
        /**
         * Buscar usuários por termo de busca
         */
        AuthService_1.prototype.searchUsers = function (term) {
            var _this = this;
            if (!this.firestore) {
                return (0, rxjs_1.throwError)(function () { return new Error('Firestore não inicializado'); });
            }
            var usersCollection = (0, firestore_1.collection)(this.firestore, 'users');
            var q = (0, firestore_1.query)(usersCollection, (0, firestore_1.where)('role', '==', 'client'));
            return (0, rxjs_1.from)((0, firestore_1.getDocs)(q)).pipe((0, operators_1.map)(function (querySnapshot) {
                var users = [];
                querySnapshot.forEach(function (doc) {
                    var userData = doc.data();
                    var user = {
                        id: doc.id,
                        name: userData['name'],
                        cpf: userData['cpf'],
                        email: userData['email'],
                        phone: userData['phone'],
                        address: userData['address'],
                        birthDate: userData['birthDate'],
                        registrationDate: userData['registrationDate'],
                        lastModified: userData['lastModified'],
                        lastModifiedBy: userData['lastModifiedBy'],
                        role: userData['role'],
                        hasActiveAppointments: userData['hasActiveAppointments'],
                        lastAppointment: userData['lastAppointment'],
                        medicalInfo: userData['medicalInfo'],
                    };
                    // Filtrar por termo de busca
                    if (user.name.toLowerCase().includes(term.toLowerCase()) ||
                        user.cpf.includes(term) ||
                        user.email.toLowerCase().includes(term.toLowerCase())) {
                        users.push(user);
                    }
                });
                return users;
            }), (0, operators_1.catchError)(function (error) {
                _this.logger.error('Erro ao buscar usuários:', error);
                return (0, rxjs_1.throwError)(function () { return new Error('Erro ao buscar usuários: ' + error.message); });
            }));
        };
        /**
         * Obter o usuário atual
         */
        AuthService_1.prototype.getCurrentUser = function () {
            return this.currentUser();
        };
        /**
         * Obter o token de autenticação
         */
        AuthService_1.prototype.getToken = function () {
            return localStorage.getItem('token');
        };
        /**
         * Verificar se o usuário está autenticado
         */
        AuthService_1.prototype.isLoggedIn = function () {
            return this.isAuthenticated();
        };
        /**
         * Realizar logout do usuário
         */
        AuthService_1.prototype.logout = function () {
            var _this = this;
            if (this.auth) {
                (0, auth_1.signOut)(this.auth).catch(function (error) {
                    _this.logger.error('Erro ao fazer logout do Firebase Auth:', error);
                });
            }
            localStorage.removeItem('currentUser');
            this.currentUser.set(null);
            this.router.navigate(['/login']);
        };
        /**
         * Certifica-se de que o usuário atual está autenticado como administrador
         */
        AuthService_1.prototype.ensureAdmin = function () {
            var currentUser = this.currentUser();
            if (currentUser && currentUser.role === 'admin') {
                return (0, rxjs_1.of)(true);
            }
            return (0, rxjs_1.throwError)(function () { return new Error('Usuário não autenticado como administrador'); });
        };
        return AuthService_1;
    }());
    __setFunctionName(_classThis, "AuthService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthService = _classThis;
}();
exports.AuthService = AuthService;
