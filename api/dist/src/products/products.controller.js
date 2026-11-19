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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const business_guard_1 = require("../auth/guards/business.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
let ProductsController = class ProductsController {
    constructor(productsService) {
        this.productsService = productsService;
    }
    findAll(req) {
        return this.productsService.findAll(req.user.activeBusinessId);
    }
    findOne(req, id) {
        return this.productsService.findOne(req.user.activeBusinessId, id);
    }
    create(req, body) {
        return this.productsService.create(req.user.activeBusinessId, body);
    }
    update(req, id, body) {
        return this.productsService.update(req.user.activeBusinessId, id, body);
    }
    remove(req, id) {
        return this.productsService.remove(req.user.activeBusinessId, id);
    }
    createVariant(req, productId, body) {
        return this.productsService.createVariant(req.user.activeBusinessId, productId, body);
    }
    removeVariant(req, productId, variantId) {
        return this.productsService.removeVariant(req.user.activeBusinessId, productId, variantId);
    }
    createAddon(req, productId, body) {
        return this.productsService.createAddon(req.user.activeBusinessId, productId, body);
    }
    removeAddon(req, productId, addonId) {
        return this.productsService.removeAddon(req.user.activeBusinessId, productId, addonId);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('MENU_VIEW'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('MENU_VIEW'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('MENU_CREATE'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "create", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('MENU_UPDATE'),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "update", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('MENU_DELETE'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "remove", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('MENU_CREATE'),
    (0, common_1.Post)(':id/variants'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "createVariant", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('MENU_DELETE'),
    (0, common_1.Delete)(':productId/variants/:variantId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('productId')),
    __param(2, (0, common_1.Param)('variantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "removeVariant", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('MENU_CREATE'),
    (0, common_1.Post)(':id/addons'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "createAddon", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('MENU_DELETE'),
    (0, common_1.Delete)(':productId/addons/:addonId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('productId')),
    __param(2, (0, common_1.Param)('addonId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "removeAddon", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, business_guard_1.BusinessGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('businesses/active/products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map