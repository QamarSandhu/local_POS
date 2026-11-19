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
var AppService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("./database/entities/role.entity");
const business_type_entity_1 = require("./database/entities/business-type.entity");
const business_entity_1 = require("./database/entities/business.entity");
const cities_service_1 = require("./cities/cities.service");
let AppService = AppService_1 = class AppService {
    constructor(roleRepo, businessTypeRepo, businessRepo, citiesService) {
        this.roleRepo = roleRepo;
        this.businessTypeRepo = businessTypeRepo;
        this.businessRepo = businessRepo;
        this.citiesService = citiesService;
        this.logger = new common_1.Logger(AppService_1.name);
    }
    async onApplicationBootstrap() {
        await this.ensureSystemRoles();
        await this.ensureDefaultBusinessTypes();
        await this.citiesService.ensureDefaultCities();
    }
    async ensureSystemRoles() {
        const rolesData = [
            { id: 'SUPER_ADMIN', name: 'Super Admin', permissions: ['*'] },
            { id: 'PLATFORM_MANAGER', name: 'Platform Manager', permissions: ['BUSINESS_VIEW', 'BUSINESS_UPDATE', 'REPORT_VIEW'] },
            {
                id: 'BUSINESS_OWNER',
                name: 'Business Owner',
                permissions: [
                    'BUSINESS_VIEW', 'BUSINESS_UPDATE', 'STAFF_VIEW', 'STAFF_CREATE', 'STAFF_UPDATE', 'STAFF_DELETE',
                    'PRODUCT_VIEW', 'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'PRODUCT_DELETE',
                    'CATEGORY_VIEW', 'CATEGORY_CREATE', 'CATEGORY_UPDATE', 'CATEGORY_DELETE',
                    'POS_ORDER_CREATE', 'POS_ORDER_VIEW', 'POS_ORDER_UPDATE', 'POS_ORDER_CANCEL',
                    'ONLINE_ORDER_VIEW', 'ONLINE_ORDER_ACCEPT', 'ONLINE_ORDER_REJECT', 'ONLINE_ORDER_UPDATE_STATUS',
                    'SALES_REPORT_VIEW', 'SALESMAN_REPORT_VIEW', 'REPORT_VIEW',
                    'MENU_VIEW', 'MENU_CREATE', 'MENU_UPDATE', 'MENU_DELETE', 'POS_VIEW', 'POS_CREATE',
                ],
            },
            {
                id: 'MANAGER',
                name: 'Manager',
                permissions: [
                    'PRODUCT_VIEW', 'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'PRODUCT_DELETE',
                    'CATEGORY_VIEW', 'CATEGORY_CREATE', 'CATEGORY_UPDATE', 'CATEGORY_DELETE',
                    'POS_ORDER_CREATE', 'POS_ORDER_VIEW', 'POS_ORDER_UPDATE', 'POS_ORDER_CANCEL',
                    'ONLINE_ORDER_VIEW', 'ONLINE_ORDER_ACCEPT', 'ONLINE_ORDER_REJECT', 'ONLINE_ORDER_UPDATE_STATUS',
                    'SALES_REPORT_VIEW', 'SALESMAN_REPORT_VIEW', 'REPORT_VIEW',
                    'MENU_VIEW', 'MENU_CREATE', 'MENU_UPDATE', 'MENU_DELETE', 'POS_VIEW', 'POS_CREATE',
                ],
            },
            {
                id: 'CASHIER',
                name: 'Cashier',
                permissions: [
                    'POS_VIEW', 'POS_CREATE', 'POS_ORDER_VIEW', 'POS_ORDER_CREATE',
                    'ONLINE_ORDER_VIEW', 'ONLINE_ORDER_UPDATE_STATUS', 'MENU_VIEW', 'PRODUCT_VIEW', 'CATEGORY_VIEW',
                ],
            },
            {
                id: 'SALESMAN',
                name: 'Salesman',
                permissions: ['POS_ORDER_VIEW', 'SALESMAN_REPORT_VIEW'],
            },
            {
                id: 'KITCHEN_STAFF',
                name: 'Kitchen Staff',
                permissions: ['POS_ORDER_VIEW', 'ONLINE_ORDER_VIEW', 'ONLINE_ORDER_UPDATE_STATUS'],
            },
            {
                id: 'CUSTOMER',
                name: 'Customer',
                permissions: ['ONLINE_ORDER_VIEW'],
            },
        ];
        try {
            for (const r of rolesData) {
                const existing = await this.roleRepo.findOne({ where: { id: r.id } });
                if (!existing) {
                    await this.roleRepo.save(this.roleRepo.create(r));
                    this.logger.log(`Initialized system role: ${r.id}`);
                }
            }
        }
        catch (err) {
            this.logger.error(`Error ensuring system roles: ${err.message}`);
        }
    }
    async ensureDefaultBusinessTypes() {
        const defaultTypes = [
            {
                name: 'Food',
                slug: 'food',
                description: 'Restaurants, Cafes, Bakeries & Artisan Food Outlets',
                icon: '🍔',
                isActive: true,
                displayOrder: 1,
            },
            {
                name: 'Clothing',
                slug: 'clothing',
                description: 'Apparel, Fashion, Footwear, Boutiques & Accessories',
                icon: '👕',
                isActive: true,
                displayOrder: 2,
            },
            {
                name: 'Other',
                slug: 'other',
                description: 'Electronics, Retail, Specialty Stores & General Outlets',
                icon: '🛍️',
                isActive: true,
                displayOrder: 3,
            },
        ];
        try {
            for (const dt of defaultTypes) {
                const existing = await this.businessTypeRepo.findOne({ where: { slug: dt.slug } });
                if (!existing) {
                    await this.businessTypeRepo.save(this.businessTypeRepo.create(dt));
                    this.logger.log(`Initialized business type: ${dt.name} (${dt.icon})`);
                }
            }
            const foodType = await this.businessTypeRepo.findOne({ where: { slug: 'food' } });
            if (foodType) {
                const unassignedBusinesses = await this.businessRepo.find({
                    where: { businessTypeId: (0, typeorm_2.IsNull)() },
                });
                if (unassignedBusinesses.length > 0) {
                    for (const b of unassignedBusinesses) {
                        b.businessTypeId = foodType.id;
                        await this.businessRepo.save(b);
                        this.logger.log(`Assigned existing business "${b.name}" to Food business type.`);
                    }
                }
            }
        }
        catch (err) {
            this.logger.error(`Error ensuring default business types: ${err.message}`);
        }
    }
    getHello() {
        return "Let's Buy It API running";
    }
};
exports.AppService = AppService;
exports.AppService = AppService = AppService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(1, (0, typeorm_1.InjectRepository)(business_type_entity_1.BusinessType)),
    __param(2, (0, typeorm_1.InjectRepository)(business_entity_1.Business)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        cities_service_1.CitiesService])
], AppService);
//# sourceMappingURL=app.service.js.map