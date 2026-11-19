import { OrdersService } from './orders.service';
export declare class OrdersController {
    private ordersService;
    constructor(ordersService: OrdersService);
    findAll(req: any, fromDate?: string, toDate?: string, startDate?: string, endDate?: string): Promise<any>;
    getLiveOrders(req: any, fromDate?: string, toDate?: string, startDate?: string, endDate?: string): Promise<any>;
    findOne(req: any, id: string): Promise<import("../database/entities").Order>;
    create(req: any, body: any): Promise<import("../database/entities").Order>;
    syncOfflineOrders(req: any, body: {
        orders: any[];
    }): Promise<({
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
    updateStatus(req: any, id: string, body: {
        status: string;
        paymentStatus?: string;
        cancelReason?: string;
        paymentMethod?: string;
    }): Promise<import("../database/entities").Order>;
}
