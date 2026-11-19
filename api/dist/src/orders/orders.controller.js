"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const business_guard_1 = require("../auth/guards/business.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
let OrdersController = class OrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    findAll(req, fromDate, toDate, startDate, endDate) {
        return this.ordersService.findAll(req.user.activeBusinessId, fromDate || startDate, toDate || endDate);
    }
    getLiveOrders(req, fromDate, toDate, startDate, endDate) {
        return this.ordersService.getLiveOrders(req.user.activeBusinessId, fromDate || startDate, toDate || endDate);
    }
    findOne(req, id) {
        return this.ordersService.findOne(req.user.activeBusinessId, id);
    }
    create(req, body) {
        return this.ordersService.create(req.user.activeBusinessId, req.user.userId, body);
    }
    syncOfflineOrders(req, body) {
        return this.ordersService.syncOfflineOrders(req.user.activeBusinessId, req.user.userId, body.orders);
    }
    updateStatus(req, id, body) {
        return this.ordersService.updateStatus(req.user.activeBusinessId, id, body.status, body.paymentStatus, body.cancelReason, body.paymentMethod);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('POS_VIEW'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('fromDate')),
    __param(2, (0, common_1.Query)('toDate')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findAll", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('POS_VIEW'),
    (0, common_1.Get)('live'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('fromDate')),
    __param(2, (0, common_1.Query)('toDate')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getLiveOrders", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('POS_VIEW'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findOne", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('POS_CREATE'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "create", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('POS_CREATE'),
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "syncOfflineOrders", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('POS_CREATE'),
    (0, common_1.Put)(':id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "updateStatus", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, business_guard_1.BusinessGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('businesses/active/orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map