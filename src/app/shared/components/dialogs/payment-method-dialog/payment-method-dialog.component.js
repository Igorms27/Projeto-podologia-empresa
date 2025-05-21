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
exports.PaymentMethodDialogComponent = void 0;
var common_1 = require("@angular/common");
var core_1 = require("@angular/core");
var button_1 = require("@angular/material/button");
var dialog_1 = require("@angular/material/dialog");
var icon_1 = require("@angular/material/icon");
var PaymentMethodDialogComponent = function () {
    var _classDecorators = [(0, core_1.Component)({
            selector: 'app-payment-method-dialog',
            standalone: true,
            imports: [common_1.CommonModule, dialog_1.MatDialogModule, button_1.MatButtonModule, icon_1.MatIconModule],
            template: "\n    <h2 mat-dialog-title>M\u00E9todo de Pagamento</h2>\n    <mat-dialog-content>\n      <div class=\"payment-info\">\n        <p class=\"cliente\">Cliente: {{ data.clientName || 'Cliente' }}</p>\n        <p class=\"valor\">Valor: R$ {{ data.valor.toFixed(2) }}</p>\n      </div>\n      <div class=\"payment-methods\">\n        <button\n          mat-raised-button\n          class=\"payment-btn dinheiro-btn\"\n          (click)=\"selectMethod('dinheiro')\"\n        >\n          <mat-icon>money</mat-icon>\n          <span>Dinheiro</span>\n        </button>\n        <button mat-raised-button class=\"payment-btn pix-btn\" (click)=\"selectMethod('pix')\">\n          <mat-icon>phone_iphone</mat-icon>\n          <span>PIX</span>\n        </button>\n        <button mat-raised-button class=\"payment-btn cartao-btn\" (click)=\"selectMethod('cartao')\">\n          <mat-icon>credit_card</mat-icon>\n          <span>Cart\u00E3o</span>\n        </button>\n      </div>\n    </mat-dialog-content>\n    <mat-dialog-actions align=\"end\">\n      <button mat-button mat-dialog-close>Cancelar</button>\n    </mat-dialog-actions>\n  ",
            styles: [
                "\n      .payment-info {\n        margin-bottom: 20px;\n        padding: 15px;\n        background-color: #f5f5f5;\n        border-radius: 4px;\n      }\n\n      .cliente {\n        font-weight: bold;\n        margin-bottom: 5px;\n      }\n\n      .valor {\n        font-size: 18px;\n        color: #1976d2;\n        font-weight: bold;\n      }\n\n      .payment-methods {\n        display: flex;\n        flex-direction: column;\n        gap: 10px;\n      }\n\n      .payment-btn {\n        display: flex;\n        align-items: center;\n        padding: 15px;\n        justify-content: flex-start;\n      }\n\n      .payment-btn mat-icon {\n        margin-right: 10px;\n      }\n\n      .dinheiro-btn {\n        background-color: #4caf50; /* Verde */\n        color: white;\n      }\n\n      .pix-btn {\n        background-color: #1976d2; /* Azul */\n        color: white;\n      }\n\n      .cartao-btn {\n        background-color: #ffc107; /* Amarelo */\n        color: black;\n      }\n    ",
            ],
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var PaymentMethodDialogComponent = _classThis = /** @class */ (function () {
        function PaymentMethodDialogComponent_1(dialogRef, data) {
            this.dialogRef = dialogRef;
            this.data = data;
        }
        PaymentMethodDialogComponent_1.prototype.selectMethod = function (method) {
            this.dialogRef.close(method);
        };
        return PaymentMethodDialogComponent_1;
    }());
    __setFunctionName(_classThis, "PaymentMethodDialogComponent");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PaymentMethodDialogComponent = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PaymentMethodDialogComponent = _classThis;
}();
exports.PaymentMethodDialogComponent = PaymentMethodDialogComponent;
