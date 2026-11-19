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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    checkPlatformAccess(req) {
        const isSuperAdmin = Boolean(req.user?.isSuperAdmin || req.user?.roleId === 'SUPER_ADMIN' || req.user?.platformRole === 'SUPER_ADMIN');
        const isPlatformManager = Boolean(req.user?.roleId === 'PLATFORM_MANAGER' || req.user?.platformRole === 'PLATFORM_MANAGER');
        if (!isSuperAdmin && !isPlatformManager) {
            throw new common_1.ForbiddenException('Platform administrator or manager access required');
        }
        return { isSuperAdmin, isPlatformManager };
    }
    checkSuperAdmin(req) {
        const isSuperAdmin = Boolean(req.user?.isSuperAdmin || req.user?.roleId === 'SUPER_ADMIN' || req.user?.platformRole === 'SUPER_ADMIN');
        if (!isSuperAdmin) {
            throw new common_1.ForbiddenException('Super Admin privileges required to perform this action');
        }
    }
    getStats(req) {
        this.checkPlatformAccess(req);
        return this.adminService.getStats();
    }
    getBusinesses(req) {
        this.checkPlatformAccess(req);
        return this.adminService.getBusinesses();
    }
    toggleStatus(req, id, body) {
        this.checkPlatformAccess(req);
        return this.adminService.toggleBusinessStatus(id, body.isActive, body.suspendReason);
    }
    toggleFeatured(req, id, body) {
        this.checkSuperAdmin(req);
        return this.adminService.toggleBusinessFeatured(id, body.isFeatured);
    }
    updateBusiness(req, id, body) {
        this.checkPlatformAccess(req);
        return this.adminService.updateBusiness(id, body);
    }
    resetBusinessPassword(req, id, body) {
        this.checkSuperAdmin(req);
        return this.adminService.resetBusinessPassword(id, body?.password);
    }
    getUsers(req) {
        this.checkPlatformAccess(req);
        return this.adminService.getUsers();
    }
    createPlatformUser(req, body) {
        this.checkSuperAdmin(req);
        return this.adminService.createPlatformUser(body);
    }
    toggleUserStatus(req, id, body) {
        this.checkSuperAdmin(req);
        const adminId = req.user.userId || req.user.id || req.user.sub;
        return this.adminService.toggleUserStatus(id, body.isActive, adminId);
    }
    resetUserPassword(req, id, body) {
        this.checkSuperAdmin(req);
        return this.adminService.resetUserPassword(id, body?.password);
    }
    getOrders(req, limit) {
        this.checkPlatformAccess(req);
        const limitNum = limit ? parseInt(limit, 10) : 50;
        return this.adminService.getOrders(limitNum);
    }
    getBillingOverview(req, cycle) {
        this.checkPlatformAccess(req);
        return this.adminService.getBillingOverview(cycle);
    }
    updateBillingStatus(req, businessId, body) {
        this.checkPlatformAccess(req);
        return this.adminService.updateBillingStatus(businessId, body.cycle, body);
    }
    getBusinessTypes(req) {
        this.checkPlatformAccess(req);
        return this.adminService.getBusinessTypes();
    }
    createBusinessType(req, body) {
        this.checkSuperAdmin(req);
        return this.adminService.createBusinessType(body);
    }
    updateBusinessType(req, id, body) {
        this.checkSuperAdmin(req);
        return this.adminService.updateBusinessType(id, body);
    }
    toggleBusinessTypeStatus(req, id, body) {
        this.checkSuperAdmin(req);
        return this.adminService.toggleBusinessTypeStatus(id, body.isActive);
    }
    getCities(req) {
        this.checkPlatformAccess(req);
        return this.adminService.getCities();
    }
    createCity(req, body) {
        this.checkSuperAdmin(req);
        return this.adminService.createCity(body);
    }
    updateCity(req, id, body) {
        this.checkSuperAdmin(req);
        return this.adminService.updateCity(id, body);
    }
    toggleCityStatus(req, id, body) {
        this.checkSuperAdmin(req);
        return this.adminService.toggleCityStatus(id, body.isActive);
    }
    async exportSystemData(req, res) {
        this.checkSuperAdmin(req);
        const backup = await this.adminService.createSystemBackup();
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${backup.filename}"`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
        res.setHeader('Content-Length', backup.sizeBytes);
        const stream = fs.createReadStream(backup.filePath);
        stream.pipe(res);
        const cleanup = () => {
            this.adminService.cleanupBackupFile(backup.filePath);
        };
        res.on('finish', cleanup);
        res.on('close', cleanup);
        stream.on('error', (err) => {
            cleanup();
            if (!res.headersSent) {
                res.status(500).json({ message: `Streaming backup failed: ${err.message}` });
            }
        });
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('businesses'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getBusinesses", null);
__decorate([
    (0, common_1.Put)('businesses/:id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "toggleStatus", null);
__decorate([
    (0, common_1.Put)('businesses/:id/featured'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "toggleFeatured", null);
__decorate([
    (0, common_1.Put)('businesses/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateBusiness", null);
__decorate([
    (0, common_1.Put)('businesses/:id/password'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "resetBusinessPassword", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Post)('users'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createPlatformUser", null);
__decorate([
    (0, common_1.Put)('users/:id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "toggleUserStatus", null);
__decorate([
    (0, common_1.Put)('users/:id/password'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "resetUserPassword", null);
__decorate([
    (0, common_1.Get)('orders'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)('billing'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('cycle')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getBillingOverview", null);
__decorate([
    (0, common_1.Put)('billing/:businessId/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('businessId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateBillingStatus", null);
__decorate([
    (0, common_1.Get)('business-types'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getBusinessTypes", null);
__decorate([
    (0, common_1.Post)('business-types'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createBusinessType", null);
__decorate([
    (0, common_1.Put)('business-types/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateBusinessType", null);
__decorate([
    (0, common_1.Put)('business-types/:id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "toggleBusinessTypeStatus", null);
__decorate([
    (0, common_1.Get)('cities'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getCities", null);
__decorate([
    (0, common_1.Post)('cities'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createCity", null);
__decorate([
    (0, common_1.Put)('cities/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateCity", null);
__decorate([
    (0, common_1.Put)('cities/:id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "toggleCityStatus", null);
__decorate([
    (0, common_1.Get)('backup/export'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "exportSystemData", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map