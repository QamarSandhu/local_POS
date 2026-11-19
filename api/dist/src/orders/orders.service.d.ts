import { Repository, DataSource } from 'typeorm';
import { Order } from '../database/entities/order.entity';
import { Customer } from '../database/entities/customer.entity';
export declare class OrdersService {
    private ordersRepository;
    private customerRepository;
    private dataSource;
    private static ordersCache;
    private getCached;
    private setCache;
    static invalidateBusinessOrders(businessId: string): void;
    constructor(ordersRepository: Repository<Order>, customerRepository: Repository<Customer>, dataSource: DataSource);
    findAll(businessId: string, fromDate?: string, toDate?: string): Promise<any>;
    findOne(businessId: string, id: string): Promise<Order>;
    create(businessId: string, salesmanId: string, data: any): Promise<Order>;
    syncOfflineOrders(businessId: string, salesmanId: string, ordersData: any[]): Promise<({
        clientOrderId: any;
        success: boolean;
        orderId: string;
        error?: undefined;
    } | {
        clientOrderId: any;
        success: boolean;
        error: any;
        orderId?: undefined;
    })[]>;
    getLiveOrders(businessId: string, fromDate?: string, toDate?: string): Promise<any>;
    updateStatus(businessId: string, id: string, status: string, paymentStatus?: string, cancelReason?: string, paymentMethod?: string): Promise<Order>;
}
