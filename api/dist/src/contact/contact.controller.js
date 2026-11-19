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
exports.AdminContactController = exports.ContactController = void 0;
const common_1 = require("@nestjs/common");
const contact_service_1 = require("./contact.service");
const contact_dto_1 = require("./dto/contact.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ContactController = class ContactController {
    constructor(contactService) {
        this.contactService = contactService;
    }
    getPublicSettings() {
        return this.contactService.getPublicSettings();
    }
    createMessage(dto) {
        return this.contactService.createMessage(dto);
    }
};
exports.ContactController = ContactController;
__decorate([
    (0, common_1.Get)('settings'),
    (0, common_1.Header)('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContactController.prototype, "getPublicSettings", null);
__decorate([
    (0, common_1.Post)('messages'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contact_dto_1.CreateContactMessageDto]),
    __metadata("design:returntype", void 0)
], ContactController.prototype, "createMessage", null);
exports.ContactController = ContactController = __decorate([
    (0, common_1.Controller)('contact'),
    __metadata("design:paramtypes", [contact_service_1.ContactService])
], ContactController);
let AdminContactController = class AdminContactController {
    constructor(contactService) {
        this.contactService = contactService;
    }
    checkSuperAdmin(req) {
        const isSuperAdmin = Boolean(req.user?.isSuperAdmin ||
            req.user?.roleId === 'SUPER_ADMIN' ||
            req.user?.platformRole === 'SUPER_ADMIN');
        if (!isSuperAdmin) {
            throw new common_1.ForbiddenException('Super Admin privileges required to manage contact settings and messages');
        }
    }
    getSettings(req) {
        this.checkSuperAdmin(req);
        return this.contactService.getSettings();
    }
    updateSettings(req, dto) {
        this.checkSuperAdmin(req);
        return this.contactService.updateSettings(dto);
    }
    getMessages(req, status) {
        this.checkSuperAdmin(req);
        return this.contactService.getMessages(status);
    }
    updateMessageStatus(req, id, body) {
        this.checkSuperAdmin(req);
        return this.contactService.updateMessageStatus(id, body.status);
    }
};
exports.AdminContactController = AdminContactController;
__decorate([
    (0, common_1.Get)('settings'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminContactController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Put)('settings'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, contact_dto_1.UpdateContactSettingsDto]),
    __metadata("design:returntype", void 0)
], AdminContactController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Get)('messages'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminContactController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Patch)('messages/:id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, contact_dto_1.UpdateMessageStatusDto]),
    __metadata("design:returntype", void 0)
], AdminContactController.prototype, "updateMessageStatus", null);
exports.AdminContactController = AdminContactController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('admin/contact'),
    __metadata("design:paramtypes", [contact_service_1.ContactService])
], AdminContactController);
//# sourceMappingURL=contact.controller.js.map