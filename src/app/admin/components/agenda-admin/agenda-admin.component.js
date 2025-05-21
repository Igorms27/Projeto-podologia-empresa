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
exports.AgendaAdminComponent = void 0;
var common_1 = require("@angular/common");
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var button_1 = require("@angular/material/button");
var card_1 = require("@angular/material/card");
var chips_1 = require("@angular/material/chips");
var core_2 = require("@angular/material/core");
var datepicker_1 = require("@angular/material/datepicker");
var dialog_1 = require("@angular/material/dialog");
var form_field_1 = require("@angular/material/form-field");
var icon_1 = require("@angular/material/icon");
var input_1 = require("@angular/material/input");
var progress_spinner_1 = require("@angular/material/progress-spinner");
var select_1 = require("@angular/material/select");
var snack_bar_1 = require("@angular/material/snack-bar");
var tooltip_1 = require("@angular/material/tooltip");
var rxjs_1 = require("rxjs");
// Componentes de diálogo
var novo_agendamento_admin_component_1 = require("./novo-agendamento-admin/novo-agendamento-admin.component");
var cashier_model_1 = require("../../../models/cashier.model");
var payment_method_dialog_component_1 = require("../../../shared/components/dialogs/payment-method-dialog/payment-method-dialog.component");
var date_utils_1 = require("../../../shared/utils/date-utils");
var AgendaAdminComponent = function () {
    var _classDecorators = [(0, core_1.Component)({
            selector: 'app-agenda-admin',
            templateUrl: './agenda-admin.component.html',
            styleUrls: ['./agenda-admin.component.scss'],
            standalone: true,
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                forms_1.ReactiveFormsModule,
                card_1.MatCardModule,
                button_1.MatButtonModule,
                icon_1.MatIconModule,
                form_field_1.MatFormFieldModule,
                input_1.MatInputModule,
                select_1.MatSelectModule,
                datepicker_1.MatDatepickerModule,
                core_2.MatNativeDateModule,
                dialog_1.MatDialogModule,
                snack_bar_1.MatSnackBarModule,
                progress_spinner_1.MatProgressSpinnerModule,
                chips_1.MatChipsModule,
                tooltip_1.MatTooltipModule,
            ],
            changeDetection: core_1.ChangeDetectionStrategy.Default,
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AgendaAdminComponent = _classThis = /** @class */ (function () {
        function AgendaAdminComponent_1(appointmentService, notificationService, cashierService, dialog, snackBar, cdr, logger, ngZone) {
            var _this = this;
            this.appointmentService = appointmentService;
            this.notificationService = notificationService;
            this.cashierService = cashierService;
            this.dialog = dialog;
            this.snackBar = snackBar;
            this.cdr = cdr;
            this.logger = logger;
            this.ngZone = ngZone;
            this.selectedDate = new Date();
            this.appointments = [];
            this.timeSlots = [
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
            // Mapeamento das Podólogas para colunas na vista
            this.podologasDisplay = [
                { id: '4', nome: 'CLAUDIA', coluna: 0 },
                { id: '1', nome: 'VALDENICE', coluna: 1 },
                { id: '2', nome: 'SONIA', coluna: 2 },
                { id: '3', nome: '', coluna: 3 }, // Coluna vazia ou para outra podóloga
            ];
            this.loading = false;
            this.currentMonth = '';
            this.currentYear = 0;
            this.checkingAvailability = false;
            this.availableTimeSlots = {}; // Mapa de horários disponíveis
            // Filtro para desabilitar finais de semana e feriados
            this.dateFilter = function (date) {
                if (!date)
                    return false;
                // Verificar se é um dia útil (não é fim de semana nem feriado)
                return _this.appointmentService.isBusinessDay(date);
            };
            // Propriedades para registro de despesas
            this.expenseDescription = '';
            this.expenseAmount = null;
            this.expenseCategory = '';
            this.expenseMessage = '';
            // Relatório diário
            this.dailyReport = null;
            // Cache local de agendamentos
            this.appointmentsCache = new Map();
            this._appointmentsByTimeAndPodologa = new Map();
            this.subscriptions = new rxjs_1.Subscription();
            this.pendingLoadTimer = null;
            // Timer para atualização automática
            this.autoRefreshTimer = null;
            this.REFRESH_INTERVAL = 10000; // 10 segundos
            this.forceInitialLoad = true;
        }
        AgendaAdminComponent_1.prototype.ngOnInit = function () {
            // Configurar a data atual
            this.selectedDate = new Date();
            // Remover horas, minutos, segundos e milissegundos para evitar problemas
            this.selectedDate.setHours(0, 0, 0, 0);
            this.logger.debug('Inicializando AgendaAdminComponent');
            this.logger.debug("Data selecionada: ".concat(this.selectedDate.toLocaleDateString()));
            // Atualizar mês e ano primeiro para exibição no cabeçalho
            this.updateMonthYear();
            // Verificar e carregar a partir do cache local primeiro
            this.tryLoadFromLocalStorage();
            // Configurar escuta em tempo real para os agendamentos
            this.setupRealtimeListener();
        };
        AgendaAdminComponent_1.prototype.ngOnDestroy = function () {
            // Cancelar todas as assinaturas
            this.subscriptions.unsubscribe();
            // Limpar timers
            if (this.pendingLoadTimer) {
                clearTimeout(this.pendingLoadTimer);
            }
            if (this.autoRefreshTimer) {
                clearInterval(this.autoRefreshTimer);
            }
        };
        /**
         * Tenta carregar dados do localStorage para mostrar algo rapidamente
         */
        AgendaAdminComponent_1.prototype.tryLoadFromLocalStorage = function () {
            try {
                var today = new Date().toISOString().split('T')[0];
                var cacheKey = "agenda_appointments_".concat(today);
                var cached = localStorage.getItem(cacheKey);
                if (cached) {
                    var data = JSON.parse(cached);
                    if (data && Array.isArray(data.appointments)) {
                        // Mostrar dados do cache enquanto carrega dados frescos
                        this.appointments = data.appointments;
                        this.logger.info('Carregados dados temporários do cache local');
                        this.cdr.detectChanges();
                    }
                }
            }
            catch (error) {
                this.logger.error('Erro ao carregar do cache local:', error);
            }
        };
        /**
         * Salva dados no cache local para carregamento rápido futuro
         */
        AgendaAdminComponent_1.prototype.saveToLocalStorage = function () {
            try {
                var today = this.selectedDate.toISOString().split('T')[0];
                var data = {
                    appointments: this.appointments,
                    timestamp: Date.now(),
                };
                localStorage.setItem("agenda_appointments_".concat(today), JSON.stringify(data));
                this.logger.info('Dados da agenda salvos no cache local');
            }
            catch (error) {
                this.logger.error('Erro ao salvar no cache local:', error);
            }
        };
        AgendaAdminComponent_1.prototype.updateMonthYear = function () {
            var months = [
                'JANEIRO',
                'FEVEREIRO',
                'MARÇO',
                'ABRIL',
                'MAIO',
                'JUNHO',
                'JULHO',
                'AGOSTO',
                'SETEMBRO',
                'OUTUBRO',
                'NOVEMBRO',
                'DEZEMBRO',
            ];
            this.currentMonth = months[this.selectedDate.getMonth()];
            this.currentYear = this.selectedDate.getFullYear();
        };
        /**
         * Configura escuta em tempo real para agendamentos
         */
        AgendaAdminComponent_1.prototype.setupRealtimeListener = function () {
            var _this = this;
            // Formatar a data para o listener em tempo real
            var formattedDate = this.formatDateForQuery(this.selectedDate);
            // Iniciar escuta em tempo real para a data selecionada
            this.appointmentService.reloadAppointmentsRealtime(formattedDate);
            // Inscrever-se no observable de agendamentos
            var subscription = this.appointmentService.appointments$.subscribe(function (appointments) {
                _this.logger.info("Recebidos ".concat(appointments.length, " agendamentos em tempo real"));
                if (appointments.length > 0) {
                    // Filtrar para a data atual (garantia extra)
                    var filteredAppointments = _this.filterAppointmentsForCurrentDate(appointments);
                    if (filteredAppointments.length > 0) {
                        // Comparar com os agendamentos atuais para ver se há novidades
                        var currentIds_1 = new Set(_this.appointments.map(function (a) { return a.id; }));
                        var newAppointments = filteredAppointments.filter(function (a) { return !currentIds_1.has(a.id); });
                        // Se houver novos agendamentos ou a lista atual estiver vazia
                        if (newAppointments.length > 0 || _this.appointments.length === 0) {
                            _this.logger.info("Atualizando agenda com ".concat(filteredAppointments.length, " agendamentos (").concat(newAppointments.length, " novos)"));
                            // Atualizar a lista de agendamentos
                            _this.appointments = filteredAppointments;
                            // Atualizar cache
                            _this.updateLocalCaches(filteredAppointments);
                            // Limpar cache de resultados de getAppointmentsForTimeAndPodologa
                            _this._appointmentsByTimeAndPodologa.clear();
                            // Forçar atualização da UI
                            _this.ngZone.run(function () {
                                _this.cdr.detectChanges();
                            });
                        }
                    }
                }
            });
            this.subscriptions.add(subscription);
        };
        /**
         * Atualiza os caches locais com novos agendamentos
         * Não precisa mais filtrar agendamentos cancelados, já que são excluídos
         */
        AgendaAdminComponent_1.prototype.updateLocalCaches = function (appointments) {
            // Não precisamos mais filtrar por status, já que agendamentos cancelados são excluídos
            console.log("[DEBUG] Atualizando cache: ".concat(appointments.length, " agendamentos"));
            // Cache em memória
            var formattedDate = this.formatDateForQuery(this.selectedDate);
            var cacheKey = "date_".concat(formattedDate);
            this.appointmentsCache.set(cacheKey, __spreadArray([], appointments, true));
            // Cache em localStorage
            try {
                var today = this.selectedDate.toISOString().split('T')[0];
                var cacheKey_1 = "agenda_appointments_".concat(today);
                var data = {
                    appointments: appointments,
                    timestamp: Date.now(),
                };
                localStorage.setItem(cacheKey_1, JSON.stringify(data));
                this.logger.info('[DEBUG] Dados da agenda salvos no cache local');
            }
            catch (error) {
                this.logger.error('[DEBUG] Erro ao salvar no cache local:', error);
            }
        };
        /**
         * Limpa o cache quando a data muda
         */
        AgendaAdminComponent_1.prototype.onDateChange = function () {
            // Limpar cache de resultados
            this._appointmentsByTimeAndPodologa.clear();
            this.updateMonthYear();
            // Configurar listener em tempo real para a nova data
            var formattedDate = this.formatDateForQuery(this.selectedDate);
            this.appointmentService.reloadAppointmentsRealtime(formattedDate);
            this.loadDailyReport();
        };
        AgendaAdminComponent_1.prototype.getAppointmentsForTimeAndPodologa = function (time, podologaId) {
            var _this = this;
            if (!time || !podologaId || !this.appointments) {
                return [];
            }
            // Usar uma abordagem mais eficiente de filtragem
            var cacheKey = "".concat(time, "_").concat(podologaId);
            var cachedResult = this._appointmentsByTimeAndPodologa.get(cacheKey);
            if (cachedResult) {
                return cachedResult;
            }
            // Evitar recálculos desnecessários
            var filteredAppointments = this.appointments.filter(function (appointment) {
                // Verificar se o agendamento corresponde a este horário e podóloga
                if (appointment.podologaId !== podologaId) {
                    return false;
                }
                // Verificar o horário
                var appointmentTime = appointment.timeSlot || _this.getAppointmentTimeFromDateTime(appointment);
                return appointmentTime === time;
            });
            // Armazenar o resultado no cache
            this._appointmentsByTimeAndPodologa.set(cacheKey, filteredAppointments);
            return filteredAppointments;
        };
        AgendaAdminComponent_1.prototype.getAppointmentDisplayText = function (appointment) {
            // Retorna o nome do cliente e o procedimento
            if (!appointment)
                return '';
            var clientName = appointment.clientName || 'Cliente';
            var procedure = appointment.procedureNames[0] || 'Procedimento';
            return "".concat(clientName, " - ").concat(procedure);
        };
        AgendaAdminComponent_1.prototype.openNovoAgendamento = function (time, podologaId) {
            var _this = this;
            var _a, _b;
            // Verificar se é dia útil
            if (!this.appointmentService.isBusinessDay(this.selectedDate)) {
                this.notificationService.error('Não é possível agendar em dias não úteis (finais de semana ou feriados).');
                return;
            }
            // Criar a data completa (data + hora)
            var _c = time.split(':').map(Number), hours = _c[0], minutes = _c[1];
            var appointmentDate = new Date(this.selectedDate);
            appointmentDate.setHours(hours, minutes, 0, 0);
            console.log("DEBUG - Iniciando abertura de novo agendamento \u00E0s ".concat(time, " com pod\u00F3loga ID ").concat(podologaId));
            console.log("DEBUG - Usu\u00E1rio atual: ".concat((_a = this.appointmentService['authService'].getCurrentUser()) === null || _a === void 0 ? void 0 : _a.name, " (").concat((_b = this.appointmentService['authService'].getCurrentUser()) === null || _b === void 0 ? void 0 : _b.role, ")"));
            // Verificação visual/interface já passou, agora vamos fazer uma verificação no servidor
            // Mostrar indicador de carregamento
            this.checkingAvailability = true;
            // Verificar disponibilidade apenas para esta podóloga
            this.appointmentService.isTimeSlotAvailable(appointmentDate, podologaId).subscribe({
                next: function (isAvailable) {
                    _this.checkingAvailability = false;
                    console.log("DEBUG - Hor\u00E1rio dispon\u00EDvel? ".concat(isAvailable));
                    if (!isAvailable) {
                        _this.showOccupiedMessage(time);
                        // Recarregar a agenda para garantir que a UI está atualizada
                        _this.loadAppointments();
                        return;
                    }
                    // Se disponível, abre o diálogo
                    _this.openAgendamentoDialog(appointmentDate, podologaId);
                },
                error: function (error) {
                    _this.checkingAvailability = false;
                    console.error('Erro ao verificar disponibilidade:', error);
                    _this.notificationService.error('Erro ao verificar disponibilidade do horário.');
                },
            });
        };
        // Método separado para abrir o diálogo de agendamento
        AgendaAdminComponent_1.prototype.openAgendamentoDialog = function (appointmentDate, podologaId) {
            var _this = this;
            var _a;
            console.log("DEBUG - Abrindo di\u00E1logo de agendamento para ".concat(appointmentDate.toISOString(), " com pod\u00F3loga ").concat(podologaId));
            var dialogRef = this.dialog.open(novo_agendamento_admin_component_1.NovoAgendamentoAdminComponent, {
                width: '600px',
                data: {
                    date: appointmentDate,
                    podologaId: podologaId,
                    podologaNome: ((_a = this.podologasDisplay.find(function (p) { return p.id === podologaId; })) === null || _a === void 0 ? void 0 : _a.nome) || '',
                },
            });
            dialogRef.afterClosed().subscribe(function (result) {
                console.log("DEBUG - Di\u00E1logo fechado com resultado:", result);
                if (result) {
                    // Se o resultado for um objeto Appointment, salvar no serviço
                    if (typeof result === 'object' && result.dateTime) {
                        console.log('Criando novo agendamento com os dados:', result);
                        _this.appointmentService.createAppointment(result).subscribe({
                            next: function (newAppointment) {
                                console.log('DEBUG - Agendamento criado com sucesso:', newAppointment);
                                _this.notificationService.success('Agendamento criado com sucesso!');
                                // Verificar se o agendamento já está na lista, se não adicionar manualmente
                                var appointmentExists = _this.appointments.some(function (apt) { return apt.id === newAppointment.id; });
                                if (!appointmentExists) {
                                    console.log('Adicionando novo agendamento à lista local');
                                    _this.appointments = __spreadArray(__spreadArray([], _this.appointments, true), [newAppointment], false);
                                }
                                // Recarregar todos os agendamentos do servidor para garantir
                                _this.loadAppointments();
                            },
                            error: function (error) {
                                console.error('DEBUG - Erro ao criar agendamento:', error);
                                _this.notificationService.error('Erro ao criar agendamento: ' + (error.message || 'Tente novamente.'));
                                _this.loadAppointments(); // Recarregar para exibir o estado atual
                            },
                        });
                    }
                    else {
                        _this.loadAppointments();
                    }
                }
            });
        };
        // Método para registrar despesa
        AgendaAdminComponent_1.prototype.registerExpense = function () {
            var _this = this;
            if (!this.expenseDescription || !this.expenseAmount || !this.expenseCategory) {
                this.expenseMessage = 'Preencha todos os campos da despesa.';
                return;
            }
            var description = "".concat(this.expenseDescription);
            var category = this.expenseCategory;
            this.cashierService.registerExpense(description, this.expenseAmount, category).subscribe({
                next: function () {
                    _this.notificationService.success('Despesa registrada com sucesso!');
                    _this.expenseMessage = "Despesa \"".concat(_this.expenseDescription, "\" (").concat(_this.expenseCategory, ") no valor de R$ ").concat(_this.expenseAmount.toFixed(2), " registrada.");
                    // Recarregar relatório diário
                    _this.loadDailyReport();
                    // Limpar campos
                    _this.expenseDescription = '';
                    _this.expenseAmount = null;
                    _this.expenseCategory = '';
                },
                error: function (error) {
                    console.error('Erro ao registrar despesa:', error);
                    _this.notificationService.error('Erro ao registrar despesa. Tente novamente.');
                    _this.expenseMessage = '';
                },
            });
        };
        /**
         * Método de depuração para fazer diagnóstico profundo de um agendamento específico
         */
        AgendaAdminComponent_1.prototype.debugAppointment = function (appointment) {
            console.log('[DEBUG-CRITICAL] ======= DIAGNÓSTICO DE AGENDAMENTO =======');
            console.log('[DEBUG-CRITICAL] ID:', appointment.id);
            console.log('[DEBUG-CRITICAL] Cliente:', appointment.clientName);
            console.log('[DEBUG-CRITICAL] Status atual:', appointment.status);
            console.log('[DEBUG-CRITICAL] Data/Hora:', appointment.dateTime);
            console.log('[DEBUG-CRITICAL] Detalhes completos:', appointment);
            // Verificar se o agendamento está na lista atual
            var inCurrentList = this.appointments.some(function (a) { return a.id === appointment.id; });
            console.log('[DEBUG-CRITICAL] Presente na lista atual:', inCurrentList);
            // Tentar cancelar diretamente pelo serviço para diagnóstico
            this.forceCancelAppointment(appointment);
        };
        /**
         * Tenta forçar o cancelamento usando abordagem alternativa direta
         * Agora excluindo o documento completamente
         */
        AgendaAdminComponent_1.prototype.forceCancelAppointment = function (appointment) {
            var _this = this;
            console.log('[DEBUG-CRITICAL] Tentando EXCLUIR agendamento usando método alternativo...');
            // Forçar carregamento total antes
            this.loading = true;
            this.cdr.detectChanges();
            // Remover localmente (independente do sucesso do Firebase)
            this.appointments = this.appointments.filter(function (a) { return a.id !== appointment.id; });
            this._appointmentsByTimeAndPodologa.clear();
            this.cdr.detectChanges();
            // Usar o serviço para excluir
            this.appointmentService.cancelAppointment(appointment).subscribe({
                next: function (result) {
                    console.log('[DEBUG-CRITICAL] Exclusão alternativa - Resultado:', result);
                    _this.snackBar.open('Agendamento excluído com sucesso (método alternativo)', 'Fechar', {
                        duration: 3000,
                        panelClass: ['info-snackbar'],
                    });
                    // Forçar recarga total
                    _this.forceReloadAgendamentos();
                },
                error: function (err) {
                    console.error('[DEBUG-CRITICAL] Falha na exclusão alternativa:', err);
                    // Tentar uma última abordagem manual usando Firebase diretamente
                    console.log('[DEBUG-CRITICAL] Tentando apagar documento manualmente...');
                    try {
                        // Este código seria adicionado aqui, mas como não temos acesso ao Firestore diretamente neste componente,
                        // dependeremos do serviço
                        _this.snackBar.open('Falha na exclusão. Atualizando a visualização.', 'Fechar', {
                            duration: 3000,
                            panelClass: ['error-snackbar'],
                        });
                    }
                    catch (error) {
                        console.error('[DEBUG-CRITICAL] Falha em todas as abordagens:', error);
                    }
                    // Forçar recarga total de qualquer forma
                    _this.forceReloadAgendamentos();
                },
            });
        };
        /**
         * Cancela um agendamento após confirmação do usuário
         * Agora com exclusão completa do documento no Firebase
         */
        AgendaAdminComponent_1.prototype.cancelAppointment = function (appointment, event) {
            var _this = this;
            // Impedir que o clique propague para o elemento pai
            event.stopPropagation();
            console.log('[DEBUG-CRITICAL] ======= INÍCIO DO PROCESSO DE CANCELAMENTO/EXCLUSÃO =======');
            console.log('[DEBUG-CRITICAL] Iniciando processo para excluir agendamento, ID:', appointment.id);
            // Exibir mensagem de confirmação usando o snackbar
            var snackBarRef = this.snackBar.open("Deseja cancelar o agendamento de ".concat(appointment.clientName || 'Cliente', "? O registro ser\u00E1 completamente removido."), 'Confirmar', {
                duration: 5000,
                panelClass: ['warning-snackbar'],
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
            });
            snackBarRef.onAction().subscribe(function () {
                // Mostrar indicador de carregamento
                _this.loading = true;
                console.log('[DEBUG-CRITICAL] Confirmação de exclusão aceita pelo usuário');
                // Atualizar o status localmente imediatamente por feedback visual
                var index = _this.appointments.findIndex(function (a) { return a.id === appointment.id; });
                if (index !== -1) {
                    // Remover o agendamento completamente da UI imediatamente
                    _this.appointments = _this.appointments.filter(function (a) { return a.id !== appointment.id; });
                    // Limpar o cache para forçar recálculo na UI
                    _this._appointmentsByTimeAndPodologa.clear();
                    _this.cdr.detectChanges();
                    console.log('[DEBUG-CRITICAL] Agendamento removido da UI local');
                }
                // Excluir o agendamento no Firebase
                console.log('[DEBUG-CRITICAL] Chamando AppointmentService.cancelAppointment (que agora exclui)...');
                _this.appointmentService.cancelAppointment(appointment).subscribe({
                    next: function (result) {
                        console.log('[DEBUG-CRITICAL] Exclusão bem-sucedida!', result);
                        _this.snackBar.open('Agendamento cancelado e removido com sucesso', 'Fechar', {
                            duration: 3000,
                            panelClass: ['success-snackbar'],
                        });
                        // Forçar limpeza completa do cache
                        _this.appointmentsCache.clear();
                        _this._appointmentsByTimeAndPodologa.clear();
                        // Recarregar os agendamentos para garantir sincronização com o servidor
                        console.log('[DEBUG-CRITICAL] Forçando recarga completa dos agendamentos...');
                        _this.forceReloadAgendamentos();
                        // Desativar indicador de carregamento
                        _this.loading = false;
                    },
                    error: function (error) {
                        console.error('[DEBUG-CRITICAL] Erro ao excluir agendamento:', error);
                        _this.snackBar.open('Erro ao cancelar agendamento. Tentando método alternativo...', 'Fechar', {
                            duration: 5000,
                            panelClass: ['error-snackbar'],
                        });
                        // Tentar restaurar o agendamento na UI se a exclusão falhar
                        if (index !== -1 && _this.appointments.findIndex(function (a) { return a.id === appointment.id; }) === -1) {
                            _this.appointments = __spreadArray(__spreadArray([], _this.appointments, true), [appointment], false);
                            _this._appointmentsByTimeAndPodologa.clear();
                            _this.cdr.detectChanges();
                        }
                        // Se o método normal falhar, tente o método alternativo
                        _this.forceCancelAppointment(appointment);
                    },
                });
            });
        };
        /**
         * Marca um agendamento como pago e registra no caixa
         */
        AgendaAdminComponent_1.prototype.markAsPaid = function (appointment, event) {
            var _this = this;
            var _a;
            // Impedir que o clique propague para o elemento pai
            event.stopPropagation();
            // Obter valor sugerido do procedimento
            var valorProcedimento = appointment.valorTotal || this.getValorProcedimento((_a = appointment.procedureNames) === null || _a === void 0 ? void 0 : _a[0]);
            // Criar um diálogo personalizado para seleção do método de pagamento
            var dialogRef = this.dialog.open(payment_method_dialog_component_1.PaymentMethodDialogComponent, {
                width: '350px',
                data: {
                    valor: valorProcedimento,
                    clientName: appointment.clientName || 'Cliente',
                },
                panelClass: 'payment-dialog',
            });
            dialogRef.afterClosed().subscribe(function (result) {
                if (result) {
                    // Processar o pagamento com o método selecionado
                    _this.processPayment(appointment, result);
                }
            });
        };
        /**
         * Processa o pagamento com o método selecionado
         */
        AgendaAdminComponent_1.prototype.processPayment = function (appointment, paymentMethod) {
            var _this = this;
            // Fechar qualquer snackbar aberto
            this.snackBar.dismiss();
            // Mostrar indicador de carregamento
            this.loading = true;
            // Atualizar o status localmente primeiro, para impedir cliques múltiplos
            var index = this.appointments.findIndex(function (a) { return a.id === appointment.id; });
            if (index !== -1) {
                var updatedAppointment = __assign(__assign({}, this.appointments[index]), { status: 'finalizado', paymentMethod: paymentMethod });
                this.appointments[index] = updatedAppointment;
                // Limpar o cache para forçar recálculo na UI
                this._appointmentsByTimeAndPodologa.clear();
                this.cdr.detectChanges();
            }
            // Finalizar o agendamento, passando o método de pagamento
            this.appointmentService.completeAppointment(appointment, paymentMethod).subscribe({
                next: function (updatedAppointment) {
                    // Registrar pagamento no caixa
                    _this.cashierService
                        .registerAppointmentPayment(updatedAppointment, paymentMethod, appointment.clientName || 'Cliente sem nome')
                        .subscribe({
                        next: function () {
                            var methodLabel = paymentMethod === 'dinheiro'
                                ? 'Dinheiro'
                                : paymentMethod === 'pix'
                                    ? 'PIX'
                                    : 'Cartão';
                            _this.snackBar.open("Pagamento com ".concat(methodLabel, " registrado com sucesso"), 'Fechar', {
                                duration: 3000,
                                panelClass: ['success-snackbar'],
                            });
                            // Recarregar os agendamentos e o relatório diário
                            _this.loadAppointments();
                            _this.loadDailyReport();
                            _this.loading = false;
                        },
                        error: function (error) {
                            console.error('Erro ao registrar pagamento no caixa:', error);
                            _this.snackBar.open('Erro ao registrar pagamento no caixa. Tente novamente.', 'Fechar', {
                                duration: 5000,
                                panelClass: ['error-snackbar'],
                            });
                            _this.loading = false;
                            // Em caso de erro, reverter o status local
                            if (index !== -1) {
                                _this.appointments[index] = appointment;
                                _this._appointmentsByTimeAndPodologa.clear();
                                _this.cdr.detectChanges();
                            }
                        },
                    });
                },
                error: function (error) {
                    console.error('Erro ao finalizar agendamento:', error);
                    _this.snackBar.open('Erro ao finalizar agendamento. Tente novamente.', 'Fechar', {
                        duration: 5000,
                        panelClass: ['error-snackbar'],
                    });
                    _this.loading = false;
                    // Em caso de erro, reverter o status local
                    if (index !== -1) {
                        _this.appointments[index] = appointment;
                        _this._appointmentsByTimeAndPodologa.clear();
                        _this.cdr.detectChanges();
                    }
                },
            });
        };
        /**
         * Retorna um valor sugerido para um procedimento
         */
        AgendaAdminComponent_1.prototype.getValorProcedimento = function (procedureName) {
            if (!procedureName)
                return 80; // Valor padrão
            // Mapeamento de valores comuns
            var valoresProcedimentos = {
                'Podologia Básica': 80,
                'Podologia Geral': 100,
                'Podologia Clínica': 120,
                Onicocriptose: 100,
                Retorno: 50,
                Consulta: 80,
            };
            return valoresProcedimentos[procedureName] || 80;
        };
        AgendaAdminComponent_1.prototype.previousDay = function () {
            var newDate = new Date(this.selectedDate);
            newDate.setDate(newDate.getDate() - 1);
            this.selectedDate = newDate;
            this.onDateChange();
        };
        AgendaAdminComponent_1.prototype.nextDay = function () {
            var newDate = new Date(this.selectedDate);
            newDate.setDate(newDate.getDate() + 1);
            this.selectedDate = newDate;
            this.onDateChange();
        };
        AgendaAdminComponent_1.prototype.isWeekend = function (date) {
            var day = date.getDay();
            return day === 0 || day === 6; // 0 = domingo, 6 = sábado
        };
        AgendaAdminComponent_1.prototype.isHoliday = function (date) {
            return this.appointmentService.isHoliday(date);
        };
        // Mostrar mensagem quando tentar agendar em horário ocupado
        AgendaAdminComponent_1.prototype.showOccupiedMessage = function (time) {
            this.snackBar.open("Hor\u00E1rio ".concat(time, " j\u00E1 est\u00E1 ocupado. Por favor, escolha outro hor\u00E1rio."), 'Fechar', {
                duration: 5000,
                panelClass: ['error-snackbar'],
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
            });
        };
        // Carregar relatório diário
        AgendaAdminComponent_1.prototype.loadDailyReport = function () {
            var _this = this;
            var formattedDate = date_utils_1.DateUtils.formatDateToYYYYMMDD(this.selectedDate);
            this.cashierService.getTransactionsByDate(formattedDate).subscribe({
                next: function (report) {
                    _this.dailyReport = report;
                },
                error: function (error) {
                    console.error('Erro ao carregar relatório diário:', error);
                    _this.notificationService.error('Erro ao carregar despesas do dia.');
                },
            });
        };
        // Obter label de categoria
        AgendaAdminComponent_1.prototype.getCategoryLabel = function (category) {
            if (!category)
                return 'Outros';
            switch (category) {
                case cashier_model_1.ExpenseCategory.MATERIAL_CONSUMO:
                    return 'Material de Consumo';
                case cashier_model_1.ExpenseCategory.MATERIAL_ESCRITORIO:
                    return 'Material de Escritório';
                case cashier_model_1.ExpenseCategory.EQUIPAMENTOS:
                    return 'Equipamentos';
                case cashier_model_1.ExpenseCategory.MANUTENCAO:
                    return 'Manutenção';
                case cashier_model_1.ExpenseCategory.SERVICOS:
                    return 'Serviços';
                default:
                    return 'Outros';
            }
        };
        /**
         * Carrega agendamentos usando o novo sistema em tempo real
         */
        AgendaAdminComponent_1.prototype.loadAppointments = function () {
            var _this = this;
            this.logger.info('Usando sistema de tempo real para carregar agendamentos');
            // Mostrar indicador de carregamento
            this.loading = true;
            this.cdr.detectChanges();
            // Formatar a data para a consulta
            var formattedDate = this.formatDateForQuery(this.selectedDate);
            // Configurar listener em tempo real
            this.appointmentService.reloadAppointmentsRealtime(formattedDate);
            // Após um pequeno atraso, remover o indicador de carregamento
            setTimeout(function () {
                _this.loading = false;
                _this.cdr.detectChanges();
            }, 500);
        };
        /**
         * Força o recarregamento dos agendamentos limpo o cache
         */
        AgendaAdminComponent_1.prototype.forceReloadAgendamentos = function () {
            var _this = this;
            // Limpar o cache
            var formattedDate = this.formatDateForQuery(this.selectedDate);
            this.appointmentsCache.clear(); // Limpar todo o cache em vez de apenas uma entrada
            this._appointmentsByTimeAndPodologa.clear();
            // Limpar cache localStorage
            try {
                localStorage.removeItem("agenda_appointments_".concat(formattedDate));
            }
            catch (error) {
                this.logger.error('Erro ao limpar cache local:', error);
            }
            // Limpar o cache no serviço de consultas
            this.appointmentService.invalidateCache(this.selectedDate);
            this.logger.info('Cache limpo, configurando listener em tempo real');
            // Mostrar indicador de carregamento
            this.loading = true;
            this.cdr.detectChanges();
            // Configurar listener em tempo real (que já usa o método mais eficiente)
            this.appointmentService.reloadAppointmentsRealtime(formattedDate);
            // Limpar indicador de carregamento após um tempo
            setTimeout(function () {
                _this.loading = false;
                _this.cdr.detectChanges();
            }, 1000);
        };
        /**
         * Formata a data para a query
         */
        AgendaAdminComponent_1.prototype.formatDateForQuery = function (date) {
            var year = date.getFullYear();
            var month = String(date.getMonth() + 1).padStart(2, '0');
            var day = String(date.getDate()).padStart(2, '0');
            return "".concat(year, "-").concat(month, "-").concat(day);
        };
        /**
         * Extrai o horário formatado da propriedade dateTime do agendamento
         */
        AgendaAdminComponent_1.prototype.getAppointmentTimeFromDateTime = function (appointment) {
            if (!appointment.dateTime)
                return '';
            try {
                var date = new Date(appointment.dateTime);
                var hours = date.getHours().toString().padStart(2, '0');
                var minutes = date.getMinutes().toString().padStart(2, '0');
                return "".concat(hours, ":").concat(minutes);
            }
            catch (error) {
                this.logger.error('Erro ao extrair horário do agendamento', error);
                return '';
            }
        };
        /**
         * Filtra agendamentos para a data atualmente selecionada
         * Como agendamentos cancelados agora são excluídos, não precisamos filtrá-los
         */
        AgendaAdminComponent_1.prototype.filterAppointmentsForCurrentDate = function (appointments) {
            var _this = this;
            console.log('[DEBUG] Filtrando agendamentos para a data atual:', this.selectedDate);
            var result = appointments.filter(function (apt) {
                if (!apt.dateTime) {
                    console.log('[DEBUG] Agendamento sem dateTime:', apt.id);
                    return false;
                }
                try {
                    var aptDate = new Date(apt.dateTime);
                    // Verificar se é do mesmo dia
                    var sameDay = aptDate.getFullYear() === _this.selectedDate.getFullYear() &&
                        aptDate.getMonth() === _this.selectedDate.getMonth() &&
                        aptDate.getDate() === _this.selectedDate.getDate();
                    // Não precisamos verificar o status, já que agendamentos cancelados
                    // são completamente excluídos do banco de dados
                    return sameDay;
                }
                catch (error) {
                    _this.logger.error('Erro ao processar data do agendamento:', error);
                    return false;
                }
            });
            console.log("[DEBUG] Total de agendamentos filtrados: ".concat(result.length, " de ").concat(appointments.length));
            return result;
        };
        return AgendaAdminComponent_1;
    }());
    __setFunctionName(_classThis, "AgendaAdminComponent");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AgendaAdminComponent = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AgendaAdminComponent = _classThis;
}();
exports.AgendaAdminComponent = AgendaAdminComponent;
