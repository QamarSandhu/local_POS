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
exports.BusinessesController = void 0;
const common_1 = require("@nestjs/common");
const businesses_service_1 = require("./businesses.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const business_guard_1 = require("../auth/guards/business.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
let BusinessesController = class BusinessesController {
    constructor(businessesService) {
        this.businessesService = businessesService;
    }
    getProfile(req) {
        return this.businessesService.getProfile(req.user.activeBusinessId);
    }
    updateProfile(req, body) {
        return this.businessesService.updateProfile(req.user.activeBusinessId, body);
    }
    getSettings(req) {
        return this.businessesService.getSettings(req.user.activeBusinessId);
    }
    updateSettings(req, body) {
        return this.businessesService.updateSettings(req.user.activeBusinessId, body);
    }
    getPricing(req) {
        return this.businessesService.getPricing(req.user.activeBusinessId);
    }
    updatePricingPlan(req, plan) {
        return this.businessesService.updatePricingPlan(req.user.activeBusinessId, plan);
    }
    recordPosPrint(req) {
        return this.businessesService.incrementPrintCount(req.user.activeBusinessId);
    }
};
exports.BusinessesController = BusinessesController;
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('BUSINESS_VIEW'),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "getProfile", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('BUSINESS_UPDATE'),
    (0, common_1.Put)('profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "updateProfile", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('BUSINESS_VIEW'),
    (0, common_1.Get)('settings'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "getSettings", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('BUSINESS_UPDATE'),
    (0, common_1.Put)('settings'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "updateSettings", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('BUSINESS_VIEW'),
    (0, common_1.Get)('pricing'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "getPricing", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('BUSINESS_UPDATE'),
    (0, common_1.Put)('pricing/plan'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('plan')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "updatePricingPlan", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('POS_ORDER_CREATE', 'POS_CREATE', 'BUSINESS_UPDATE'),
    (0, common_1.Post)('pos/print'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "recordPosPrint", null);
exports.BusinessesController = BusinessesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, business_guard_1.BusinessGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('businesses/active'),
    __metadata("design:paramtypes", [businesses_service_1.BusinessesService])
], BusinessesController);
//# sourceMappingURL=businesses.controller.js.map