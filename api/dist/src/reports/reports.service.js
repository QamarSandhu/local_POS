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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../database/entities/order.entity");
const order_item_entity_1 = require("../database/entities/order-item.entity");
const date_range_util_1 = require("../common/utils/date-range.util");
let ReportsService = class ReportsService {
    constructor(ordersRepository, orderItemsRepository) {
        this.ordersRepository = ordersRepository;
        this.orderItemsRepository = orderItemsRepository;
    }
    async getDashboardStats(businessId, fromDate, toDate) {
        const { startDate, endDateExclusive, isFiltered } = (0, date_range_util_1.parseAndValidateDateRange)(fromDate, toDate);
        const applyDateFilter = (builder) => {
            if (isFiltered) {
                if (startDate) {
                    builder.andWhere('order.createdAt >= :startDate', { startDate });
                }
                if (endDateExclusive) {
                    builder.andWhere('order.createdAt < :endDateExclusive', { endDateExclusive });
                }
            }
        };
        const qb = this.ordersRepository.createQueryBuilder('order')
            .where('order.businessId = :businessId', { businessId })
            .andWhere('order.status IN (:...completedStatuses)', { completedStatuses: ['COMPLETED', 'DELIVERED'] })
            .andWhere('order.status NOT IN (:...excludedStatuses)', { excludedStatuses: ['CANCELLED', 'REJECTED'] })
            .andWhere('order.paymentStatus = :paidStatus', { paidStatus: 'PAID' });
        applyDateFilter(qb);
        const totalRaw = await qb
            .select('SUM(order.total)', 'totalSales')
            .addSelect('COUNT(order.id)', 'totalOrders')
            .getRawOne();
        const totalSales = parseFloat(totalRaw?.totalSales || '0');
        const totalOrders = parseInt(totalRaw?.totalOrders || '0', 10);
        const avgOrderValue = totalOrders > 0 ? parseFloat((totalSales / totalOrders).toFixed(2)) : 0;
        const posQb = this.ordersRepository.createQueryBuilder('order')
            .where('order.businessId = :businessId', { businessId })
            .andWhere('order.source = :source', { source: 'POS' })
            .andWhere('order.status IN (:...completedStatuses)', { completedStatuses: ['COMPLETED', 'DELIVERED'] })
            .andWhere('order.status NOT IN (:...excludedStatuses)', { excludedStatuses: ['CANCELLED', 'REJECTED'] })
            .andWhere('order.paymentStatus = :paidStatus', { paidStatus: 'PAID' })
            .select('SUM(order.total)', 'sales')
            .addSelect('COUNT(order.id)', 'count');
        applyDateFilter(posQb);
        const posRaw = await posQb.getRawOne();
        const marketplaceQb = this.ordersRepository.createQueryBuilder('order')
            .where('order.businessId = :businessId', { businessId })
            .andWhere('order.source = :source', { source: 'MARKETPLACE' })
            .andWhere('order.status IN (:...completedStatuses)', { completedStatuses: ['COMPLETED', 'DELIVERED'] })
            .andWhere('order.status NOT IN (:...excludedStatuses)', { excludedStatuses: ['CANCELLED', 'REJECTED'] })
            .andWhere('order.paymentStatus = :paidStatus', { paidStatus: 'PAID' })
            .select('SUM(order.total)', 'sales')
            .addSelect('COUNT(order.id)', 'count');
        applyDateFilter(marketplaceQb);
        const marketplaceRaw = await marketplaceQb.getRawOne();
        return {
            totalSales,
            totalOrders,
            avgOrderValue,
            posSales: parseFloat(posRaw?.sales || '0'),
            posOrders: parseInt(posRaw?.count || '0', 10),
            marketplaceSales: parseFloat(marketplaceRaw?.sales || '0'),
            marketplaceOrders: parseInt(marketplaceRaw?.count || '0', 10),
        };
    }
    async getSalesmanPerformance(businessId, fromDate, toDate) {
        const { startDate, endDateExclusive, isFiltered } = (0, date_range_util_1.parseAndValidateDateRange)(fromDate, toDate);
        const qb = this.ordersRepository.createQueryBuilder('order')
            .leftJoin('order.salesman', 'salesman')
            .where('order.businessId = :businessId', { businessId })
            .andWhere('order.status IN (:...completedStatuses)', { completedStatuses: ['COMPLETED', 'DELIVERED'] })
            .andWhere('order.status NOT IN (:...excludedStatuses)', { excludedStatuses: ['CANCELLED', 'REJECTED'] })
            .andWhere('order.paymentStatus = :paidStatus', { paidStatus: 'PAID' });
        if (isFiltered) {
            if (startDate) {
                qb.andWhere('order.createdAt >= :startDate', { startDate });
            }
            if (endDateExclusive) {
                qb.andWhere('order.createdAt < :endDateExclusive', { endDateExclusive });
            }
        }
        const results = await qb
            .select('COALESCE(salesman.name, \'Direct / Online\')', 'salesmanName')
            .addSelect('salesman.id', 'salesmanId')
            .addSelect('COUNT(order.id)', 'totalOrders')
            .addSelect('SUM(order.total)', 'totalSales')
            .groupBy('salesman.id')
            .addGroupBy('salesman.name')
            .orderBy('SUM(order.total)', 'DESC')
            .getRawMany();
        return results.map(r => {
            const orders = parseInt(r.totalOrders, 10);
            const sales = parseFloat(r.totalSales) || 0;
            return {
                salesmanId: r.salesmanId || 'unassigned',
                salesmanName: r.salesmanName,
                totalOrders: orders,
                totalSales: sales,
                avgOrder: orders > 0 ? parseFloat((sales / orders).toFixed(2)) : 0,
            };
        });
    }
    async getTopProducts(businessId, limit = 10, fromDate, toDate) {
        const { startDate, endDateExclusive, isFiltered } = (0, date_range_util_1.parseAndValidateDateRange)(fromDate, toDate);
        const qb = this.orderItemsRepository.createQueryBuilder('item')
            .leftJoin('item.order', 'order')
            .leftJoin('item.product', 'product')
            .where('order.businessId = :businessId', { businessId })
            .andWhere('order.status IN (:...completedStatuses)', { completedStatuses: ['COMPLETED', 'DELIVERED'] })
            .andWhere('order.status NOT IN (:...excludedStatuses)', { excludedStatuses: ['CANCELLED', 'REJECTED'] })
            .andWhere('order.paymentStatus = :paidStatus', { paidStatus: 'PAID' });
        if (isFiltered) {
            if (startDate) {
                qb.andWhere('order.createdAt >= :startDate', { startDate });
            }
            if (endDateExclusive) {
                qb.andWhere('order.createdAt < :endDateExclusive', { endDateExclusive });
            }
        }
        const results = await qb
            .select('item.productId', 'productId')
            .addSelect('COALESCE(product.name, \'Unknown Product\')', 'productName')
            .addSelect('SUM(item.quantity)', 'totalQuantity')
            .addSelect('SUM(item.quantity * item.price)', 'totalRevenue')
            .groupBy('item.productId')
            .addGroupBy('product.name')
            .orderBy('SUM(item.quantity)', 'DESC')
            .limit(limit)
            .getRawMany();
        return results.map(r => ({
            productId: r.productId,
            productName: r.productName,
            totalQuantity: parseInt(r.totalQuantity, 10),
            totalRevenue: parseFloat(r.totalRevenue) || 0,
        }));
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map