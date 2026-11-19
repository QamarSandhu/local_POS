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
exports.MarketplaceController = void 0;
const common_1 = require("@nestjs/common");
const marketplace_service_1 = require("./marketplace.service");
let MarketplaceController = class MarketplaceController {
    constructor(marketplaceService) {
        this.marketplaceService = marketplaceService;
    }
    getCities() {
        return this.marketplaceService.getActiveCities();
    }
    getBusinessTypes() {
        return this.marketplaceService.getActiveBusinessTypes();
    }
    getBusinesses(type, businessTypeId, cityId, city) {
        return this.marketplaceService.getBusinesses(type || businessTypeId, cityId || city);
    }
    getRestaurants(type, businessTypeId, cityId, city) {
        return this.marketplaceService.getRestaurants(type || businessTypeId, cityId || city);
    }
    getRestaurantMenu(slug) {
        return this.marketplaceService.getRestaurantMenu(slug);
    }
    checkout(body) {
        return this.marketplaceService.checkout(body);
    }
};
exports.MarketplaceController = MarketplaceController;
__decorate([
    (0, common_1.Get)('cities'),
    (0, common_1.Header)('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MarketplaceController.prototype, "getCities", null);
__decorate([
    (0, common_1.Get)('business-types'),
    (0, common_1.Header)('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MarketplaceController.prototype, "getBusinessTypes", null);
__decorate([
    (0, common_1.Get)('businesses'),
    (0, common_1.Header)('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('businessTypeId')),
    __param(2, (0, common_1.Query)('cityId')),
    __param(3, (0, common_1.Query)('city')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], MarketplaceController.prototype, "getBusinesses", null);
__decorate([
    (0, common_1.Get)('restaurants'),
    (0, common_1.Header)('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('businessTypeId')),
    __param(2, (0, common_1.Query)('cityId')),
    __param(3, (0, common_1.Query)('city')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], MarketplaceController.prototype, "getRestaurants", null);
__decorate([
    (0, common_1.Get)('restaurants/:slug'),
    (0, common_1.Header)('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MarketplaceController.prototype, "getRestaurantMenu", null);
__decorate([
    (0, common_1.Post)('checkout'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MarketplaceController.prototype, "checkout", null);
exports.MarketplaceController = MarketplaceController = __decorate([
    (0, common_1.Controller)('marketplace'),
    __metadata("design:paramtypes", [marketplace_service_1.MarketplaceService])
], MarketplaceController);
//# sourceMappingURL=marketplace.controller.js.map