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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItemAddon = void 0;
const typeorm_1 = require("typeorm");
const order_item_entity_1 = require("./order-item.entity");
const product_addon_entity_1 = require("./product-addon.entity");
let OrderItemAddon = class OrderItemAddon {
};
exports.OrderItemAddon = OrderItemAddon;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OrderItemAddon.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OrderItemAddon.prototype, "orderItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], OrderItemAddon.prototype, "addonId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], OrderItemAddon.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => order_item_entity_1.OrderItem, item => item.addons),
    (0, typeorm_1.JoinColumn)({ name: 'orderItemId' }),
    __metadata("design:type", order_item_entity_1.OrderItem)
], OrderItemAddon.prototype, "orderItem", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_addon_entity_1.ProductAddon, { onDelete: 'CASCADE', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'addonId' }),
    __metadata("design:type", product_addon_entity_1.ProductAddon)
], OrderItemAddon.prototype, "addon", void 0);
exports.OrderItemAddon = OrderItemAddon = __decorate([
    (0, typeorm_1.Entity)('order_item_addons')
], OrderItemAddon);
//# sourceMappingURL=order-item-addon.entity.js.map