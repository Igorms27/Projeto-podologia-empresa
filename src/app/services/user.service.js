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
exports.UserService = void 0;
var core_1 = require("@angular/core");
var firestore_1 = require("@angular/fire/firestore");
var rxjs_1 = require("rxjs");
var UserService = function () {
    var _classDecorators = [(0, core_1.Injectable)({
            providedIn: 'root',
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var UserService = _classThis = /** @class */ (function () {
        function UserService_1(firestore, errorHandler) {
            this.firestore = firestore;
            this.errorHandler = errorHandler;
            this.COLLECTION = 'users';
        }
        UserService_1.prototype.getClients = function () {
            var _this = this;
            var usersCollection = (0, firestore_1.collection)(this.firestore, this.COLLECTION);
            var q = (0, firestore_1.query)(usersCollection, (0, firestore_1.where)('role', '==', 'client'));
            return (0, rxjs_1.from)((0, firestore_1.getDocs)(q)).pipe((0, rxjs_1.map)(function (querySnapshot) {
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
                        zipCode: userData['zipCode'],
                    });
                });
                return users;
            }), (0, rxjs_1.catchError)(function (error) {
                _this.errorHandler.handleError(error, 'UserService.getClients');
                return (0, rxjs_1.throwError)(function () { return new Error('Erro ao buscar clientes'); });
            }));
        };
        UserService_1.prototype.getUserById = function (id) {
            var _this = this;
            var userDoc = (0, firestore_1.doc)(this.firestore, this.COLLECTION, id);
            return (0, rxjs_1.from)((0, firestore_1.getDoc)(userDoc)).pipe((0, rxjs_1.map)(function (docSnapshot) {
                if (!docSnapshot.exists()) {
                    throw new Error('Usuário não encontrado');
                }
                var userData = docSnapshot.data();
                return {
                    id: docSnapshot.id,
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
                    zipCode: userData['zipCode'],
                };
            }), (0, rxjs_1.catchError)(function (error) {
                _this.errorHandler.handleError(error, 'UserService.getUserById');
                return (0, rxjs_1.throwError)(function () { return new Error('Erro ao buscar usuário'); });
            }));
        };
        UserService_1.prototype.updateUser = function (userId, userData) {
            var _this = this;
            var userDoc = (0, firestore_1.doc)(this.firestore, this.COLLECTION, userId);
            return (0, rxjs_1.from)((0, firestore_1.updateDoc)(userDoc, userData)).pipe((0, rxjs_1.map)(function () { return true; }), (0, rxjs_1.catchError)(function (error) {
                _this.errorHandler.handleError(error, 'UserService.updateUser');
                return (0, rxjs_1.throwError)(function () { return new Error('Erro ao atualizar usuário'); });
            }));
        };
        UserService_1.prototype.deleteUser = function (userId) {
            var _this = this;
            var userDoc = (0, firestore_1.doc)(this.firestore, this.COLLECTION, userId);
            return (0, rxjs_1.from)((0, firestore_1.deleteDoc)(userDoc)).pipe((0, rxjs_1.map)(function () { return true; }), (0, rxjs_1.catchError)(function (error) {
                _this.errorHandler.handleError(error, 'UserService.deleteUser');
                return (0, rxjs_1.throwError)(function () { return new Error('Erro ao excluir usuário'); });
            }));
        };
        UserService_1.prototype.createUser = function (user) {
            var _this = this;
            var usersCollection = (0, firestore_1.collection)(this.firestore, this.COLLECTION);
            var newUserDoc = (0, firestore_1.doc)(usersCollection);
            return (0, rxjs_1.from)((0, firestore_1.setDoc)(newUserDoc, user)).pipe((0, rxjs_1.map)(function () { return newUserDoc.id; }), (0, rxjs_1.catchError)(function (error) {
                _this.errorHandler.handleError(error, 'UserService.createUser');
                return (0, rxjs_1.throwError)(function () { return new Error('Erro ao criar usuário'); });
            }));
        };
        return UserService_1;
    }());
    __setFunctionName(_classThis, "UserService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UserService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UserService = _classThis;
}();
exports.UserService = UserService;
