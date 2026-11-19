import { Repository } from 'typeorm';
import { Business } from '../database/entities/business.entity';
import { BusinessSettings } from '../database/entities/business-settings.entity';
import { BusinessBilling } from '../database/entities/business-billing.entity';
import { City } from '../database/entities/city.entity';
export declare class BusinessesService {
    private businessRepository;
    private settingsRepository;
    private billingRepository;
    private cityRepository;
    constructor(businessRepository: Repository<Business>, settingsRepository: Repository<BusinessSettings>, billingRepository: Repository<BusinessBilling>, cityRepository: Repository<City>);
    getProfile(businessId: string): Promise<Business>;
    updateProfile(businessId: string, updateData: Partial<Business> & {
        cityIds?: string[];
    }): Promise<Business>;
    getSettings(businessId: string): Promise<BusinessSettings>;
    updateSettings(businessId: string, updateData: Partial<BusinessSettings>): Promise<BusinessSettings>;
    getCurrentBillingCycle(): string;
    getOrCreateCurrentBilling(businessId: string, pricingPlan?: string): Promise<BusinessBilling>;
    getPricing(businessId: string): Promise<{
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
    updatePricingPlan(businessId: string, plan: string): Promise<{
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
    incrementPrintCount(businessId: string): Promise<{
        posPrintsCount: number;
        monthlyPrintsCount: number;
        billingCycle: string;
        amountDue: number;
        status: string;
    }>;
}
