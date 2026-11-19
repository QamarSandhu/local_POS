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
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../database/entities/order.entity");
const order_item_entity_1 = require("../database/entities/order-item.entity");
const order_item_addon_entity_1 = require("../database/entities/order-item-addon.entity");
const customer_entity_1 = require("../database/entities/customer.entity");
const business_entity_1 = require("../database/entities/business.entity");
const date_range_util_1 = require("../common/utils/date-range.util");
let OrdersService = OrdersService_1 = class OrdersService {
    getCached(key) {
        const entry = OrdersService_1.ordersCache.get(key);
        if (entry && entry.expiresAt > Date.now()) {
            return entry.data;
        }
        OrdersService_1.ordersCache.delete(key);
        return null;
    }
    setCache(key, data, ttlSeconds = 20) {
        if (OrdersService_1.ordersCache.size > 200) {
            OrdersService_1.ordersCache.clear();
        }
        OrdersService_1.ordersCache.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
    }
    static invalidateBusinessOrders(businessId) {
        for (const key of OrdersService_1.ordersCache.keys()) {
            if (key.startsWith(businessId)) {
                OrdersService_1.ordersCache.delete(key);
            }
        }
    }
    constructor(ordersRepository, customerRepository, dataSource) {
        this.ordersRepository = ordersRepository;
        this.customerRepository = customerRepository;
        this.dataSource = dataSource;
    }
    async findAll(businessId, fromDate, toDate) {
        const cacheKey = `${businessId}:all:${fromDate || ''}:${toDate || ''}`;
        const cached = this.getCached(cacheKey);
        if (cached)
            return cached;
        const { startDate, endDateExclusive, isFiltered } = (0, date_range_util_1.parseAndValidateDateRange)(fromDate, toDate);
        const qb = this.ordersRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'items')
            .leftJoinAndSelect('items.product', 'product')
            .leftJoinAndSelect('items.variant', 'variant')
            .leftJoinAndSelect('items.addons', 'addons')
            .leftJoinAndSelect('addons.addon', 'addonRef')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.salesman', 'salesman')
            .where('order.businessId = :businessId', { businessId })
            .orderBy('order.createdAt', 'DESC');
        if (isFiltered) {
            if (startDate) {
                qb.andWhere('order.createdAt >= :startDate', { startDate });
            }
            if (endDateExclusive) {
                qb.andWhere('order.createdAt < :endDateExclusive', { endDateExclusive });
            }
        }
        else {
            qb.take(100);
        }
        const results = await qb.getMany();
        this.setCache(cacheKey, results, 20);
        return results;
    }
    async findOne(businessId, id) {
        const order = await this.ordersRepository.findOne({
            where: { id, businessId },
            relations: [
                'items',
                'items.product',
                'items.variant',
                'items.addons',
                'items.addons.addon',
                'customer',
                'salesman',
            ],
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async create(businessId, salesmanId, data) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            let customerId = data.customerId;
            if (data.customerName && data.customerPhone) {
                let customer = await this.customerRepository.findOne({ where: { phone: data.customerPhone } });
                if (!customer) {
                    customer = this.customerRepository.create({
                        name: data.customerName,
                        phone: data.customerPhone,
                        email: data.customerEmail || null,
                        address: data.deliveryAddress || data.customerAddress || null,
                    });
                    customer = await queryRunner.manager.save(customer);
                }
                else {
                    if (data.customerName)
                        customer.name = data.customerName;
                    if (data.customerEmail)
                        customer.email = data.customerEmail;
                    if (data.deliveryAddress || data.customerAddress)
                        customer.address = data.deliveryAddress || data.customerAddress;
                    customer = await queryRunner.manager.save(customer);
                }
                customerId = customer.id;
            }
            if (data.clientOrderId) {
                const existingOrder = await this.ordersRepository.findOne({ where: { clientOrderId: data.clientOrderId, businessId } });
                if (existingOrder) {
                    await queryRunner.rollbackTransaction();
                    return existingOrder;
                }
            }
            const order = queryRunner.manager.create(order_entity_1.Order, {
                businessId,
                salesmanId: data.salesmanId || salesmanId || null,
                customerId: customerId || null,
                tableNumber: data.tableNumber || null,
                clientOrderId: data.clientOrderId || `ord-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
                source: data.source || 'POS',
                type: data.type || 'DINE_IN',
                deliveryAddress: data.deliveryAddress || null,
                customerNotes: data.customerNotes || null,
                status: data.status || 'COMPLETED',
                paymentStatus: data.paymentStatus || 'PAID',
                paymentMethod: data.paymentMethod || 'CASH',
                subtotal: Number(data.subtotal) || 0,
                tax: Number(data.tax ?? data.taxTotal ?? 0),
                discount: Number(data.discount ?? data.discountTotal ?? 0),
                deliveryFee: Number(data.deliveryFee ?? 0),
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
            OrdersService_1.invalidateBusinessOrders(businessId);
            if (data.source === 'POS' || !data.source) {
                await this.dataSource.getRepository(business_entity_1.Business).increment({ id: businessId }, 'posPrintsCount', 1).catch(() => null);
            }
            return this.findOne(businessId, savedOrder.id);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw new common_1.BadRequestException('Failed to create order: ' + error.message);
        }
        finally {
            await queryRunner.release();
        }
    }
    async syncOfflineOrders(businessId, salesmanId, ordersData) {
        const results = [];
        for (const orderData of ordersData) {
            try {
                const result = await this.create(businessId, salesmanId, orderData);
                results.push({ clientOrderId: orderData.clientOrderId, success: true, orderId: result.id });
            }
            catch (error) {
                results.push({ clientOrderId: orderData.clientOrderId, success: false, error: error.message });
            }
        }
        return results;
    }
    async getLiveOrders(businessId, fromDate, toDate) {
        const cacheKey = `${businessId}:live:${fromDate || ''}:${toDate || ''}`;
        const cached = this.getCached(cacheKey);
        if (cached)
            return cached;
        const { startDate, endDateExclusive, isFiltered } = (0, date_range_util_1.parseAndValidateDateRange)(fromDate, toDate);
        const qb = this.ordersRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'items')
            .leftJoinAndSelect('items.product', 'product')
            .leftJoinAndSelect('items.variant', 'variant')
            .leftJoinAndSelect('items.addons', 'addons')
            .leftJoinAndSelect('addons.addon', 'addonRef')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.salesman', 'salesman')
            .where('order.businessId = :businessId', { businessId })
            .andWhere('order.status IN (:...liveStatuses)', {
            liveStatuses: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'],
        })
            .orderBy('order.createdAt', 'ASC');
        if (isFiltered) {
            if (startDate) {
                qb.andWhere('order.createdAt >= :startDate', { startDate });
            }
            if (endDateExclusive) {
                qb.andWhere('order.createdAt < :endDateExclusive', { endDateExclusive });
            }
        }
        const results = await qb.getMany();
        this.setCache(cacheKey, results, 15);
        return results;
    }
    async updateStatus(businessId, id, status, paymentStatus, cancelReason, paymentMethod) {
        const order = await this.findOne(businessId, id);
        const validTransitions = {
            'PENDING': ['ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED', 'REJECTED'],
            'ACCEPTED': ['PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED', 'REJECTED'],
            'PREPARING': ['READY', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'],
            'READY': ['OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'],
            'OUT_FOR_DELIVERY': ['DELIVERED', 'COMPLETED', 'CANCELLED'],
            'DELIVERED': ['COMPLETED'],
            'COMPLETED': [],
            'CANCELLED': [],
            'REJECTED': [],
        };
        if (order.status !== status && validTransitions[order.status] && !validTransitions[order.status].includes(status)) {
            throw new common_1.BadRequestException(`Cannot transition order from ${order.status} to ${status}`);
        }
        order.status = status;
        if (paymentStatus) {
            order.paymentStatus = paymentStatus;
        }
        if (paymentMethod) {
            order.paymentMethod = paymentMethod;
        }
        if (cancelReason !== undefined) {
            order.cancelReason = cancelReason;
        }
        const saved = await this.ordersRepository.save(order);
        OrdersService_1.invalidateBusinessOrders(businessId);
        if (status === 'COMPLETED') {
            await this.dataSource.getRepository(business_entity_1.Business).increment({ id: businessId }, 'posPrintsCount', 1).catch(() => null);
        }
        return saved;
    }
};
exports.OrdersService = OrdersService;
OrdersService.ordersCache = new Map();
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], OrdersService);
//# sourceMappingURL=orders.service.js.map