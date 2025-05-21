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
exports.CashierService = void 0;
var core_1 = require("@angular/core");
var firestore_1 = require("@angular/fire/firestore");
var date_fns_1 = require("date-fns");
var rxjs_1 = require("rxjs");
var CashierService = function () {
    var _classDecorators = [(0, core_1.Injectable)({
            providedIn: 'root',
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var CashierService = _classThis = /** @class */ (function () {
        function CashierService_1(firestore, appointmentService, authService) {
            this.firestore = firestore;
            this.appointmentService = appointmentService;
            this.authService = authService;
        }
        // Adicionar uma nova transação ao caixa
        CashierService_1.prototype.addTransaction = function (transaction) {
            var transactionsRef = (0, firestore_1.collection)(this.firestore, 'cashTransactions');
            return (0, rxjs_1.from)((0, firestore_1.addDoc)(transactionsRef, transaction)).pipe((0, rxjs_1.map)(function (docRef) { return docRef.id; }));
        };
        // Obter transações por data
        CashierService_1.prototype.getTransactionsByDate = function (dateString) {
            console.log("Buscando transa\u00E7\u00F5es para a data: ".concat(dateString));
            // Formatar a data para YYYY-MM-DD para comparação
            var targetDateStr = dateString.substring(0, 10);
            console.log("Data alvo para filtragem: ".concat(targetDateStr));
            // Buscar todas as transações para debug
            return (0, firestore_1.collectionData)((0, firestore_1.collection)(this.firestore, 'cashTransactions')).pipe((0, rxjs_1.map)(function (allTransactions) {
                // Converter para o tipo CashTransaction
                var typedTransactions = allTransactions;
                console.log("Total de transa\u00E7\u00F5es recuperadas: ".concat(typedTransactions.length));
                // Filtrar transações pela data - usando uma abordagem mais robusta
                var transactions = typedTransactions.filter(function (trans) {
                    if (!trans.date)
                        return false;
                    // Extrair apenas a parte YYYY-MM-DD da data da transação
                    var transDateStr = trans.date.substring(0, 10);
                    var match = transDateStr === targetDateStr;
                    if (match) {
                        console.log("Transa\u00E7\u00E3o encontrada para ".concat(dateString, ": ").concat(trans.description, ", valor: ").concat(trans.amount, ", data: ").concat(trans.date));
                    }
                    return match;
                });
                console.log("Transa\u00E7\u00F5es filtradas para ".concat(dateString, ": ").concat(transactions.length));
                // Separar receitas e despesas
                var incomes = transactions.filter(function (t) { return t.type === 'income'; });
                var expenses = transactions.filter(function (t) { return t.type === 'expense'; });
                console.log("Receitas: ".concat(incomes.length, ", Despesas: ").concat(expenses.length));
                // Log detalhado das receitas
                incomes.forEach(function (income) {
                    console.log("Receita: ".concat(income.description, ", Valor: ").concat(income.amount, ", Cliente: ").concat(income.clientName || 'N/A', ", M\u00E9todo: ").concat(income.paymentMethod || 'N/A'));
                });
                // Calcular totais
                var totalIncome = incomes.reduce(function (sum, t) { return sum + Number(t.amount); }, 0);
                var totalExpense = expenses.reduce(function (sum, t) { return sum + Number(t.amount); }, 0);
                // Calcular totais por método de pagamento (apenas para receitas)
                var cashTotal = incomes
                    .filter(function (t) { return t.paymentMethod === 'dinheiro'; })
                    .reduce(function (sum, t) { return sum + Number(t.amount); }, 0);
                var pixTotal = incomes
                    .filter(function (t) { return t.paymentMethod === 'pix'; })
                    .reduce(function (sum, t) { return sum + Number(t.amount); }, 0);
                var cardTotal = incomes
                    .filter(function (t) { return t.paymentMethod === 'cartao'; })
                    .reduce(function (sum, t) { return sum + Number(t.amount); }, 0);
                // Calcular estatísticas por podóloga
                var podologaMap = new Map();
                incomes.forEach(function (income) {
                    if (income.podologaId) {
                        var existingStats = podologaMap.get(income.podologaId);
                        if (existingStats) {
                            // Update existing stats
                            existingStats.total += Number(income.amount);
                            existingStats.count += 1;
                            // Atualizar totais por método de pagamento
                            if (income.paymentMethod === 'dinheiro')
                                existingStats.cashTotal += Number(income.amount);
                            if (income.paymentMethod === 'pix')
                                existingStats.pixTotal += Number(income.amount);
                            if (income.paymentMethod === 'cartao')
                                existingStats.cardTotal += Number(income.amount);
                        }
                        else {
                            // Create new stats entry
                            podologaMap.set(income.podologaId, {
                                id: income.podologaId,
                                nome: income.podologaNome || 'Sem nome',
                                total: Number(income.amount),
                                count: 1,
                                cashTotal: income.paymentMethod === 'dinheiro' ? Number(income.amount) : 0,
                                pixTotal: income.paymentMethod === 'pix' ? Number(income.amount) : 0,
                                cardTotal: income.paymentMethod === 'cartao' ? Number(income.amount) : 0,
                            });
                        }
                    }
                });
                return {
                    date: dateString,
                    incomes: incomes,
                    expenses: expenses,
                    totalIncome: totalIncome,
                    totalExpense: totalExpense,
                    balance: totalIncome - totalExpense,
                    cashTotal: cashTotal,
                    pixTotal: pixTotal,
                    cardTotal: cardTotal,
                    podologistStats: Array.from(podologaMap.values()),
                };
            }), (0, rxjs_1.catchError)(function (error) {
                console.error('Erro ao buscar transações para a data:', error);
                return (0, rxjs_1.of)({
                    date: dateString,
                    incomes: [],
                    expenses: [],
                    totalIncome: 0,
                    totalExpense: 0,
                    balance: 0,
                    cashTotal: 0,
                    pixTotal: 0,
                    cardTotal: 0,
                    podologistStats: [],
                });
            }));
        };
        // Gerar relatório diário baseado em uma data específica
        CashierService_1.prototype.generateDailyReport = function (date) {
            return this.getTransactionsByDate(date).pipe((0, rxjs_1.map)(function (transactions) {
                // Já está no formato correto com as novas propriedades, apenas retornar
                return transactions;
            }));
        };
        // NOVA FUNÇÃO: Obter transações por mês e ano
        CashierService_1.prototype.getTransactionsForMonth = function (year, month) {
            var startDate = (0, date_fns_1.startOfMonth)(new Date(year, month - 1)); // month é 1-based, Date é 0-based
            var endDate = (0, date_fns_1.endOfMonth)(new Date(year, month - 1));
            var startIso = (0, date_fns_1.formatISO)(startDate);
            var endIso = (0, date_fns_1.formatISO)(endDate);
            console.log("Buscando transa\u00E7\u00F5es de ".concat(startIso, " at\u00E9 ").concat(endIso));
            var transactionsRef = (0, firestore_1.collection)(this.firestore, 'cashTransactions');
            // Criar a query para buscar transações dentro do intervalo do mês
            // e ordenar pela data (opcional, mas útil)
            var q = (0, firestore_1.query)(transactionsRef, (0, firestore_1.where)('date', '>=', startIso), (0, firestore_1.where)('date', '<=', endIso), (0, firestore_1.orderBy)('date', 'asc') // Ordenar por data
            );
            return (0, firestore_1.collectionData)(q, { idField: 'id' }).pipe((0, rxjs_1.map)(function (transactions) { return transactions; }), // Cast para o tipo correto
            (0, rxjs_1.catchError)(function (error) {
                console.error("Erro ao buscar transa\u00E7\u00F5es para ".concat(month, "/").concat(year, ":"), error);
                // Retornar um array vazio em caso de erro
                return (0, rxjs_1.of)([]);
            }));
        };
        // Atualizar uma transação existente
        CashierService_1.prototype.updateTransaction = function (id, transaction) {
            var docRef = (0, firestore_1.doc)(this.firestore, 'cashTransactions', id);
            return (0, rxjs_1.from)((0, firestore_1.updateDoc)(docRef, transaction));
        };
        // Excluir uma transação
        CashierService_1.prototype.deleteTransaction = function (id) {
            var docRef = (0, firestore_1.doc)(this.firestore, 'cashTransactions', id);
            return (0, rxjs_1.from)((0, firestore_1.deleteDoc)(docRef));
        };
        // Registrar pagamento para um agendamento
        CashierService_1.prototype.registerAppointmentPayment = function (appointment, paymentMethod, clientName) {
            var transaction = {
                appointmentId: appointment.id,
                date: appointment.dateTime,
                type: 'income',
                description: "Atendimento de ".concat(clientName),
                amount: appointment.valorTotal,
                paymentMethod: paymentMethod,
                podologaId: appointment.podologaId,
                podologaNome: appointment.podologaNome,
                procedureNames: appointment.procedureNames,
                clientName: clientName,
                createdAt: new Date().toISOString(),
                createdBy: '',
            };
            return this.addTransaction(transaction);
        };
        // Registrar uma despesa
        CashierService_1.prototype.registerExpense = function (description, amount, category) {
            var transaction = {
                date: new Date().toISOString(),
                type: 'expense',
                description: description,
                amount: amount,
                expenseCategory: category,
                createdAt: new Date().toISOString(),
                createdBy: '',
            };
            return this.addTransaction(transaction);
        };
        // Obter transações de um intervalo de datas
        CashierService_1.prototype.getTransactionsByDateRange = function (startDateStr, endDateStr) {
            console.log("Buscando transa\u00E7\u00F5es de ".concat(startDateStr, " at\u00E9 ").concat(endDateStr));
            var startDateOnly = startDateStr.substring(0, 10);
            var endDateOnly = endDateStr.substring(0, 10);
            // Update collectionData calls with proper type assertion
            return (0, firestore_1.collectionData)((0, firestore_1.collection)(this.firestore, 'cashTransactions')).pipe((0, rxjs_1.map)(function (allTransactions) {
                // Add type assertion
                var typedTransactions = allTransactions;
                var transactions = typedTransactions.filter(function (trans) {
                    if (!trans.date)
                        return false;
                    var transDateStr = trans.date.substring(0, 10);
                    return transDateStr >= startDateOnly && transDateStr <= endDateOnly;
                });
                // Inicializar relatório
                var report = {
                    date: "".concat(startDateStr, " a ").concat(endDateStr),
                    incomes: [],
                    expenses: [],
                    totalIncome: 0,
                    totalExpense: 0,
                    balance: 0,
                    cashTotal: 0,
                    pixTotal: 0,
                    cardTotal: 0,
                    podologistStats: [],
                };
                // Separar receitas/despesas
                var incomes = transactions.filter(function (t) { return t.type === 'income'; });
                var expenses = transactions.filter(function (t) { return t.type === 'expense'; });
                // Preencher relatório
                report.incomes = incomes;
                report.expenses = expenses;
                report.totalIncome = incomes.reduce(function (sum, t) { return sum + Number(t.amount); }, 0);
                report.totalExpense = expenses.reduce(function (sum, t) { return sum + Number(t.amount); }, 0);
                report.balance = report.totalIncome - report.totalExpense;
                // Calcular métodos de pagamento
                report.cashTotal = incomes
                    .filter(function (t) { return t.paymentMethod === 'dinheiro'; })
                    .reduce(function (sum, t) { return sum + Number(t.amount); }, 0);
                report.pixTotal = incomes
                    .filter(function (t) { return t.paymentMethod === 'pix'; })
                    .reduce(function (sum, t) { return sum + Number(t.amount); }, 0);
                report.cardTotal = incomes
                    .filter(function (t) { return t.paymentMethod === 'cartao'; })
                    .reduce(function (sum, t) { return sum + Number(t.amount); }, 0);
                // Estatísticas de podólogas
                var podologaMap = new Map();
                incomes.forEach(function (income) {
                    if (income.podologaId) {
                        var stats = podologaMap.get(income.podologaId) || {
                            id: income.podologaId,
                            nome: income.podologaNome || 'Sem nome',
                            total: 0,
                            count: 0,
                            cashTotal: 0,
                            pixTotal: 0,
                            cardTotal: 0,
                        };
                        stats.total += Number(income.amount);
                        stats.count += 1;
                        if (income.paymentMethod === 'dinheiro')
                            stats.cashTotal += Number(income.amount);
                        if (income.paymentMethod === 'pix')
                            stats.pixTotal += Number(income.amount);
                        if (income.paymentMethod === 'cartao')
                            stats.cardTotal += Number(income.amount);
                        podologaMap.set(income.podologaId, stats);
                    }
                });
                report.podologistStats = Array.from(podologaMap.values());
                return report;
            }), (0, rxjs_1.catchError)(function (error) {
                console.error('Erro ao buscar transações por período:', error);
                return (0, rxjs_1.of)({
                    date: "".concat(startDateStr, " a ").concat(endDateStr),
                    incomes: [],
                    expenses: [],
                    totalIncome: 0,
                    totalExpense: 0,
                    balance: 0,
                    cashTotal: 0,
                    pixTotal: 0,
                    cardTotal: 0,
                    podologistStats: [],
                });
            }));
        };
        return CashierService_1;
    }());
    __setFunctionName(_classThis, "CashierService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CashierService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CashierService = _classThis;
}();
exports.CashierService = CashierService;
