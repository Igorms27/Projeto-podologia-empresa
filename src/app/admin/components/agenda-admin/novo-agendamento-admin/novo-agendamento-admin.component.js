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
exports.NovoAgendamentoAdminComponent = void 0;
var common_1 = require("@angular/common");
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var autocomplete_1 = require("@angular/material/autocomplete");
var button_1 = require("@angular/material/button");
var dialog_1 = require("@angular/material/dialog");
var form_field_1 = require("@angular/material/form-field");
var icon_1 = require("@angular/material/icon");
var input_1 = require("@angular/material/input");
var select_1 = require("@angular/material/select");
var NovoAgendamentoAdminComponent = function () {
    var _classDecorators = [(0, core_1.Component)({
            selector: 'app-novo-agendamento-admin',
            templateUrl: './novo-agendamento-admin.component.html',
            styleUrls: ['./novo-agendamento-admin.component.scss'],
            standalone: true,
            imports: [
                common_1.CommonModule,
                dialog_1.MatDialogModule,
                button_1.MatButtonModule,
                icon_1.MatIconModule,
                forms_1.FormsModule,
                forms_1.ReactiveFormsModule,
                form_field_1.MatFormFieldModule,
                input_1.MatInputModule,
                select_1.MatSelectModule,
                autocomplete_1.MatAutocompleteModule,
            ],
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var NovoAgendamentoAdminComponent = _classThis = /** @class */ (function () {
        function NovoAgendamentoAdminComponent_1(dialogRef, data, userService, appointmentService) {
            this.dialogRef = dialogRef;
            this.data = data;
            this.userService = userService;
            this.appointmentService = appointmentService;
            this.clientName = '';
            this.selectedProcedure = null;
            this.customPrice = null;
            // Propriedades para lidar com a seleção de clientes
            this.filteredClients = [];
            this.selectedClient = null;
            this.loadingClients = false;
            this.allClients = []; // Armazena todos os clientes
            this.loading = false;
            this.errorMessage = '';
            this.procedures = [
                {
                    id: 'proc1',
                    name: 'Limpeza Simples',
                    description: 'Limpeza básica dos pés',
                    duration: 30,
                    price: 80,
                    category: 'Procedimentos',
                },
                {
                    id: 'proc2',
                    name: 'Limpeza Profunda',
                    description: 'Limpeza completa com esfoliação',
                    duration: 45,
                    price: 100,
                    category: 'Procedimentos',
                },
                {
                    id: 'proc3',
                    name: 'Tratamento de Onicomicose',
                    description: 'Tratamento para micose nas unhas',
                    duration: 30,
                    price: 120,
                    category: 'Tratamentos',
                },
                {
                    id: 'proc4',
                    name: 'Correção com Órtese',
                    description: 'Aplicação de órtese para correção',
                    duration: 60,
                    price: 150,
                    category: 'Correção De Unhas',
                },
                {
                    id: 'proc5',
                    name: 'Remoção de Calosidade',
                    description: 'Remoção de calosidades nos pés',
                    duration: 40,
                    price: 90,
                    category: 'Procedimentos',
                },
                {
                    id: 'proc6',
                    name: 'Unha Encravada',
                    description: 'Tratamento para unha encravada',
                    duration: 45,
                    price: 130,
                    category: 'Tratamentos',
                },
            ];
        }
        NovoAgendamentoAdminComponent_1.prototype.ngOnInit = function () {
            // Carregar lista de clientes
            this.loadClients();
        };
        /**
         * Carrega a lista de clientes do sistema
         */
        NovoAgendamentoAdminComponent_1.prototype.loadClients = function () {
            var _this = this;
            this.loadingClients = true;
            this.userService.getClients().subscribe({
                next: function (clients) {
                    _this.allClients = clients;
                    _this.filteredClients = [];
                    _this.loadingClients = false;
                },
                error: function (error) {
                    console.error('Erro ao carregar clientes:', error);
                    _this.loadingClients = false;
                },
            });
        };
        /**
         * Filtra a lista de clientes com base no texto digitado
         */
        NovoAgendamentoAdminComponent_1.prototype.filterClients = function (event) {
            var filterValue = event.target.value.toLowerCase();
            this.clientName = event.target.value;
            if (this.selectedClient) {
                // Se já tem cliente selecionado e o texto mudou, limpa a seleção
                if (this.selectedClient.name.toLowerCase() !== filterValue) {
                    this.clearClientSelection();
                }
                return;
            }
            if (!filterValue.trim()) {
                this.filteredClients = [];
                return;
            }
            // Filtra até 5 clientes que correspondam ao texto
            this.filteredClients = this.allClients
                .filter(function (client) {
                return client.name.toLowerCase().includes(filterValue) ||
                    (client.cpf && client.cpf.includes(filterValue)) ||
                    (client.phone && client.phone.includes(filterValue));
            })
                .slice(0, 5); // Limita para mostrar apenas 5 resultados
        };
        /**
         * Seleciona um cliente da lista
         */
        NovoAgendamentoAdminComponent_1.prototype.selectClient = function (client) {
            this.selectedClient = client;
            this.clientName = client.name;
            this.filteredClients = [];
        };
        /**
         * Limpa a seleção de cliente
         */
        NovoAgendamentoAdminComponent_1.prototype.clearClientSelection = function () {
            this.selectedClient = null;
        };
        /**
         * Método chamado quando o procedimento é alterado
         * Preenche o valor padrão do procedimento, mas permite alteração
         */
        NovoAgendamentoAdminComponent_1.prototype.onProcedureChange = function () {
            if (this.selectedProcedure) {
                this.customPrice = this.selectedProcedure.price;
            }
            else {
                this.customPrice = null;
            }
        };
        NovoAgendamentoAdminComponent_1.prototype.onCancel = function () {
            this.dialogRef.close(false);
        };
        NovoAgendamentoAdminComponent_1.prototype.onConfirm = function () {
            if (!this.isFormValid()) {
                this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
                return;
            }
            this.loading = true;
            // Criar objeto de agendamento usando diretamente os dados da podóloga do data
            var appointment = {
                userId: this.selectedClient ? this.selectedClient.id : 'guest', // ID do cliente se selecionado, ou 'guest' se não
                procedures: [this.selectedProcedure.id],
                procedureNames: [this.selectedProcedure.name],
                podologaId: this.data.podologaId,
                podologaNome: this.data.podologaNome,
                dateTime: this.data.date.toISOString(),
                status: 'agendado',
                valorTotal: this.customPrice,
                duracaoTotal: this.selectedProcedure.duration,
                clientName: this.clientName,
                createdAt: new Date().toISOString(),
            };
            this.dialogRef.close(appointment);
        };
        NovoAgendamentoAdminComponent_1.prototype.isFormValid = function () {
            // Verificar se é um dia útil
            if (!this.appointmentService.isBusinessDay(new Date(this.data.date))) {
                this.errorMessage =
                    'Não é possível agendar em dias não úteis (finais de semana ou feriados).';
                return false;
            }
            return (!!this.clientName && !!this.selectedProcedure && !!this.customPrice && this.customPrice > 0);
        };
        return NovoAgendamentoAdminComponent_1;
    }());
    __setFunctionName(_classThis, "NovoAgendamentoAdminComponent");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NovoAgendamentoAdminComponent = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NovoAgendamentoAdminComponent = _classThis;
}();
exports.NovoAgendamentoAdminComponent = NovoAgendamentoAdminComponent;
