"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const businesses_service_1 = require("./businesses.service");
const businesses_controller_1 = require("./businesses.controller");
const business_entity_1 = require("../database/entities/business.entity");
const business_settings_entity_1 = require("../database/entities/business-settings.entity");
const business_billing_entity_1 = require("../database/entities/business-billing.entity");
const city_entity_1 = require("../database/entities/city.entity");
let BusinessesModule = class BusinessesModule {
};
exports.BusinessesModule = BusinessesModule;
exports.BusinessesModule = BusinessesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([business_entity_1.Business, business_settings_entity_1.BusinessSettings, business_billing_entity_1.BusinessBilling, city_entity_1.City])],
        providers: [businesses_service_1.BusinessesService],
        controllers: [businesses_controller_1.BusinessesController],
    })
], BusinessesModule);
//# sourceMappingURL=businesses.module.js.map