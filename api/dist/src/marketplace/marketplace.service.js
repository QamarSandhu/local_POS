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
exports.MarketplaceService = void 0;
const orders_service_1 = require("../orders/orders.service");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const business_entity_1 = require("../database/entities/business.entity");
const category_entity_1 = require("../database/entities/category.entity");
const order_entity_1 = require("../database/entities/order.entity");
const order_item_entity_1 = require("../database/entities/order-item.entity");
const order_item_addon_entity_1 = require("../database/entities/order-item-addon.entity");
const customer_entity_1 = require("../database/entities/customer.entity");
const business_type_entity_1 = require("../database/entities/business-type.entity");
const city_entity_1 = require("../database/entities/city.entity");
let MarketplaceService = class MarketplaceService {
    constructor(businessRepository, categoryRepository, customerRepository, businessTypeRepository, cityRepository, dataSource) {
        this.businessRepository = businessRepository;
        this.categoryRepository = categoryRepository;
        this.customerRepository = customerRepository;
        this.businessTypeRepository = businessTypeRepository;
        this.cityRepository = cityRepository;
        this.dataSource = dataSource;
    }
    async getActiveCities() {
        return this.cityRepository.find({
            where: { isActive: true },
            order: { name: 'ASC' },
        });
    }
    async getActiveBusinessTypes() {
        const types = await this.businessTypeRepository.find({
            where: { isActive: true },
            order: { displayOrder: 'ASC', createdAt: 'ASC' },
            relations: ['businesses'],
        });
        return types.map((t) => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            description: t.description,
            icon: t.icon,
            displayOrder: t.displayOrder,
            businessCount: t.businesses ? t.businesses.filter((b) => b.isActive).length : 0,
        }));
    }
    async getBusinesses(typeIdOrSlug, cityIdOrSlug) {
        const query = this.businessRepository
            .createQueryBuilder('business')
            .leftJoinAndSelect('business.businessType', 'businessType')
            .leftJoinAndSelect('business.cities', 'city')
            .where('business.isActive = :isActive', { isActive: true });
        if (typeIdOrSlug && typeIdOrSlug !== 'ALL') {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(typeIdOrSlug);
            if (isUuid) {
                query.andWhere('(business.businessTypeId = :typeId OR businessType.slug = :slug OR LOWER(businessType.name) = :name)', {
                    typeId: typeIdOrSlug,
                    slug: typeIdOrSlug.toLowerCase(),
                    name: typeIdOrSlug.toLowerCase(),
                });
            }
            else {
                query.andWhere('(businessType.slug = :slug OR LOWER(businessType.name) = :name)', {
                    slug: typeIdOrSlug.toLowerCase(),
                    name: typeIdOrSlug.toLowerCase(),
                });
            }
        }
        if (cityIdOrSlug && cityIdOrSlug.toLowerCase() !== 'anywhere' && cityIdOrSlug !== 'ALL') {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cityIdOrSlug);
            const targetCity = await this.cityRepository.findOne({
                where: isUuid ? { id: cityIdOrSlug } : { slug: cityIdOrSlug.toLowerCase() },
            });
            if (!targetCity) {
                throw new common_1.NotFoundException('City not found');
            }
            if (!targetCity.isActive) {
                throw new common_1.BadRequestException('Selected city is currently inactive');
            }
            query.andWhere('(city.id = :cityId OR LOWER(business.city) LIKE LOWER(:cityName))', {
                cityId: targetCity.id,
                cityName: `%${targetCity.name}%`,
            });
        }
        query.orderBy('business.isFeatured', 'DESC').addOrderBy('business.createdAt', 'DESC');
        return query.getMany();
    }
    async getRestaurants(typeOrCity, cityIdOrSlug) {
        if (cityIdOrSlug !== undefined) {
            return this.getBusinesses(typeOrCity, cityIdOrSlug);
        }
        return this.getBusinesses('food', typeOrCity);
    }
    async getRestaurantMenu(slug) {
        const business = await this.businessRepository.findOne({
            where: { slug, isActive: true },
            relations: ['settings', 'cities'],
        });
        if (!business)
            throw new common_1.NotFoundException('Restaurant not found');
        const menu = await this.categoryRepository.find({
            where: { businessId: business.id },
            relations: ['products', 'products.variants', 'products.addons'],
            order: { order: 'ASC' },
        });
        return {
            business: {
                id: business.id,
                name: business.name,
                slug: business.slug,
                description: business.description,
                logo: business.logo,
                coverImage: business.coverImage,
                phone: business.phone,
                address: business.address,
                city: business.city,
                cities: business.cities || [],
                isFeatured: business.isFeatured,
                settings: business.settings,
            },
            menu,
        };
    }
    async checkout(data) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const business = await this.businessRepository.findOne({ where: { id: data.businessId } });
            let customer = await this.customerRepository.findOne({ where: { phone: data.customerPhone } });
            if (!customer) {
                customer = this.customerRepository.create({
                    name: data.customerName,
                    phone: data.customerPhone,
                    email: data.customerEmail || null,
                    address: data.deliveryAddress || null,
                });
                customer = await queryRunner.manager.save(customer);
            }
            else {
                if (data.customerName)
                    customer.name = data.customerName;
                if (data.customerEmail)
                    customer.email = data.customerEmail;
                if (data.deliveryAddress)
                    customer.address = data.deliveryAddress;
                customer = await queryRunner.manager.save(customer);
            }
            const clientOrderId = data.clientOrderId || `mkt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            const order = queryRunner.manager.create(order_entity_1.Order, {
                businessId: data.businessId,
                customerId: customer.id,
                clientOrderId,
                source: 'MARKETPLACE',
                type: data.type || 'DELIVERY',
                deliveryAddress: data.deliveryAddress || customer.address || null,
                customerNotes: data.customerNotes || null,
                status: 'PENDING',
                paymentStatus: 'PENDING',
                paymentMethod: data.paymentMethod || 'COD',
                subtotal: Number(data.subtotal) || 0,
                tax: Number(data.tax ?? data.taxTotal ?? 0),
                discount: 0,
                deliveryFee: Number(data.deliveryFee || 3.5),
                total: Number(data.total) || 0,
            });
            const savedOrder = await queryRunner.manager.save(order);
            if (data.items && data.items.length > 0) {
                for (const itemData of data.items) {
                    const orderItem = queryRunner.manager.create(order_item_entity_1.OrderItem, {
                        orderId: savedOrder.id,
                        productId: itemData.productId,
                        variantId: itemData.variantId || null,
                        quantity: itemData.quantity || 1,
                        price: Number(itemData.price ?? itemData.unitPrice ?? 0),
                    });
                    const savedItem = await queryRunner.manager.save(orderItem);
                    if (itemData.addons && itemData.addons.length > 0) {
                        const addons = itemData.addons.map((addonData) => {
                            return queryRunner.manager.create(order_item_addon_entity_1.OrderItemAddon, {
                                orderItemId: savedItem.id,
                                addonId: addonData.addonId,
                                price: Number(addonData.price ?? addonData.unitPrice ?? 0),
                            });
                        });
                        await queryRunner.manager.save(addons);
                    }
                }
            }
            await queryRunner.commitTransaction();
            orders_service_1.OrdersService.invalidateBusinessOrders(data.businessId);
            return {
                ...savedOrder,
                customer: {
                    id: customer.id,
                    name: customer.name,
                    phone: customer.phone,
                    email: customer.email,
                    address: customer.address,
                },
                businessPhone: business?.phone || null,
                businessName: business?.name || null,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw new common_1.BadRequestException('Checkout failed: ' + error.message);
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.MarketplaceService = MarketplaceService;
exports.MarketplaceService = MarketplaceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(business_entity_1.Business)),
    __param(1, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(2, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(3, (0, typeorm_1.InjectRepository)(business_type_entity_1.BusinessType)),
    __param(4, (0, typeorm_1.InjectRepository)(city_entity_1.City)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], MarketplaceService);
//# sourceMappingURL=marketplace.service.js.map