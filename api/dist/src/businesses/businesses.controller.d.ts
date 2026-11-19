import { BusinessesService } from './businesses.service';
import { Business } from '../database/entities/business.entity';
import { BusinessSettings } from '../database/entities/business-settings.entity';
export declare class BusinessesController {
    private businessesService;
    constructor(businessesService: BusinessesService);
    getProfile(req: any): Promise<Business>;
    updateProfile(req: any, body: Partial<Business>): Promise<Business>;
    getSettings(req: any): Promise<BusinessSettings>;
    updateSettings(req: any, body: Partial<BusinessSettings>): Promise<BusinessSettings>;
    getPricing(req: any): Promise<{
        pricingPlan: string;
        posPrintsCount: number;
        isActive: boolean;
        activatedAt: Date;
        plans: {
            MONTHLY_FIXED: {
                id: string;
                name: string;
                price: number;
                currency: string;
                frequency: string;
                description: string;
                features: string[];
            };
            PAY_PER_PRINT: {
                id: string;
                name: string;
                price: number;
                perPrintRate: number;
                currency: string;
                frequency: string;
                description: string;
                features: string[];
            };
        };
        billingSummary: {
            currentBill: number;
            currency: string;
            isFixed: boolean;
            totalPrints: number;
        };
        currentMonthInvoice: {
            billingCycle: string;
            printsCount: number;
            amountDue: number;
            amountPaid: number;
            status: string;
            paidAt: Date | null;
            paymentMethod: string | null;
        };
    }>;
    updatePricingPlan(req: any, plan: string): Promise<{
        pricingPlan: string;
        posPrintsCount: number;
        isActive: boolean;
        activatedAt: Date;
        plans: {
            MONTHLY_FIXED: {
                id: string;
                name: string;
                price: number;
                currency: string;
                frequency: string;
                description: string;
                features: string[];
            };
            PAY_PER_PRINT: {
                id: string;
                name: string;
                price: number;
                perPrintRate: number;
                currency: string;
                frequency: string;
                description: string;
                features: string[];
            };
        };
        billingSummary: {
            currentBill: number;
            currency: string;
            isFixed: boolean;
            totalPrints: number;
        };
        currentMonthInvoice: {
            billingCycle: string;
            printsCount: number;
            amountDue: number;
            amountPaid: number;
            status: string;
            paidAt: Date | null;
            paymentMethod: string | null;
        };
    }>;
    recordPosPrint(req: any): Promise<{
        posPrintsCount: number;
        monthlyPrintsCount: number;
        billingCycle: string;
        amountDue: number;
        status: string;
    }>;
}
