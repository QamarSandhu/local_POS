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
exports.Business = void 0;
const typeorm_1 = require("typeorm");
const business_membership_entity_1 = require("./business-membership.entity");
const business_settings_entity_1 = require("./business-settings.entity");
const category_entity_1 = require("./category.entity");
const product_entity_1 = require("./product.entity");
const order_entity_1 = require("./order.entity");
const business_billing_entity_1 = require("./business-billing.entity");
const business_type_entity_1 = require("./business-type.entity");
const city_entity_1 = require("./city.entity");
let Business = class Business {
};
exports.Business = Business;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Business.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Business.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Business.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Business.prototype, "logo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Business.prototype, "coverImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Business.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Business.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Business.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Business.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Business.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: 'PAY_PER_PRINT' }),
    __metadata("design:type", String)
], Business.prototype, "pricingPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Business.prototype, "posPrintsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Business.prototype, "activatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Business.prototype, "isFeatured", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Business.prototype, "suspendReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Business.prototype, "featuredUntil", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Business.prototype, "businessTypeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_type_entity_1.BusinessType, (businessType) => businessType.businesses, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'businessTypeId' }),
    __metadata("design:type", business_type_entity_1.BusinessType)
], Business.prototype, "businessType", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => business_membership_entity_1.BusinessMembership, membership => membership.business),
    __metadata("design:type", Array)
], Business.prototype, "memberships", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => business_settings_entity_1.BusinessSettings, settings => settings.business),
    __metadata("design:type", business_settings_entity_1.BusinessSettings)
], Business.prototype, "settings", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => category_entity_1.Category, category => category.business),
    __metadata("design:type", Array)
], Business.prototype, "categories", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_entity_1.Product, product => product.business),
    __metadata("design:type", Array)
], Business.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_entity_1.Order, order => order.business),
    __metadata("design:type", Array)
], Business.prototype, "orders", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => business_billing_entity_1.BusinessBilling, billing => billing.business),
    __metadata("design:type", Array)
], Business.prototype, "billings", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => city_entity_1.City, (city) => city.businesses),
    (0, typeorm_1.JoinTable)({
        name: 'business_cities',
        joinColumn: { name: 'businessId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'cityId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Business.prototype, "cities", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Business.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Business.prototype, "updatedAt", void 0);
exports.Business = Business = __decorate([
    (0, typeorm_1.Entity)('businesses')
], Business);
//# sourceMappingURL=business.entity.js.map