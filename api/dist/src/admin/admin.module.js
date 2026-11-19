"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const admin_controller_1 = require("./admin.controller");
const admin_service_1 = require("./admin.service");
const backup_service_1 = require("./backup.service");
const business_entity_1 = require("../database/entities/business.entity");
const user_entity_1 = require("../database/entities/user.entity");
const order_entity_1 = require("../database/entities/order.entity");
const business_membership_entity_1 = require("../database/entities/business-membership.entity");
const business_billing_entity_1 = require("../database/entities/business-billing.entity");
const business_type_entity_1 = require("../database/entities/business-type.entity");
const cities_module_1 = require("../cities/cities.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([business_entity_1.Business, user_entity_1.User, order_entity_1.Order, business_membership_entity_1.BusinessMembership, business_billing_entity_1.BusinessBilling, business_type_entity_1.BusinessType]),
            cities_module_1.CitiesModule,
        ],
        controllers: [admin_controller_1.AdminController],
        providers: [admin_service_1.AdminService, backup_service_1.BackupService],
        exports: [admin_service_1.AdminService, backup_service_1.BackupService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map