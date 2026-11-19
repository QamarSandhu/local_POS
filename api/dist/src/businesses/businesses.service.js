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
exports.BusinessesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const business_entity_1 = require("../database/entities/business.entity");
const business_settings_entity_1 = require("../database/entities/business-settings.entity");
const business_billing_entity_1 = require("../database/entities/business-billing.entity");
const city_entity_1 = require("../database/entities/city.entity");
let BusinessesService = class BusinessesService {
    constructor(businessRepository, settingsRepository, billingRepository, cityRepository) {
        this.businessRepository = businessRepository;
        this.settingsRepository = settingsRepository;
        this.billingRepository = billingRepository;
        this.cityRepository = cityRepository;
    }
    async getProfile(businessId) {
        const business = await this.businessRepository.findOne({
            where: { id: businessId },
            relations: ['settings', 'businessType', 'cities'],
        });
        if (!business) {
            throw new common_1.NotFoundException('Business not found');
        }
        return business;
    }
    async updateProfile(businessId, updateData) {
        const business = await this.getProfile(businessId);
        const allowedUpdates = {};
        if (updateData.name !== undefined)
            allowedUpdates.name = updateData.name;
        if (updateData.logo !== undefined)
            allowedUpdates.logo = updateData.logo;
        if (updateData.coverImage !== undefined)
            allowedUpdates.coverImage = updateData.coverImage;
        if (updateData.phone !== undefined)
            allowedUpdates.phone = updateData.phone;
        if (updateData.address !== undefined)
            allowedUpdates.address = updateData.address;
        if (updateData.city !== undefined)
            allowedUpdates.city = updateData.city;
        if (updateData.description !== undefined)
            allowedUpdates.description = updateData.description;
        if (Object.keys(allowedUpdates).length > 0) {
            await this.businessRepository.update(businessId, allowedUpdates);
        }
        if (updateData.cityIds !== undefined && Array.isArray(updateData.cityIds)) {
            const existingCityIds = (business.cities || []).map((c) => c.id);
            const cities = [];
            for (const cid of updateData.cityIds) {
                const c = await this.cityRepository.findOne({ where: { id: cid } });
                if (!c) {
                    throw new common_1.BadRequestException(`City with ID ${cid} not found`);
                }
                if (!existingCityIds.includes(cid) && !c.isActive) {
                    throw new common_1.BadRequestException(`Cannot add inactive city "${c.name}". Only active cities can be assigned.`);
                }
                cities.push(c);
            }
            business.cities = cities;
            if (cities.length > 0) {
                business.city = cities[0].name;
            }
            await this.businessRepository.save(business);
        }
        return this.getProfile(businessId);
    }
    async getSettings(businessId) {
        let settings = await this.settingsRepository.findOne({ where: { businessId } });
        if (!settings) {
            settings = this.settingsRepository.create({ businessId });
            settings = await this.settingsRepository.save(settings);
        }
        return settings;
    }
    async updateSettings(businessId, updateData) {
        await this.getSettings(businessId);
        const allowedUpdates = {};
        if (updateData.deliveryEnabled !== undefined)
            allowedUpdates.deliveryEnabled = Boolean(updateData.deliveryEnabled);
        if (updateData.pickupEnabled !== undefined)
            allowedUpdates.pickupEnabled = Boolean(updateData.pickupEnabled);
        if (updateData.codEnabled !== undefined)
            allowedUpdates.codEnabled = Boolean(updateData.codEnabled);
        if (updateData.minimumOrder !== undefined)
            allowedUpdates.minimumOrder = Number(updateData.minimumOrder);
        if (updateData.minimumDeliveryOrder !== undefined)
            allowedUpdates.minimumDeliveryOrder = Number(updateData.minimumDeliveryOrder);
        if (updateData.deliveryCharges !== undefined)
            allowedUpdates.deliveryCharges = Number(updateData.deliveryCharges);
        if (updateData.freeDeliveryThreshold !== undefined) {
            allowedUpdates.freeDeliveryThreshold = updateData.freeDeliveryThreshold ? Number(updateData.freeDeliveryThreshold) : null;
        }
        if (updateData.deliveryRadius !== undefined)
            allowedUpdates.deliveryRadius = Number(updateData.deliveryRadius);
        if (updateData.taxPercentage !== undefined)
            allowedUpdates.taxPercentage = Number(updateData.taxPercentage);
        if (updateData.orderColumns !== undefined)
            allowedUpdates.orderColumns = updateData.orderColumns;
        if (Object.keys(allowedUpdates).length > 0) {
            await this.settingsRepository.update({ businessId }, allowedUpdates);
        }
        return this.getSettings(businessId);
    }
    getCurrentBillingCycle() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }
    async getOrCreateCurrentBilling(businessId, pricingPlan = 'PAY_PER_PRINT') {
        const cycle = this.getCurrentBillingCycle();
        let billing = await this.billingRepository.findOne({
            where: { businessId, billingCycle: cycle },
        });
        if (!billing) {
            const initialDue = pricingPlan === 'MONTHLY_FIXED' ? 3000 : 0;
            billing = this.billingRepository.create({
                businessId,
                billingCycle: cycle,
                plan: pricingPlan,
                printsCount: 0,
                amountDue: initialDue,
                amountPaid: 0,
                status: 'UNPAID',
            });
            billing = await this.billingRepository.save(billing);
        }
        return billing;
    }
    async getPricing(businessId) {
        const business = await this.getProfile(businessId);
        const plan = business.pricingPlan || 'PAY_PER_PRINT';
        const prints = business.posPrintsCount || 0;
        const currentBill = plan === 'MONTHLY_FIXED' ? 3000 : prints * 1;
        const currentBilling = await this.getOrCreateCurrentBilling(businessId, plan);
        return {
            pricingPlan: plan,
            posPrintsCount: prints,
            isActive: business.isActive,
            activatedAt: business.activatedAt,
            plans: {
                MONTHLY_FIXED: {
                    id: 'MONTHLY_FIXED',
                    name: 'Fixed Monthly Plan',
                    price: 3000,
                    currency: 'PKR',
                    frequency: 'per month',
                    description: 'Flat Rs. 3,000 / month with unlimited POS orders, receipts, and KDS usage.',
                    features: [
                        'Unlimited POS Orders & Receipts',
                        'No per-print transaction fees',
                        'Full Kitchen Display System (KDS)',
                        'Multi-Salesman & Staff Management',
                        'Advanced Financial Reports',
                    ],
                },
                PAY_PER_PRINT: {
                    id: 'PAY_PER_PRINT',
                    name: 'Pay As You Go (Zero Upfront)',
                    price: 0,
                    perPrintRate: 1,
                    currency: 'PKR',
                    frequency: 'Rs. 1 / receipt print',
                    description: 'Start with Rs. 0 upfront. Only pay Rs. 1 per thermal receipt printed on POS.',
                    features: [
                        'Zero Upfront / Monthly Subscription Fee',
                        'Rs. 1 per printed POS order receipt',
                        'Pay as your restaurant grows',
                        'Full POS Terminal & Menu Access',
                        'Cancel or switch plans anytime',
                    ],
                },
            },
            billingSummary: {
                currentBill,
                currency: 'PKR',
                isFixed: plan === 'MONTHLY_FIXED',
                totalPrints: prints,
            },
            currentMonthInvoice: {
                billingCycle: currentBilling.billingCycle,
                printsCount: currentBilling.printsCount,
                amountDue: Number(currentBilling.amountDue),
                amountPaid: Number(currentBilling.amountPaid),
                status: currentBilling.status,
                paidAt: currentBilling.paidAt,
                paymentMethod: currentBilling.paymentMethod,
            },
        };
    }
    async updatePricingPlan(businessId, plan) {
        if (!['MONTHLY_FIXED', 'PAY_PER_PRINT'].includes(plan)) {
            throw new common_1.BadRequestException('Invalid pricing plan. Must be MONTHLY_FIXED or PAY_PER_PRINT');
        }
        await this.businessRepository.update(businessId, { pricingPlan: plan });
        const cycle = this.getCurrentBillingCycle();
        const billing = await this.billingRepository.findOne({ where: { businessId, billingCycle: cycle } });
        if (billing && billing.status !== 'PAID') {
            billing.plan = plan;
            billing.amountDue = plan === 'MONTHLY_FIXED' ? 3000 : billing.printsCount * 1;
            await this.billingRepository.save(billing);
        }
        return this.getPricing(businessId);
    }
    async incrementPrintCount(businessId) {
        await this.businessRepository.increment({ id: businessId }, 'posPrintsCount', 1);
        const business = await this.businessRepository.findOne({
            where: { id: businessId },
            select: ['id', 'posPrintsCount', 'pricingPlan'],
        });
        const plan = business?.pricingPlan || 'PAY_PER_PRINT';
        const cycle = this.getCurrentBillingCycle();
        let billing = await this.billingRepository.findOne({
            where: { businessId, billingCycle: cycle },
        });
        if (!billing) {
            billing = this.billingRepository.create({
                businessId,
                billingCycle: cycle,
                plan,
                printsCount: 1,
                amountDue: plan === 'MONTHLY_FIXED' ? 3000 : 1,
                amountPaid: 0,
                status: 'UNPAID',
            });
            await this.billingRepository.save(billing);
        }
        else {
            billing.printsCount += 1;
            if (billing.status !== 'PAID') {
                billing.amountDue = plan === 'MONTHLY_FIXED' ? 3000 : billing.printsCount * 1;
            }
            billing.plan = plan;
            await this.billingRepository.save(billing);
        }
        return {
            posPrintsCount: business?.posPrintsCount || 0,
            monthlyPrintsCount: billing.printsCount,
            billingCycle: cycle,
            amountDue: Number(billing.amountDue),
            status: billing.status,
        };
    }
};
exports.BusinessesService = BusinessesService;
exports.BusinessesService = BusinessesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(business_entity_1.Business)),
    __param(1, (0, typeorm_1.InjectRepository)(business_settings_entity_1.BusinessSettings)),
    __param(2, (0, typeorm_1.InjectRepository)(business_billing_entity_1.BusinessBilling)),
    __param(3, (0, typeorm_1.InjectRepository)(city_entity_1.City)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BusinessesService);
//# sourceMappingURL=businesses.service.js.map