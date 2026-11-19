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
exports.MembershipsController = void 0;
const common_1 = require("@nestjs/common");
const memberships_service_1 = require("./memberships.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const business_guard_1 = require("../auth/guards/business.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
let MembershipsController = class MembershipsController {
    constructor(membershipsService) {
        this.membershipsService = membershipsService;
    }
    getStaff(req) {
        return this.membershipsService.getStaff(req.user.activeBusinessId);
    }
    getSalesmen(req) {
        return this.membershipsService.getSalesmen(req.user.activeBusinessId);
    }
    createStaff(req, body) {
        return this.membershipsService.createStaff(req.user.activeBusinessId, body);
    }
    inviteStaff(req, body) {
        return this.membershipsService.inviteStaff(req.user.activeBusinessId, body.email, body.roleId);
    }
    updateRole(req, id, body) {
        return this.membershipsService.updateStaffRole(req.user.activeBusinessId, id, body.roleId);
    }
    updateStaff(req, id, body) {
        return this.membershipsService.updateStaff(req.user.activeBusinessId, id, body);
    }
    removeStaff(req, id) {
        return this.membershipsService.removeStaff(req.user.activeBusinessId, id);
    }
};
exports.MembershipsController = MembershipsController;
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('STAFF_VIEW'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MembershipsController.prototype, "getStaff", null);
__decorate([
    (0, common_1.Get)('salesmen'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MembershipsController.prototype, "getSalesmen", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('STAFF_CREATE'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MembershipsController.prototype, "createStaff", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('STAFF_CREATE'),
    (0, common_1.Post)('invite'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MembershipsController.prototype, "inviteStaff", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('STAFF_UPDATE'),
    (0, common_1.Put)(':id/role'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], MembershipsController.prototype, "updateRole", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('STAFF_UPDATE'),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], MembershipsController.prototype, "updateStaff", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('STAFF_DELETE'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MembershipsController.prototype, "removeStaff", null);
exports.MembershipsController = MembershipsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, business_guard_1.BusinessGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('businesses/active/staff'),
    __metadata("design:paramtypes", [memberships_service_1.MembershipsService])
], MembershipsController);
//# sourceMappingURL=memberships.controller.js.map