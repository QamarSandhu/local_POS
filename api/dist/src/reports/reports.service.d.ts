import { Repository } from 'typeorm';
import { Order } from '../database/entities/order.entity';
import { OrderItem } from '../database/entities/order-item.entity';
export declare class ReportsService {
    private ordersRepository;
    private orderItemsRepository;
    constructor(ordersRepository: Repository<Order>, orderItemsRepository: Repository<OrderItem>);
    getDashboardStats(businessId: string, fromDate?: string, toDate?: string): Promise<{
        totalSales: number;
        totalOrders: number;
        avgOrderValue: number;
        posSales: number;
        posOrders: number;
        marketplaceSales: number;
        marketplaceOrders: number;
    }>;
    getSalesmanPerformance(businessId: string, fromDate?: string, toDate?: string): Promise<{
        salesmanId: any;
        salesmanName: any;
        totalOrders: number;
        totalSales: number;
        avgOrder: number;
    }[]>;
    getTopProducts(businessId: string, limit?: number, fromDate?: string, toDate?: string): Promise<{
        productId: any;
        productName: any;
        totalQuantity: number;
        totalRevenue: number;
    }[]>;
}
