"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const marketplace_service_1 = require("./marketplace.service");
const marketplace_controller_1 = require("./marketplace.controller");
const business_entity_1 = require("../database/entities/business.entity");
const category_entity_1 = require("../database/entities/category.entity");
const order_entity_1 = require("../database/entities/order.entity");
const order_item_entity_1 = require("../database/entities/order-item.entity");
const order_item_addon_entity_1 = require("../database/entities/order-item-addon.entity");
const customer_entity_1 = require("../database/entities/customer.entity");
const business_type_entity_1 = require("../database/entities/business-type.entity");
const city_entity_1 = require("../database/entities/city.entity");
let MarketplaceModule = class MarketplaceModule {
};
exports.MarketplaceModule = MarketplaceModule;
exports.MarketplaceModule = MarketplaceModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([business_entity_1.Business, category_entity_1.Category, order_entity_1.Order, order_item_entity_1.OrderItem, order_item_addon_entity_1.OrderItemAddon, customer_entity_1.Customer, business_type_entity_1.BusinessType, city_entity_1.City])],
        providers: [marketplace_service_1.MarketplaceService],
        controllers: [marketplace_controller_1.MarketplaceController],
    })
], MarketplaceModule);
//# sourceMappingURL=marketplace.module.js.map