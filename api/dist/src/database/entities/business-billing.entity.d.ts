import { Business } from './business.entity';
export declare class BusinessBilling {
    id: string;
    businessId: string;
    business: Business;
    billingCycle: string;
    plan: string;
    printsCount: number;
    amountDue: number;
    amountPaid: number;
    status: string;
    paidAt: Date | null;
    paymentMethod: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}
