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
exports.LicensingController = void 0;
const common_1 = require("@nestjs/common");
const licensing_service_1 = require("./licensing.service");
const payment_service_1 = require("./payment.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const license_guard_1 = require("./license.guard");
let LicensingController = class LicensingController {
    constructor(licensingService, paymentService) {
        this.licensingService = licensingService;
        this.paymentService = paymentService;
    }
    checkPlatformAccess(req) {
        const isSuperAdmin = Boolean(req.user?.isSuperAdmin ||
            req.user?.roleId === 'SUPER_ADMIN' ||
            req.user?.platformRole === 'SUPER_ADMIN');
        const isPlatformManager = Boolean(req.user?.roleId === 'PLATFORM_MANAGER' ||
            req.user?.platformRole === 'PLATFORM_MANAGER');
        if (!isSuperAdmin && !isPlatformManager) {
            throw new common_1.ForbiddenException('Platform administrator or manager access required');
        }
        return { isSuperAdmin, isPlatformManager };
    }
    async getStatus(req, queryBizId) {
        const businessId = req.user?.activeBusinessId || queryBizId;
        return this.licensingService.getActiveLicenseStatus(businessId);
    }
    async activateLicense(req, body) {
        if (!body?.licenseKey) {
            throw new common_1.BadRequestException('License key is required');
        }
        const businessId = req.user?.activeBusinessId;
        return this.licensingService.activateLicense(body.licenseKey, businessId);
    }
    async getAdminLicenses(req, businessId) {
        this.checkPlatformAccess(req);
        return this.licensingService.getLicenses({ businessId });
    }
    async generateLicense(req, body) {
        this.checkPlatformAccess(req);
        return this.licensingService.generateLicense(body);
    }
    async renewLicense(req, id, body) {
        this.checkPlatformAccess(req);
        return this.licensingService.renewLicense(id, body);
    }
    async getAdminPayments(req, businessId) {
        this.checkPlatformAccess(req);
        return this.paymentService.getPayments({ businessId });
    }
    async createPayment(req, body) {
        this.checkPlatformAccess(req);
        return this.paymentService.createPayment(body);
    }
    async updatePaymentStatus(req, id, body) {
        this.checkPlatformAccess(req);
        const adminId = req.user?.id || req.user?.userId;
        return this.paymentService.updatePaymentStatus(id, body.status, adminId, body.notes);
    }
};
exports.LicensingController = LicensingController;
__decorate([
    (0, license_guard_1.SkipLicenseCheck)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('licenses/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('businessId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LicensingController.prototype, "getStatus", null);
__decorate([
    (0, license_guard_1.SkipLicenseCheck)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('licenses/activate'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LicensingController.prototype, "activateLicense", null);
__decorate([
    (0, license_guard_1.SkipLicenseCheck)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('admin/licenses'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('businessId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LicensingController.prototype, "getAdminLicenses", null);
__decorate([
    (0, license_guard_1.SkipLicenseCheck)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('admin/licenses/generate'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LicensingController.prototype, "generateLicense", null);
__decorate([
    (0, license_guard_1.SkipLicenseCheck)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('admin/licenses/:id/renew'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], LicensingController.prototype, "renewLicense", null);
__decorate([
    (0, license_guard_1.SkipLicenseCheck)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('admin/payments'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('businessId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LicensingController.prototype, "getAdminPayments", null);
__decorate([
    (0, license_guard_1.SkipLicenseCheck)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('admin/payments'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LicensingController.prototype, "createPayment", null);
__decorate([
    (0, license_guard_1.SkipLicenseCheck)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('admin/payments/:id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], LicensingController.prototype, "updatePaymentStatus", null);
exports.LicensingController = LicensingController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [licensing_service_1.LicensingService,
        payment_service_1.PaymentService])
], LicensingController);
//# sourceMappingURL=licensing.controller.js.map