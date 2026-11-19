import { ReportsService } from './reports.service';
export declare class ReportsController {
    private reportsService;
    constructor(reportsService: ReportsService);
    getDashboardStats(req: any, fromDate?: string, toDate?: string, startDate?: string, endDate?: string): Promise<{
        totalSales: number;
        totalOrders: number;
        avgOrderValue: number;
        posSales: number;
        posOrders: number;
        marketplaceSales: number;
        marketplaceOrders: number;
    }>;
    getSalesmanPerformance(req: any, fromDate?: string, toDate?: string, startDate?: string, endDate?: string): Promise<{
        salesmanId: any;
        salesmanName: any;
        totalOrders: number;
        totalSales: number;
        avgOrder: number;
    }[]>;
    getTopProducts(req: any, limit?: string, fromDate?: string, toDate?: string, startDate?: string, endDate?: string): Promise<{
        productId: any;
        productName: any;
        totalQuantity: number;
        totalRevenue: number;
    }[]>;
}
